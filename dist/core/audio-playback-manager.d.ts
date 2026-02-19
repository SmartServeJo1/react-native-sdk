import { TypedEventEmitter } from './event-emitter';
import type { AudioPlaybackEventMap, ResolvedConfig } from './types';
/**
 * Manages audio playback of PCM16 data received from the server.
 * Uses react-native-audio-api (AudioContext) for low-latency playback.
 *
 * Mirrors iOS AudioPlaybackManager.swift
 */
export declare class AudioPlaybackManager extends TypedEventEmitter<AudioPlaybackEventMap> {
    private config;
    private audioContext;
    private bufferQueue;
    private isPlaying;
    private scheduledEndTime;
    private pendingBuffers;
    private drainCheckTimer;
    private initFailed;
    /** Volume amplification factor (matches iOS 3x) */
    private readonly VOLUME_FACTOR;
    constructor(config: ResolvedConfig);
    get playing(): boolean;
    get queueLength(): number;
    /**
     * Initialize the audio context for playback.
     */
    private ensureAudioContext;
    /**
     * Enqueue PCM16 audio data for playback.
     * Auto-starts playback if not already playing.
     */
    enqueueAudio(pcmData: ArrayBuffer): void;
    /**
     * Start playback and process the buffer queue.
     */
    private startPlayback;
    /**
     * Process queued audio buffers and schedule them for playback.
     */
    private processQueue;
    /**
     * Convert PCM16 data to an AudioBuffer and schedule it.
     */
    private scheduleBuffer;
    /**
     * Check if all buffers have been played (idle state).
     */
    private checkDrain;
    /**
     * Clear all queued audio and stop playback.
     */
    clearQueue(): void;
    cleanup(): void;
}
//# sourceMappingURL=audio-playback-manager.d.ts.map