"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoiceStreamSDK = void 0;
const event_emitter_1 = require("./event-emitter");
const websocket_manager_1 = require("./websocket-manager");
const audio_capture_manager_1 = require("./audio-capture-manager");
const audio_playback_manager_1 = require("./audio-playback-manager");
const echo_prevention_1 = require("./echo-prevention");
const voice_stream_config_1 = require("./voice-stream-config");
const logger_1 = require("./utils/logger");
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
class VoiceStreamSDK extends event_emitter_1.TypedEventEmitter {
    constructor(config) {
        super();
        this._streaming = false;
        this.unsubscribers = [];
        this.config = (0, voice_stream_config_1.resolveConfig)(config);
        (0, logger_1.setDebugLogging)(this.config.enableDebugLogging);
        // Create managers
        this.wsManager = new websocket_manager_1.WebSocketManager(this.config);
        this.captureManager = new audio_capture_manager_1.AudioCaptureManager(this.config);
        this.playbackManager = new audio_playback_manager_1.AudioPlaybackManager(this.config);
        this.echoPrevention = new echo_prevention_1.EchoPrevention(this.captureManager, this.playbackManager);
        // Wire up WebSocket events
        this.wireWebSocketEvents();
        // Wire up audio capture events
        this.wireAudioCaptureEvents();
    }
    // ─── Connection ───────────────────────────────────────────────
    /**
     * Connect to the voice streaming server.
     */
    connect() {
        (0, logger_1.logDebug)('Connecting...');
        this.wsManager.connect();
    }
    /**
     * Disconnect from the server.
     */
    disconnect() {
        (0, logger_1.logDebug)('Disconnecting...');
        this.stopAudioStreaming();
        this.wsManager.disconnect();
    }
    /**
     * Whether the SDK is connected to the server.
     */
    isConnected() {
        return this.wsManager.isConnected();
    }
    /**
     * Current connection state.
     */
    getConnectionState() {
        return this.wsManager.getConnectionState();
    }
    // ─── Audio Streaming ──────────────────────────────────────────
    /**
     * Start bidirectional audio streaming (mic capture + speaker playback).
     */
    async startAudioStreaming() {
        if (this._streaming)
            return;
        if (!this.isConnected()) {
            (0, logger_1.logError)('Cannot start streaming: not connected');
            return;
        }
        await this.captureManager.startCapture();
        this._streaming = true;
        (0, logger_1.logDebug)('Audio streaming started');
    }
    /**
     * Stop audio streaming.
     */
    stopAudioStreaming() {
        if (!this._streaming)
            return;
        this.captureManager.stopCapture();
        this.playbackManager.clearQueue();
        this.echoPrevention.forceUnmute();
        this._streaming = false;
        (0, logger_1.logDebug)('Audio streaming stopped');
    }
    /**
     * Whether audio streaming is active.
     */
    isStreaming() {
        return this._streaming;
    }
    /**
     * Ensure playback-only mode (no capture). Used for greeting audio.
     */
    ensurePlayback() {
        // Playback auto-starts when audio is enqueued, nothing to do
        (0, logger_1.logDebug)('Playback-only mode ensured');
    }
    // ─── Messaging ────────────────────────────────────────────────
    /**
     * Send a raw text message over WebSocket.
     */
    sendMessage(text) {
        this.wsManager.sendText(text);
    }
    /**
     * Send a chat message (AI Clinic mode).
     */
    sendChatMessage(text) {
        this.wsManager.sendJSON({
            type: 'chat_message',
            text,
        });
    }
    /**
     * Send an LLM response to be spoken via TTS (AI Clinic mode).
     */
    sendLlmResponse(text) {
        this.wsManager.sendJSON({
            type: 'llm_response',
            text,
        });
    }
    // ─── Audio Queue ──────────────────────────────────────────────
    /**
     * Clear queued audio and force-unmute the mic.
     */
    clearAudioQueue() {
        this.playbackManager.clearQueue();
        this.echoPrevention.forceUnmute();
    }
    // ─── Lifecycle ────────────────────────────────────────────────
    /**
     * Clean up all resources. Call when done with the SDK.
     */
    cleanup() {
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
        (0, logger_1.logDebug)('SDK cleaned up');
    }
    // ─── Internal Wiring ──────────────────────────────────────────
    wireWebSocketEvents() {
        // Connection state changes
        this.unsubscribers.push(this.wsManager.on('connectionStateChanged', (state) => {
            this.emit('connectionStateChanged', state);
        }));
        // Connected
        this.unsubscribers.push(this.wsManager.on('open', () => {
            this.emit('connected');
        }));
        // Disconnected
        this.unsubscribers.push(this.wsManager.on('close', (data) => {
            if (this._streaming) {
                this.stopAudioStreaming();
            }
            this.emit('disconnected', { reason: data.reason });
        }));
        // Connection error
        this.unsubscribers.push(this.wsManager.on('error', (msg) => {
            const error = {
                code: 'CONNECTION_FAILED',
                message: msg,
            };
            this.emit('error', error);
        }));
        // Binary audio from server → playback
        this.unsubscribers.push(this.wsManager.on('binaryMessage', (data) => {
            this.playbackManager.enqueueAudio(data);
            this.emit('audioReceived', data);
        }));
        // Text messages from server → parse and route
        this.unsubscribers.push(this.wsManager.on('textMessage', (text) => {
            this.routeTextMessage(text);
        }));
    }
    wireAudioCaptureEvents() {
        // Captured audio → send to server
        this.unsubscribers.push(this.captureManager.on('data', (audioData) => {
            this.wsManager.sendBinary(audioData);
            this.emit('audioSent', audioData);
        }));
        // Capture errors
        this.unsubscribers.push(this.captureManager.on('error', (error) => {
            this.emit('error', error);
        }));
    }
    routeTextMessage(text) {
        try {
            const msg = JSON.parse(text);
            const type = msg.type;
            switch (type) {
                case 'transcript': {
                    const data = {
                        text: msg.text ?? '',
                        isFinal: msg.is_final ?? false,
                        language: msg.language ?? 'en',
                        requiresResponse: msg.requires_response ?? false,
                    };
                    this.emit('transcript', data);
                    break;
                }
                case 'assistant_message': {
                    const data = {
                        text: msg.text ?? '',
                    };
                    this.emit('assistantMessage', data);
                    break;
                }
                case 'llm_required': {
                    const data = {
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
                    const data = {
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
        }
        catch {
            // Non-JSON text message
            this.emit('message', text);
        }
    }
}
exports.VoiceStreamSDK = VoiceStreamSDK;
//# sourceMappingURL=voice-stream-sdk.js.map