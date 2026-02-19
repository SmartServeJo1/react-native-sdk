import { TypedEventEmitter } from './event-emitter';
import type { AudioPlaybackEventMap, ResolvedConfig, VoiceStreamError } from './types';
import { amplifyPCM16, decodePCM16LEToFloat32 } from './utils/audio-format';
import { logDebug, logError } from './utils/logger';

/**
 * Manages audio playback of PCM16 data received from the server.
 * Uses react-native-audio-api (AudioContext) for low-latency playback.
 *
 * Mirrors iOS AudioPlaybackManager.swift
 */
export class AudioPlaybackManager extends TypedEventEmitter<AudioPlaybackEventMap> {
  private config: ResolvedConfig;
  private audioContext: any = null; // AudioContext from react-native-audio-api
  private bufferQueue: ArrayBuffer[] = [];
  private isPlaying = false;
  private scheduledEndTime = 0;
  private idleCheckTimer: ReturnType<typeof setInterval> | null = null;
  private initFailed = false; // Stop retrying after first failure

  /** Volume amplification factor (matches iOS 3x) */
  private readonly VOLUME_FACTOR = 3.0;

  /** How often to check if playback has finished (ms) */
  private readonly IDLE_CHECK_INTERVAL_MS = 200;

  constructor(config: ResolvedConfig) {
    super();
    this.config = config;
  }

  get playing(): boolean {
    return this.isPlaying;
  }

  /**
   * Initialize the audio context for playback.
   */
  private ensureAudioContext(): void {
    if (this.audioContext) return;
    if (this.initFailed) return;

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
      logDebug('AudioContext created at', this.config.audioOutputSampleRate, 'Hz');
    } catch (err) {
      this.initFailed = true;
      logError('Failed to create AudioContext:', err);
      throw new Error(
        'react-native-audio-api is required for audio playback. ' +
        'Install it with: npm install react-native-audio-api'
      );
    }
  }

  /**
   * Enqueue PCM16 audio data for playback.
   * Auto-starts playback if not already playing.
   */
  enqueueAudio(pcmData: ArrayBuffer): void {
    if (this.initFailed) return;

    // Amplify audio (3x volume, matching iOS)
    const amplified = amplifyPCM16(pcmData, this.VOLUME_FACTOR);
    this.bufferQueue.push(amplified);

    if (!this.isPlaying) {
      this.startPlayback();
    } else {
      this.processQueue();
    }
  }

  /**
   * Start playback and process the buffer queue.
   */
  private startPlayback(): void {
    try {
      this.ensureAudioContext();
      if (!this.audioContext) return;

      this.isPlaying = true;
      this.scheduledEndTime = this.audioContext.currentTime;
      this.emit('started');
      logDebug('Playback started');
      this.processQueue();
      this.startIdleCheck();
    } catch (err) {
      logError('Playback start failed:', err);
      const error: VoiceStreamError = {
        code: 'AUDIO_PLAYBACK_FAILED',
        message: `Failed to start playback: ${err}`,
      };
      this.emit('error', error);
    }
  }

  /**
   * Process queued audio buffers and schedule them for playback.
   */
  private processQueue(): void {
    if (!this.audioContext || this.bufferQueue.length === 0) return;

    while (this.bufferQueue.length > 0) {
      const pcmData = this.bufferQueue.shift()!;
      this.scheduleBuffer(pcmData);
    }
  }

  /**
   * Convert PCM16 data to an AudioBuffer and schedule it.
   */
  private scheduleBuffer(pcmData: ArrayBuffer): void {
    try {
      const float32 = decodePCM16LEToFloat32(pcmData);
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
    } catch (err) {
      logError('Buffer scheduling failed:', err);
    }
  }

  /**
   * Start a timer-based idle check.
   * Polls audioContext.currentTime vs scheduledEndTime to detect when
   * all scheduled audio has finished playing.
   * (onended callbacks are unreliable in react-native-audio-api)
   */
  private startIdleCheck(): void {
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
        logDebug('Playback idle — all audio finished (time-based check)');
        this.emit('idle');
      }
    }, this.IDLE_CHECK_INTERVAL_MS);
  }

  private stopIdleCheck(): void {
    if (this.idleCheckTimer) {
      clearInterval(this.idleCheckTimer);
      this.idleCheckTimer = null;
    }
  }

  /**
   * Clear all queued audio and stop playback.
   */
  clearQueue(): void {
    this.bufferQueue = [];
    this.stopIdleCheck();

    if (this.audioContext) {
      try {
        this.audioContext.close();
        this.audioContext = null;
      } catch {
        // Ignore close errors
      }
    }

    this.isPlaying = false;
    logDebug('Audio queue cleared');
    this.emit('idle');
  }

  cleanup(): void {
    this.clearQueue();
    this.removeAllListeners();
  }
}
