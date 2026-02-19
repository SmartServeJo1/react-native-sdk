import { TypedEventEmitter } from './event-emitter';
import { WebSocketManager } from './websocket-manager';
import { AudioCaptureManager } from './audio-capture-manager';
import { AudioPlaybackManager } from './audio-playback-manager';
import { EchoPrevention } from './echo-prevention';
import { resolveConfig } from './voice-stream-config';
import { setDebugLogging, logDebug, logError } from './utils/logger';
import type {
  VoiceStreamConfig,
  ResolvedConfig,
  ConnectionState,
  VoiceStreamEventMap,
  VoiceStreamError,
  TranscriptData,
  AssistantMessageData,
  LlmRequiredData,
  DiagnosticData,
} from './types';

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
export class VoiceStreamSDK extends TypedEventEmitter<VoiceStreamEventMap> {
  private config: ResolvedConfig;
  private wsManager: WebSocketManager;
  private captureManager: AudioCaptureManager;
  private playbackManager: AudioPlaybackManager;
  private echoPrevention: EchoPrevention;
  private _streaming = false;
  private unsubscribers: (() => void)[] = [];

  constructor(config: VoiceStreamConfig) {
    super();
    this.config = resolveConfig(config);
    setDebugLogging(this.config.enableDebugLogging);

    // Create managers
    this.wsManager = new WebSocketManager(this.config);
    this.captureManager = new AudioCaptureManager(this.config);
    this.playbackManager = new AudioPlaybackManager(this.config);
    this.echoPrevention = new EchoPrevention(this.captureManager, this.playbackManager);

    // Wire up WebSocket events
    this.wireWebSocketEvents();
    // Wire up audio capture events
    this.wireAudioCaptureEvents();
  }

  // ─── Connection ───────────────────────────────────────────────

  /**
   * Connect to the voice streaming server.
   */
  connect(): void {
    logDebug('Connecting...');
    this.wsManager.connect();
  }

  /**
   * Disconnect from the server.
   */
  disconnect(): void {
    logDebug('Disconnecting...');
    this.stopAudioStreaming();
    this.wsManager.disconnect();
  }

  /**
   * Whether the SDK is connected to the server.
   */
  isConnected(): boolean {
    return this.wsManager.isConnected();
  }

  /**
   * Current connection state.
   */
  getConnectionState(): ConnectionState {
    return this.wsManager.getConnectionState();
  }

  // ─── Audio Streaming ──────────────────────────────────────────

  /**
   * Start bidirectional audio streaming (mic capture + speaker playback).
   */
  async startAudioStreaming(): Promise<void> {
    if (this._streaming) return;
    if (!this.isConnected()) {
      logError('Cannot start streaming: not connected');
      return;
    }

    await this.captureManager.startCapture();
    this._streaming = true;
    logDebug('Audio streaming started');
  }

  /**
   * Stop audio streaming.
   */
  stopAudioStreaming(): void {
    if (!this._streaming) return;

    this.captureManager.stopCapture();
    this.playbackManager.clearQueue();
    this.echoPrevention.forceUnmute();
    this._streaming = false;
    logDebug('Audio streaming stopped');
  }

  /**
   * Whether audio streaming is active.
   */
  isStreaming(): boolean {
    return this._streaming;
  }

  /**
   * Ensure playback-only mode (no capture). Used for greeting audio.
   */
  ensurePlayback(): void {
    // Playback auto-starts when audio is enqueued, nothing to do
    logDebug('Playback-only mode ensured');
  }

  // ─── Messaging ────────────────────────────────────────────────

  /**
   * Send a raw text message over WebSocket.
   */
  sendMessage(text: string): void {
    this.wsManager.sendText(text);
  }

  /**
   * Send a chat message (AI Clinic mode).
   */
  sendChatMessage(text: string): void {
    this.wsManager.sendJSON({
      type: 'chat_message',
      text,
    });
  }

  /**
   * Send an LLM response to be spoken via TTS (AI Clinic mode).
   */
  sendLlmResponse(text: string): void {
    this.wsManager.sendJSON({
      type: 'llm_response',
      text,
    });
  }

