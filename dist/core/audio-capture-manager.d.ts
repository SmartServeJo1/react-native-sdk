import { TypedEventEmitter } from './event-emitter';
import type { AudioCaptureEventMap, ResolvedConfig } from './types';
/**
 * Manages microphone audio capture, providing raw PCM16 data.
 * Mirrors iOS AudioCaptureManager.swift
 */
export declare class AudioCaptureManager extends TypedEventEmitter<AudioCaptureEventMap> {
    private config;
    private isCapturing;
    private isMuted;
    private dataSubscription;
    constructor(config: ResolvedConfig);
    get capturing(): boolean;
    get muted(): boolean;
    /**
     * Request microphone permission.
     * Uses React Native's built-in PermissionsAndroid on Android.
     * On iOS, the native mic API triggers the permission prompt automatically.
     */
    requestPermission(): Promise<boolean>;
    /**
     * Start capturing audio from the microphone.
     * Emits 'data' events with ArrayBuffer of PCM16 audio.
     */
    startCapture(): Promise<void>;
    /**
     * Stop capturing audio.
     */
    stopCapture(): void;
    /**
     * Mute the microphone (discard frames without stopping capture).
     * Used by echo prevention to avoid latency of stop/start.
     */
    mute(): void;
    /**
     * Unmute the microphone (resume emitting frames).
     */
    unmute(): void;
    cleanup(): void;
}
//# sourceMappingURL=audio-capture-manager.d.ts.map