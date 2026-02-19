"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioPlaybackManager = void 0;
const event_emitter_1 = require("./event-emitter");
const audio_format_1 = require("./utils/audio-format");
const logger_1 = require("./utils/logger");
/**
 * Manages audio playback of PCM16 data received from the server.
 * Uses react-native-audio-api (AudioContext) for low-latency playback.
 *
 * Mirrors iOS AudioPlaybackManager.swift
 */
class AudioPlaybackManager extends event_emitter_1.TypedEventEmitter {
    constructor(config) {
        super();
        this.audioContext = null; // AudioContext from react-native-audio-api
        this.bufferQueue = [];
        this.isPlaying = false;
        this.scheduledEndTime = 0;
        this.idleCheckTimer = null;
        this.initFailed = false; // Stop retrying after first failure
        /** Volume amplification factor (matches iOS 3x) */
        this.VOLUME_FACTOR = 3.0;
        /** How often to check if playback has finished (ms) */
        this.IDLE_CHECK_INTERVAL_MS = 200;
        this.config = config;
    }
    get playing() {
        return this.isPlaying;
    }
    /**
     * Initialize the audio context for playback.
     */
    ensureAudioContext() {
        if (this.audioContext)
            return;
        if (this.initFailed)
            return;
        try {
            const AudioAPI = require('react-native-audio-api');
            // Configure audio session for both playback and recording
            if (AudioAPI.AudioManager) {
                AudioAPI.AudioManager.setAudioSessionOptions({
                    iosCategory: 'playAndRecord',
                    iosMode: 'voiceChat',
                    iosOptions: ['defaultToSpeaker', 'allowBluetooth'],
                });
            }
            this.audioContext = new AudioAPI.AudioContext({
                sampleRate: this.config.audioOutputSampleRate,
            });
            (0, logger_1.logDebug)('AudioContext created at', this.config.audioOutputSampleRate, 'Hz');
        }
        catch (err) {
            this.initFailed = true;
            (0, logger_1.logError)('Failed to create AudioContext:', err);
            throw new Error('react-native-audio-api is required for audio playback. ' +
                'Install it with: npm install react-native-audio-api');
        }
    }
    /**
     * Enqueue PCM16 audio data for playback.
     * Auto-starts playback if not already playing.
     */
    enqueueAudio(pcmData) {
        if (this.initFailed)
            return;
        // Amplify audio (3x volume, matching iOS)
        const amplified = (0, audio_format_1.amplifyPCM16)(pcmData, this.VOLUME_FACTOR);
        this.bufferQueue.push(amplified);
        if (!this.isPlaying) {
            this.startPlayback();
        }
        else {
            this.processQueue();
        }
    }
    /**
     * Start playback and process the buffer queue.
     */
    startPlayback() {
        try {
            this.ensureAudioContext();
            if (!this.audioContext)
                return;
            this.isPlaying = true;
            this.scheduledEndTime = this.audioContext.currentTime;
            this.emit('started');
            (0, logger_1.logDebug)('Playback started');
            this.processQueue();
            this.startIdleCheck();
        }
        catch (err) {
            (0, logger_1.logError)('Playback start failed:', err);
            const error = {
                code: 'AUDIO_PLAYBACK_FAILED',
                message: `Failed to start playback: ${err}`,
            };
            this.emit('error', error);
        }
    }
    /**
     * Process queued audio buffers and schedule them for playback.
     */
    processQueue() {
        if (!this.audioContext || this.bufferQueue.length === 0)
            return;
        while (this.bufferQueue.length > 0) {
            const pcmData = this.bufferQueue.shift();
            this.scheduleBuffer(pcmData);
        }
    }
    /**
     * Convert PCM16 data to an AudioBuffer and schedule it.
     */
    scheduleBuffer(pcmData) {
        try {
            const float32 = (0, audio_format_1.decodePCM16LEToFloat32)(pcmData);
            const numSamples = float32.length;
            const sampleRate = this.config.audioOutputSampleRate;
            const audioBuffer = this.audioContext.createBuffer(1, numSamples, sampleRate);
            const channelData = audioBuffer.getChannelData(0);
            for (let i = 0; i < numSamples; i++) {
                channelData[i] = float32[i];
            }
            const source = this.audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(this.audioContext.destination);
            // Schedule at the end of current playback
            const now = this.audioContext.currentTime;
            const startTime = Math.max(now, this.scheduledEndTime);
            source.start(startTime);
            const duration = numSamples / sampleRate;
            this.scheduledEndTime = startTime + duration;
        }
        catch (err) {
            (0, logger_1.logError)('Buffer scheduling failed:', err);
        }
    }
    /**
     * Start a timer-based idle check.
     * Polls audioContext.currentTime vs scheduledEndTime to detect when
     * all scheduled audio has finished playing.
     * (onended callbacks are unreliable in react-native-audio-api)
     */
    startIdleCheck() {
        this.stopIdleCheck();
        this.idleCheckTimer = setInterval(() => {
            if (!this.audioContext || !this.isPlaying) {
                this.stopIdleCheck();
                return;
            }
            const now = this.audioContext.currentTime;
            const hasQueuedBuffers = this.bufferQueue.length > 0;
            // All scheduled audio has finished and no more buffers queued
            if (now >= this.scheduledEndTime && !hasQueuedBuffers) {
                this.isPlaying = false;
                this.stopIdleCheck();
                (0, logger_1.logDebug)('Playback idle — all audio finished (time-based check)');
                this.emit('idle');
            }
        }, this.IDLE_CHECK_INTERVAL_MS);
    }
    stopIdleCheck() {
        if (this.idleCheckTimer) {
            clearInterval(this.idleCheckTimer);
            this.idleCheckTimer = null;
        }
    }
    /**
     * Clear all queued audio and stop playback.
     */
    clearQueue() {
        this.bufferQueue = [];
        this.stopIdleCheck();
        // Reset scheduled end time so next enqueue starts immediately.
        // Don't destroy AudioContext — recreating it causes iOS audio session errors.
        if (this.audioContext) {
            this.scheduledEndTime = this.audioContext.currentTime;
        }
        this.isPlaying = false;
        (0, logger_1.logDebug)('Audio queue cleared');
        this.emit('idle');
    }
    cleanup() {
        this.clearQueue();
        if (this.audioContext) {
            try {
                this.audioContext.close();
            }
            catch {
                // Ignore close errors
            }
            this.audioContext = null;
        }
        this.removeAllListeners();
    }
}
exports.AudioPlaybackManager = AudioPlaybackManager;
//# sourceMappingURL=audio-playback-manager.js.map