  // ─── Audio Queue ──────────────────────────────────────────────

  /**
   * Clear queued audio and force-unmute the mic.
   */
  clearAudioQueue(): void {
    this.playbackManager.clearQueue();
    this.echoPrevention.forceUnmute();
  }

  // ─── Lifecycle ────────────────────────────────────────────────

  /**
   * Clean up all resources. Call when done with the SDK.
   */
  cleanup(): void {
    this.stopAudioStreaming();
    this.echoPrevention.destroy();
    this.captureManager.cleanup();
    this.playbackManager.cleanup();
    this.wsManager.cleanup();

    for (const unsub of this.unsubscribers) {
      unsub();
    }
    this.unsubscribers = [];
    this.removeAllListeners();
    logDebug('SDK cleaned up');
  }

  // ─── Internal Wiring ──────────────────────────────────────────

  private wireWebSocketEvents(): void {
    // Connection state changes
    this.unsubscribers.push(
      this.wsManager.on('connectionStateChanged', (state) => {
        this.emit('connectionStateChanged', state);
      }),
    );

    // Connected
    this.unsubscribers.push(
      this.wsManager.on('open', () => {
        this.emit('connected');
      }),
    );

    // Disconnected
    this.unsubscribers.push(
      this.wsManager.on('close', (data) => {
        if (this._streaming) {
          this.stopAudioStreaming();
        }
        this.emit('disconnected', { reason: data.reason });
      }),
    );

    // Connection error
    this.unsubscribers.push(
      this.wsManager.on('error', (msg) => {
        const error: VoiceStreamError = {
          code: 'CONNECTION_FAILED',
          message: msg,
        };
        this.emit('error', error);
      }),
    );

    // Binary audio from server → playback
    this.unsubscribers.push(
      this.wsManager.on('binaryMessage', (data) => {
        this.playbackManager.enqueueAudio(data);
        this.emit('audioReceived', data);
      }),
    );

    // Text messages from server → parse and route
    this.unsubscribers.push(
      this.wsManager.on('textMessage', (text) => {
        this.routeTextMessage(text);
      }),
    );
  }

  private wireAudioCaptureEvents(): void {
    // Captured audio → send to server
    this.unsubscribers.push(
      this.captureManager.on('data', (audioData) => {
        this.wsManager.sendBinary(audioData);
        this.emit('audioSent', audioData);
      }),
    );

    // Capture errors
    this.unsubscribers.push(
      this.captureManager.on('error', (error) => {
        this.emit('error', error);
      }),
    );
  }

  private routeTextMessage(text: string): void {
    try {
      const msg = JSON.parse(text);
      const type = msg.type;

      switch (type) {
        case 'transcript': {
          const data: TranscriptData = {
            text: msg.text ?? '',
            isFinal: msg.is_final ?? false,
            language: msg.language ?? 'en',
            requiresResponse: msg.requires_response ?? false,
          };
          this.emit('transcript', data);
          break;
        }

        case 'assistant_message': {
          const data: AssistantMessageData = {
            text: msg.text ?? '',
          };
          this.emit('assistantMessage', data);
          break;
        }

        case 'llm_required': {
          const data: LlmRequiredData = {
            question: msg.question ?? msg.text ?? '',
          };
          this.emit('llmRequired', data);
          break;
        }

        case 'filler_started':
          this.emit('fillerStarted');
          break;

        case 'ready':
          this.emit('ready');
          break;

        case 'interrupt':
          this.clearAudioQueue();
          this.emit('interrupt');
          break;

        case 'diagnostic': {
          const data: DiagnosticData = {
            code: msg.code ?? '',
            message: msg.message ?? '',
          };
          this.emit('diagnostic', data);
          break;
        }

        case 'pong':
          // Keep-alive response, ignore
          break;

        default:
          // Forward raw message for custom handling
          this.emit('message', text);
          break;
      }
    } catch {
      // Non-JSON text message
      this.emit('message', text);
    }
  }
}
