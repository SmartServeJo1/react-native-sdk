export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';
export type VoiceStreamErrorCode = 'CONNECTION_FAILED' | 'AUTHENTICATION_FAILED' | 'DISCONNECTED' | 'RECONNECTION_FAILED' | 'AUDIO_CAPTURE_FAILED' | 'AUDIO_PLAYBACK_FAILED' | 'AUDIO_PERMISSION_DENIED' | 'INVALID_MESSAGE' | 'MESSAGE_SEND_FAILED' | 'UNKNOWN';
export interface VoiceStreamError {
    code: VoiceStreamErrorCode;
    message: string;
}
export interface VoiceStreamConfig {
    /** WebSocket server URL (required) */
    serverUrl: string;
    /** Unique tenant identifier (required) */
    tenantId: string;
    /** Tenant display name */
    tenantName?: string;
    /** Bearer token for authentication */
    authToken?: string;
    /** Enable automatic reconnection (default: true) */
    autoReconnect?: boolean;
    /** Max reconnection retries (default: 5, 0 = unlimited) */
    maxReconnectAttempts?: number;
    /** Initial reconnection delay ms (default: 1000) */
    reconnectDelayMs?: number;
    /** Max reconnection delay ms (default: 30000) */
    maxReconnectDelayMs?: number;
    /** Keep-alive ping interval ms (default: 30000) */
    pingIntervalMs?: number;
    /** Microphone capture sample rate Hz (default: 16000) */
    audioInputSampleRate?: number;
    /** Speaker playback sample rate Hz (default: 24000) */
    audioOutputSampleRate?: number;
    /** Audio channels (default: 1 = mono) */
    audioChannels?: number;
    /** Audio bit depth (default: 16) */
    audioBitDepth?: number;
    /** Audio buffer size in bytes (default: 1600) */
    audioBufferSize?: number;
    /** Enable debug logging (default: false) */
    enableDebugLogging?: boolean;
    /** AI Clinic Voice Pipe mode (default: false) */
    aiClinicMode?: boolean;
    /** Custom English filler phrase */
    fillerPhraseEn?: string;
    /** Custom Arabic filler phrase */
    fillerPhraseAr?: string;
}
export interface ResolvedConfig {
    serverUrl: string;
    tenantId: string;
    tenantName: string;
    authToken?: string;
    autoReconnect: boolean;
    maxReconnectAttempts: number;
    reconnectDelayMs: number;
    maxReconnectDelayMs: number;
    pingIntervalMs: number;
    audioInputSampleRate: number;
    audioOutputSampleRate: number;
    audioChannels: number;
    audioBitDepth: number;
    audioBufferSize: number;
    enableDebugLogging: boolean;
    aiClinicMode: boolean;
    fillerPhraseEn?: string;
    fillerPhraseAr?: string;
}
export interface TranscriptData {
    text: string;
    isFinal: boolean;
    language: string;
    requiresResponse: boolean;
}
export interface AssistantMessageData {
    text: string;
}
export interface LlmRequiredData {
    question: string;
}
export interface DiagnosticData {
    code: string;
    message: string;
}
export interface VoiceStreamEventMap {
    [key: string]: unknown;
    connected: void;
    disconnected: {
        reason: string;
    };
    error: VoiceStreamError;
    message: string;
    audioReceived: ArrayBuffer;
    audioSent: ArrayBuffer;
    transcript: TranscriptData;
    assistantMessage: AssistantMessageData;
    fillerStarted: void;
    llmRequired: LlmRequiredData;
    ready: void;
    interrupt: void;
    diagnostic: DiagnosticData;
    connectionStateChanged: ConnectionState;
}
export interface WSManagerEventMap {
    [key: string]: unknown;
    open: void;
    close: {
        code: number;
        reason: string;
    };
    error: string;
    textMessage: string;
    binaryMessage: ArrayBuffer;
    connectionStateChanged: ConnectionState;
}
export interface AudioCaptureEventMap {
    [key: string]: unknown;
    data: ArrayBuffer;
    error: VoiceStreamError;
}
export interface AudioPlaybackEventMap {
    [key: string]: unknown;
    started: void;
    idle: void;
    error: VoiceStreamError;
}
//# sourceMappingURL=types.d.ts.map