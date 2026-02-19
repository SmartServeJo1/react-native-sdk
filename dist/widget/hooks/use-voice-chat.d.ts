import type { VoiceStreamConfig, ConnectionState, VoiceStreamError, LlmRequiredData } from '../../core/types';
import type { ChatMessage } from '../types';
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
export declare function useVoiceChat(config: VoiceStreamConfig, options?: UseVoiceChatOptions): UseVoiceChatReturn;
export {};
//# sourceMappingURL=use-voice-chat.d.ts.map