import type { VoiceStreamConfig, ConnectionState, VoiceStreamError, LlmRequiredData } from '../core/types';
import type { VoiceChatTheme } from './theme';
export type ChatMessageType = 'user' | 'assistant' | 'system' | 'thinking';
export interface ChatMessage {
    id: string;
    type: ChatMessageType;
    text: string;
    language: string;
    timestamp: number;
    isInterim: boolean;
}
export interface VoiceChatWidgetProps {
    /** SDK configuration (serverUrl, tenantId, etc.) */
    config: VoiceStreamConfig;
    /** Theme overrides */
    theme?: Partial<VoiceChatTheme>;
    /** FAB position */
    position?: 'bottom-right' | 'bottom-left';
    /** Called when connection state changes */
    onConnectionStateChanged?: (state: ConnectionState) => void;
    /** Called on error */
    onError?: (error: VoiceStreamError) => void;
    /** Called when the AI needs an LLM response (AI Clinic mode) */
    onLlmResponseRequired?: (data: LlmRequiredData) => Promise<string>;
}
export interface ChatPanelProps {
    theme: VoiceChatTheme;
    messages: ChatMessage[];
    connectionState: ConnectionState;
    isStreaming: boolean;
    subtitle: string;
    onClose: () => void;
    onSendText: (text: string) => void;
    onMicToggle: () => void;
}
export interface FloatingButtonProps {
    theme: VoiceChatTheme;
    isExpanded: boolean;
    onPress: () => void;
    position: 'bottom-right' | 'bottom-left';
}
export interface ChatHeaderProps {
    theme: VoiceChatTheme;
    connectionState: ConnectionState;
    subtitle: string;
    onClose: () => void;
}
export interface MessageBubbleProps {
    message: ChatMessage;
    theme: VoiceChatTheme;
}
export interface InputBarProps {
    theme: VoiceChatTheme;
    isStreaming: boolean;
    isConnected: boolean;
    onSendText: (text: string) => void;
    onMicToggle: () => void;
}
export interface MicButtonProps {
    theme: VoiceChatTheme;
    isStreaming: boolean;
    isConnected: boolean;
    onPress: () => void;
}
//# sourceMappingURL=types.d.ts.map