"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useVoiceChat = useVoiceChat;
const react_1 = require("react");
const voice_stream_sdk_1 = require("../../core/voice-stream-sdk");
let idCounter = 0;
function uniqueId() {
    return `msg_${Date.now()}_${++idCounter}`;
}
/**
 * Core state management hook for the voice chat widget.
 * Mirrors iOS VoiceChatViewModel.swift
 */
function useVoiceChat(config, options) {
    const [messages, setMessages] = (0, react_1.useState)([]);
    const [isExpanded, setIsExpanded] = (0, react_1.useState)(false);
    const [isStreaming, setIsStreaming] = (0, react_1.useState)(false);
    const [isConnected, setIsConnected] = (0, react_1.useState)(false);
    const [connectionState, setConnectionState] = (0, react_1.useState)('disconnected');
    const [subtitle, setSubtitle] = (0, react_1.useState)('Tap to start');
    const sdkRef = (0, react_1.useRef)(null);
    const optionsRef = (0, react_1.useRef)(options);
    optionsRef.current = options;
    // Initialize SDK once
    (0, react_1.useEffect)(() => {
        const sdk = new voice_stream_sdk_1.VoiceStreamSDK(config);
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
                setMessages((prev) => prev.filter((m) => !(m.type === 'user' && m.isInterim)));
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
            }
            else {
                // Update or add interim message
                setMessages((prev) => {
                    const interimIdx = prev.findIndex((m) => m.type === 'user' && m.isInterim);
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
    function addMessage(partial) {
        const msg = {
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
            if (prev.some((m) => m.type === 'thinking'))
                return prev;
            return [
                ...prev,
                {
                    id: uniqueId(),
                    type: 'thinking',
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
    async function handleLlmRequest(data) {
        const handler = optionsRef.current?.onLlmResponseRequired;
        if (!handler)
            return;
        try {
            const response = await handler(data);
            sdkRef.current?.sendLlmResponse(response);
            // Show the LLM response in the chat
            removeThinkingMessages();
            addMessage({
                type: 'assistant',
                text: response,
                language: 'en',
            });
        }
        catch (err) {
            removeThinkingMessages();
            addMessage({
                type: 'system',
                text: 'Failed to get AI response',
                language: 'en',
            });
        }
    }
    // ─── Actions ────────────────────────────────────────────────
    const toggleExpanded = (0, react_1.useCallback)(() => {
        setIsExpanded((prev) => {
            const next = !prev;
            // Auto-connect on first expand
            if (next && connectionState === 'disconnected') {
                sdkRef.current?.connect();
            }
            return next;
        });
    }, [connectionState]);
    const connect = (0, react_1.useCallback)(() => {
        sdkRef.current?.connect();
    }, []);
    const disconnect = (0, react_1.useCallback)(() => {
        sdkRef.current?.disconnect();
    }, []);
    const toggleMic = (0, react_1.useCallback)(async () => {
        const sdk = sdkRef.current;
        if (!sdk)
            return;
        if (sdk.isStreaming()) {
            sdk.stopAudioStreaming();
            setIsStreaming(false);
            setSubtitle('Mic off');
        }
        else {
            await sdk.startAudioStreaming();
            setIsStreaming(true);
            setSubtitle('Listening...');
        }
    }, []);
    const sendTextMessage = (0, react_1.useCallback)((text) => {
        const trimmed = text.trim();
        if (!trimmed)
            return;
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
//# sourceMappingURL=use-voice-chat.js.map