"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioCaptureManager = void 0;
const react_native_1 = require("react-native");
const event_emitter_1 = require("./event-emitter");
const audio_format_1 = require("./utils/audio-format");
const logger_1 = require("./utils/logger");
// Lazy import to avoid crashes when not installed
let LiveAudioStream = null;
function getLiveAudioStream() {
    if (!LiveAudioStream) {
        try {
            LiveAudioStream = require('react-native-live-audio-stream').default;
        }
        catch {
            throw new Error('react-native-live-audio-stream is required for audio capture. ' +
                'Install it with: npm install react-native-live-audio-stream');
        }
    }
    return LiveAudioStream;
}
/**
 * Manages microphone audio capture, providing raw PCM16 data.
 * Mirrors iOS AudioCaptureManager.swift
 */
class AudioCaptureManager extends event_emitter_1.TypedEventEmitter {
    constructor(config) {
        super();
        this.isCapturing = false;
        this.isMuted = false;
        this.dataSubscription = null;
        this.config = config;
    }
    get capturing() {
        return this.isCapturing;
    }
    get muted() {
        return this.isMuted;
    }
    /**
     * Request microphone permission.
     * Uses React Native's built-in PermissionsAndroid on Android.
     * On iOS, the native mic API triggers the permission prompt automatically.
     */
    async requestPermission() {
        if (react_native_1.Platform.OS === 'android') {
            try {
                const granted = await react_native_1.PermissionsAndroid.request(react_native_1.PermissionsAndroid.PERMISSIONS.RECORD_AUDIO, {
                    title: 'Microphone Permission',
                    message: 'This app needs access to your microphone for voice chat.',
                    buttonPositive: 'Allow',
                    buttonNegative: 'Deny',
                });
                return granted === react_native_1.PermissionsAndroid.RESULTS.GRANTED;
            }
            catch (err) {
                (0, logger_1.logError)('Permission request failed:', err);
                return false;
            }
        }
        // iOS: permission is requested automatically by the native audio module
        return true;
    }
    /**
     * Start capturing audio from the microphone.
     * Emits 'data' events with ArrayBuffer of PCM16 audio.
     */
    async startCapture() {
        if (this.isCapturing)
            return;
        const hasPermission = await this.requestPermission();
        if (!hasPermission) {
            const error = {
                code: 'AUDIO_PERMISSION_DENIED',
                message: 'Microphone permission denied',
            };
            this.emit('error', error);
            return;
        }
        try {
            const stream = getLiveAudioStream();
            stream.init({
                sampleRate: this.config.audioInputSampleRate,
                channels: this.config.audioChannels,
                bitsPerSample: this.config.audioBitDepth,
                audioSource: 6, // VOICE_COMMUNICATION on Android
                bufferSize: this.config.audioBufferSize,
            });
            // Listen for audio data (base64-encoded PCM)
            stream.on('data', (base64Data) => {
                if (this.isMuted)
                    return; // Discard frames when muted (echo prevention)
                try {
                    const audioBuffer = (0, audio_format_1.base64ToArrayBuffer)(base64Data);
                    this.emit('data', audioBuffer);
                }
                catch (err) {
                    (0, logger_1.logError)('Audio data decode error:', err);
                }
            });
            stream.start();
            this.isCapturing = true;
            this.isMuted = false;
            (0, logger_1.logDebug)('Audio capture started');
        }
        catch (err) {
            (0, logger_1.logError)('Audio capture start failed:', err);
            const error = {
                code: 'AUDIO_CAPTURE_FAILED',
                message: `Failed to start audio capture: ${err}`,
            };
            this.emit('error', error);
        }
    }
    /**
     * Stop capturing audio.
     */
    stopCapture() {
        if (!this.isCapturing)
            return;
        try {
            const stream = getLiveAudioStream();
            stream.stop();
        }
        catch {
            // Ignore errors on stop
        }
        this.isCapturing = false;
        this.isMuted = false;
        (0, logger_1.logDebug)('Audio capture stopped');
    }
    /**
     * Mute the microphone (discard frames without stopping capture).
     * Used by echo prevention to avoid latency of stop/start.
     */
    mute() {
        this.isMuted = true;
        (0, logger_1.logDebug)('Mic muted');
    }
    /**
     * Unmute the microphone (resume emitting frames).
     */
    unmute() {
        this.isMuted = false;
        (0, logger_1.logDebug)('Mic unmuted');
    }
    cleanup() {
        this.stopCapture();
        this.removeAllListeners();
    }
}
exports.AudioCaptureManager = AudioCaptureManager;
//# sourceMappingURL=audio-capture-manager.js.map