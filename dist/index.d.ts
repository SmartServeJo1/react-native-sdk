import * as react_jsx_runtime from 'react/jsx-runtime';

/**
 * Lightweight typed event emitter for internal use.
 * Avoids external dependencies while providing full type safety.
 */
declare class TypedEventEmitter<EventMap extends Record<string, any> = Record<string, any>> {
    private listeners;
    on<K extends keyof EventMap>(event: K, callback: EventMap[K] extends void ? () => void : (data: EventMap[K]) => void): () => void;
    off<K extends keyof EventMap>(event: K, callback: Function): void;
    protected emit<K extends keyof EventMap>(...[event, data]: EventMap[K] extends void ? [K] : [K, EventMap[K]]): void;
    removeAllListeners(): void;
}

type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';
type VoiceStreamErrorCode = 'CONNECTION_FAILED' | 'AUTHENTICATION_FAILED' | 'DISCONNECTED' | 'RECONNECTION_FAILED' | 'AUDIO_CAPTURE_FAILED' | 'AUDIO_PLAYBACK_FAILED' | 'AUDIO_PERMISSION_DENIED' | 'INVALID_MESSAGE' | 'MESSAGE_SEND_FAILED' | 'UNKNOWN';
interface VoiceStreamError {
    code: VoiceStreamErrorCode;
    message: string;
}
interface VoiceStreamConfig {
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
interface ResolvedConfig {
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
interface TranscriptData {
    text: string;
    isFinal: boolean;
    language: string;
    requiresResponse: boolean;
}
interface AssistantMessageData {
    text: string;
}
interface LlmRequiredData {
    question: string;
}
interface DiagnosticData {
    code: string;
    message: string;
}
interface VoiceStreamEventMap {
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

/**
 * Main VoiceStreamSDK class — orchestrates WebSocket, audio capture,
 * audio playback, and echo prevention.
 *
 * Mirrors iOS VoiceStreamSDK.swift
 *
 * Usage:
 *   const sdk = new VoiceStreamSDK({ serverUrl: '...', tenantId: '...' });
 *   sdk.on('connected', () => sdk.startAudioStreaming());
 *   sdk.on('transcript', (data) => console.log(data.text));
 *   await sdk.connect();
 */
declare class VoiceStreamSDK extends TypedEventEmitter<VoiceStreamEventMap> {
    private config;
    private wsManager;
    private captureManager;
    private playbackManager;
    private echoPrevention;
    private _streaming;
    private unsubscribers;
    constructor(config: VoiceStreamConfig);
    /**
     * Connect to the voice streaming server.
     */
    connect(): void;
    /**
     * Disconnect from the server.
     */
    disconnect(): void;
    /**
     * Whether the SDK is connected to the server.
     */
    isConnected(): boolean;
    /**
     * Current connection state.
     */
    getConnectionState(): ConnectionState;
    /**
     * Start bidirectional audio streaming (mic capture + speaker playback).
     */
    startAudioStreaming(): Promise<void>;
    /**
     * Stop audio streaming.
     */
    stopAudioStreaming(): void;
    /**
     * Whether audio streaming is active.
     */
    isStreaming(): boolean;
    /**
     * Ensure playback-only mode (no capture). Used for greeting audio.
     */
    ensurePlayback(): void;
    /**
     * Send a raw text message over WebSocket.
     */
    sendMessage(text: string): void;
    /**
     * Send a chat message (AI Clinic mode).
     */
    sendChatMessage(text: string): void;
    /**
     * Send an LLM response to be spoken via TTS (AI Clinic mode).
     */
    sendLlmResponse(text: string): void;
    /**
     * Clear queued audio and force-unmute the mic.
     */
    clearAudioQueue(): void;
    /**
     * Clean up all resources. Call when done with the SDK.
     */
    cleanup(): void;
    private wireWebSocketEvents;
    private wireAudioCaptureEvents;
    private routeTextMessage;
}

/**
 * Resolves a partial VoiceStreamConfig into a fully-populated ResolvedConfig
 * by applying default values for any unspecified fields.
 */
declare function resolveConfig(config: VoiceStreamConfig): ResolvedConfig;

interface VoiceChatTheme {
    /** Primary brand color */
    primaryColor: string;
    /** Lighter shade of primary */
    primaryColorLight: string;
    /** Panel background color */
    backgroundColor: string;
    /** Primary text color */
    textColor: string;
    /** User bubble background */
    userBubbleColor: string;
    /** User bubble text color */
    userBubbleTextColor: string;
    /** Assistant bubble background */
    assistantBubbleColor: string;
    /** Assistant bubble text color */
    assistantBubbleTextColor: string;
    /** System message text color */
    systemMessageColor: string;
    /** Header gradient start */
    headerGradientStart: string;
    /** Header gradient end */
    headerGradientEnd: string;
    /** Active mic button color */
    micActiveColor: string;
    /** Connected status dot color */
    connectedDotColor: string;
    /** Disconnected status dot color */
    disconnectedDotColor: string;
    /** FAB diameter */
    fabSize: number;
    /** Chat panel max width */
    panelMaxWidth: number;
    /** Chat panel max height */
    panelMaxHeight: number;
    /** Panel border radius */
    borderRadius: number;
    /** Font family (System default) */
    fontFamily: string;
}
declare const DEFAULT_THEME: VoiceChatTheme;
/**
 * Merge user's partial theme with defaults.
 */
declare function resolveTheme(partial?: Partial<VoiceChatTheme>): VoiceChatTheme;

type ChatMessageType = 'user' | 'assistant' | 'system' | 'thinking';
interface ChatMessage {
    id: string;
    type: ChatMessageType;
    text: string;
    language: string;
    timestamp: number;
    isInterim: boolean;
}
interface VoiceChatWidgetProps {
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

/**
 * Drop-in voice chat widget with floating action button.
 * Renders a FAB that expands into a full chat panel.
 *
 * Mirrors iOS VoiceChatView.swift
 *
 * Usage:
 *   <VoiceChatWidget
 *     config={{ serverUrl: '...', tenantId: '...' }}
 *     theme={{ primaryColor: '#6366F1' }}
 *     onLlmResponseRequired={async ({ question }) => await myLLM(question)}
 *   />
 */
declare function VoiceChatWidget({ config, theme: themeOverrides, position, onConnectionStateChanged, onError, onLlmResponseRequired, }: VoiceChatWidgetProps): react_jsx_runtime.JSX.Element;

interface UseVoiceChatOptions {
    onConnectionStateChanged?: (state: ConnectionState) => void;
    onError?: (error: VoiceStreamError) => void;
    onLlmResponseRequired?: (data: LlmRequiredData) => Promise<string>;
}
interface UseVoiceChatReturn {
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
declare function useVoiceChat(config: VoiceStreamConfig, options?: UseVoiceChatOptions): UseVoiceChatReturn;

/**
 * Decode PCM16 little-endian bytes into Float32 samples (-1.0 to 1.0).
 */
declare function decodePCM16LEToFloat32(pcmBytes: ArrayBuffer): Float32Array;
/**
 * Encode Float32 samples into PCM16 little-endian bytes.
 */
declare function encodeFloat32ToPCM16LE(float32: Float32Array): ArrayBuffer;
/**
 * Amplify PCM16 audio data by a given factor with clamping.
 * Matches iOS SDK's 3x volume amplification.
 */
declare function amplifyPCM16(pcmData: ArrayBuffer, factor: number): ArrayBuffer;
/**
 * Convert a base64 string to an ArrayBuffer.
 */
declare function base64ToArrayBuffer(base64: string): ArrayBuffer;
/**
 * Convert an ArrayBuffer to a base64 string.
 */
declare function arrayBufferToBase64(buffer: ArrayBuffer): string;

export { type AssistantMessageData, type ChatMessage, type ChatMessageType, type ConnectionState, DEFAULT_THEME, type DiagnosticData, type LlmRequiredData, type ResolvedConfig, type TranscriptData, type VoiceChatTheme, VoiceChatWidget, type VoiceChatWidgetProps, type VoiceStreamConfig, type VoiceStreamError, type VoiceStreamErrorCode, type VoiceStreamEventMap, VoiceStreamSDK, amplifyPCM16, arrayBufferToBase64, base64ToArrayBuffer, decodePCM16LEToFloat32, encodeFloat32ToPCM16LE, resolveConfig, resolveTheme, useVoiceChat };
