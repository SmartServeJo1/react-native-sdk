import { TypedEventEmitter } from './event-emitter';
import type { AudioCaptureEventMap, ResolvedConfig, VoiceStreamError } from './types';
import { base64ToArrayBuffer } from './utils/audio-format';
import { logDebug, logError } from './utils/logger';

// Lazy imports to avoid crashes when not installed
let LiveAudioStream: any = null;
let RNPermissions: any = null;

function getLiveAudioStream(): any {
  if (!LiveAudioStream) {
    try {
      LiveAudioStream = require('react-native-live-audio-stream').default;
    } catch {
      throw new Error(
        'react-native-live-audio-stream is required for audio capture. ' +
        'Install it with: npm install react-native-live-audio-stream'
      );
    }
  }
  return LiveAudioStream;
}

function getPermissions(): any {
  if (!RNPermissions) {
    try {
      RNPermissions = require('react-native-permissions');
    } catch {
      // Permissions library optional — will try to proceed without it
    }
  }
  return RNPermissions;
}

/**
 * Manages microphone audio capture, providing raw PCM16 data.
 * Mirrors iOS AudioCaptureManager.swift
 */
export class AudioCaptureManager extends TypedEventEmitter<AudioCaptureEventMap> {
  private config: ResolvedConfig;
  private isCapturing = false;
  private isMuted = false;
  private dataSubscription: (() => void) | null = null;

  constructor(config: ResolvedConfig) {
    super();
    this.config = config;
  }

  get capturing(): boolean {
    return this.isCapturing;
  }

  get muted(): boolean {
    return this.isMuted;
  }

  /**
   * Request microphone permission.
   * Returns true if granted, false otherwise.
   */
  async requestPermission(): Promise<boolean> {
    const permissions = getPermissions();

    if (!permissions) {
      // If permissions library not available, try to proceed
      // (the native module will request permission on start)
      logDebug('react-native-permissions not available, relying on native prompt');
      return true;
    }

    try {
      const { Platform } = require('react-native');
      const permission = Platform.OS === 'ios'
        ? permissions.PERMISSIONS.IOS.MICROPHONE
        : permissions.PERMISSIONS.ANDROID.RECORD_AUDIO;

      const status = await permissions.check(permission);

      if (status === permissions.RESULTS.GRANTED) {
        return true;
      }

      if (status === permissions.RESULTS.DENIED) {
        const result = await permissions.request(permission);
        return result === permissions.RESULTS.GRANTED;
      }

      // BLOCKED or UNAVAILABLE
      return false;
    } catch (err) {
      logError('Permission check failed:', err);
      return false;
    }
  }

  /**
   * Start capturing audio from the microphone.
   * Emits 'data' events with ArrayBuffer of PCM16 audio.
   */
  async startCapture(): Promise<void> {
    if (this.isCapturing) return;

    const hasPermission = await this.requestPermission();
    if (!hasPermission) {
      const error: VoiceStreamError = {
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
      stream.on('data', (base64Data: string) => {
        if (this.isMuted) return; // Discard frames when muted (echo prevention)

        try {
          const audioBuffer = base64ToArrayBuffer(base64Data);
          this.emit('data', audioBuffer);
        } catch (err) {
          logError('Audio data decode error:', err);
        }
      });

      stream.start();
      this.isCapturing = true;
      this.isMuted = false;
      logDebug('Audio capture started');
    } catch (err) {
      logError('Audio capture start failed:', err);
      const error: VoiceStreamError = {
        code: 'AUDIO_CAPTURE_FAILED',
        message: `Failed to start audio capture: ${err}`,
      };
      this.emit('error', error);
    }
  }

  /**
   * Stop capturing audio.
   */
  stopCapture(): void {
    if (!this.isCapturing) return;

    try {
      const stream = getLiveAudioStream();
      stream.stop();
    } catch {
      // Ignore errors on stop
    }

    this.isCapturing = false;
    this.isMuted = false;
    logDebug('Audio capture stopped');
  }

  /**
   * Mute the microphone (discard frames without stopping capture).
   * Used by echo prevention to avoid latency of stop/start.
   */
  mute(): void {
    this.isMuted = true;
    logDebug('Mic muted');
  }

  /**
   * Unmute the microphone (resume emitting frames).
   */
  unmute(): void {
    this.isMuted = false;
    logDebug('Mic unmuted');
  }

  cleanup(): void {
    this.stopCapture();
    this.removeAllListeners();
  }
}
