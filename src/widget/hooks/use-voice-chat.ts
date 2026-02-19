import { useState, useRef, useEffect, useCallback } from 'react';
import { VoiceStreamSDK } from '../../core/voice-stream-sdk';
import type {
  VoiceStreamConfig,
  ConnectionState,
  VoiceStreamError,
  LlmRequiredData,
} from '../../core/types';
import type { ChatMessage } from '../types';

let idCounter = 0;
function uniqueId(): string {
  return `msg_${Date.now()}_${++idCounter}`;
}

interface UseVoiceChatOptions {
  onConnectionStateChanged?: (state: ConnectionState) => void;
  onError?: (error: VoiceStreamError) => void;
  onLlmResponseRequired?: (data: LlmRequiredData) => Promise<string>;
}

export interface UseVoiceChatReturn {
  messages: ChatMessage[];
  isExpanded: boolean;
  isStreaming: boolean;
  isConnected: boolean;
  connectionState: ConnectionState;
  subtitle: string;
  toggleExpanded: () => void;
  connect: () => void;
  disconnect: () => void;
  toggleMic: () => Promise<void>;
  sendTextMessage: (text: string) => void;
}

/**
 * Core state management hook for the voice chat widget.
 * Mirrors iOS VoiceChatViewModel.swift
 */
export function useVoiceChat(
  config: VoiceStreamConfig,
  options?: UseVoiceChatOptions,
): UseVoiceChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [subtitle, setSubtitle] = useState('Tap to start');

  const sdkRef = useRef<VoiceStreamSDK | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  // Initialize SDK once
  useEffect(() => {
    const sdk = new VoiceStreamSDK(config);
    sdkRef.current = sdk;

    // Connection state
    sdk.on('connectionStateChanged', (state) => {
      setConnectionState(state);
      setIsConnected(state === 'connected');
      optionsRef.current?.onConnectionStateChanged?.(state);

      switch (state) {
        case 'connecting':
          setSubtitle('Connecting...');
          break;
        case 'connected':
          setSubtitle('Connected');
          break;
        case 'reconnecting':
          setSubtitle('Reconnecting...');
          break;
        case 'disconnected':
          setSubtitle('Tap to start');
          setIsStreaming(false);
          break;
      }
    });

    // Error
    sdk.on('error', (error) => {
      optionsRef.current?.onError?.(error);
      addMessage({
        type: 'system',
        text: error.message,
        language: 'en',
      });
    });

    // Transcript (user speech)
    sdk.on('transcript', (data) => {
      if (data.isFinal) {
        // Remove interim messages
        setMessages((prev) =>
          prev.filter((m) => !(m.type === 'user' && m.isInterim)),
        );
        addMessage({
          type: 'user',
          text: data.text,
          language: data.language,
          isInterim: false,
        });

        // If response needed, show thinking and call LLM delegate
        if (data.requiresResponse) {
          addThinkingMessage();
          handleLlmRequest({ question: data.text });
        }
      } else {
        // Update or add interim message
        setMessages((prev) => {
          const interimIdx = prev.findIndex(
            (m) => m.type === 'user' && m.isInterim,
          );
          if (interimIdx >= 0) {
            const updated = [...prev];
            updated[interimIdx] = { ...updated[interimIdx], text: data.text };
            return updated;
          }
          return [
            ...prev,
            {
              id: uniqueId(),
              type: 'user',
              text: data.text,
              language: data.language,
              timestamp: Date.now(),
              isInterim: true,
            },
          ];
        });
      }
    });

    // Assistant message
    sdk.on('assistantMessage', (data) => {
      removeThinkingMessages();
      addMessage({
        type: 'assistant',
        text: data.text,
        language: 'en',
      });
    });

    // LLM required
    sdk.on('llmRequired', (data) => {
      addThinkingMessage();
      handleLlmRequest(data);
    });

    // Filler started (show thinking)
    sdk.on('fillerStarted', () => {
      addThinkingMessage();
    });

    // Ready
    sdk.on('ready', () => {
      setSubtitle('Ready');
    });

    // Interrupt
    sdk.on('interrupt', () => {
      removeThinkingMessages();
    });

    return () => {
      sdk.cleanup();
      sdkRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.serverUrl, config.tenantId]);

  // ─── Helpers ────────────────────────────────────────────────

  function addMessage(partial: { type: ChatMessage['type']; text: string; language?: string; isInterim?: boolean }) {
    const msg: ChatMessage = {
      id: uniqueId(),
      type: partial.type,
      text: partial.text,
      language: partial.language ?? 'en',
      timestamp: Date.now(),
      isInterim: partial.isInterim ?? false,
    };
    setMessages((prev) => [...prev, msg]);
  }

  function addThinkingMessage() {
    setMessages((prev) => {
      // Don't add if one already exists
      if (prev.some((m) => m.type === 'thinking')) return prev;
      return [
        ...prev,
        {
          id: uniqueId(),
          type: 'thinking' as const,
          text: '',
          language: 'en',
          timestamp: Date.now(),
          isInterim: false,
        },
      ];
    });
  }

  function removeThinkingMessages() {
    setMessages((prev) => prev.filter((m) => m.type !== 'thinking'));
  }

  async function handleLlmRequest(data: LlmRequiredData) {
    const handler = optionsRef.current?.onLlmResponseRequired;
    if (!handler) return;

    try {
      const response = await handler(data);
      sdkRef.current?.sendLlmResponse(response);
    } catch (err) {
      removeThinkingMessages();
      addMessage({
        type: 'system',
        text: 'Failed to get AI response',
        language: 'en',
      });
    }
  }

  // ─── Actions ────────────────────────────────────────────────

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => {
      const next = !prev;
      // Auto-connect on first expand
      if (next && connectionState === 'disconnected') {
        sdkRef.current?.connect();
      }
      return next;
    });
  }, [connectionState]);

  const connect = useCallback(() => {
    sdkRef.current?.connect();
  }, []);

  const disconnect = useCallback(() => {
    sdkRef.current?.disconnect();
  }, []);

  const toggleMic = useCallback(async () => {
    const sdk = sdkRef.current;
    if (!sdk) return;

    if (sdk.isStreaming()) {
      sdk.stopAudioStreaming();
      setIsStreaming(false);
      setSubtitle('Mic off');
    } else {
      await sdk.startAudioStreaming();
      setIsStreaming(true);
      setSubtitle('Listening...');
    }
  }, []);

  const sendTextMessage = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    addMessage({
      type: 'user',
      text: trimmed,
      language: 'en',
    });

    sdkRef.current?.sendChatMessage(trimmed);
    addThinkingMessage();
  }, []);

  return {
    messages,
    isExpanded,
    isStreaming,
    isConnected,
    connectionState,
    subtitle,
    toggleExpanded,
    connect,
    disconnect,
    toggleMic,
    sendTextMessage,
  };
}
