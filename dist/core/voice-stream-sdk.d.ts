import { TypedEventEmitter } from './event-emitter';
import type { VoiceStreamConfig, ConnectionState, VoiceStreamEventMap } from './types';
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
export declare class VoiceStreamSDK extends TypedEventEmitter<VoiceStreamEventMap> {
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
//# sourceMappingURL=voice-stream-sdk.d.ts.map