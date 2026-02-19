import { StyleSheet, Dimensions, View, TouchableWithoutFeedback, Platform, PermissionsAndroid, KeyboardAvoidingView, TouchableOpacity, Text, FlatList, TextInput, Animated } from 'react-native';
import { useState, useRef, useEffect, useCallback } from 'react';
import { jsxs, jsx } from 'react/jsx-runtime';

var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// src/core/event-emitter.ts
var TypedEventEmitter = class {
  constructor() {
    this.listeners = /* @__PURE__ */ new Map();
  }
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, /* @__PURE__ */ new Set());
    }
    this.listeners.get(event).add(callback);
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }
  off(event, callback) {
    this.listeners.get(event)?.delete(callback);
  }
  emit(...[event, data]) {
    const set = this.listeners.get(event);
    if (!set) return;
    for (const cb of set) {
      try {
        cb(data);
      } catch {
      }
    }
  }
  removeAllListeners() {
    this.listeners.clear();
  }
};

// src/core/utils/reconnect.ts
var JITTER_FACTOR = 0.3;
function calculateBackoff(attempt, baseDelay, maxDelay) {
  const exponential = Math.min(maxDelay, baseDelay * Math.pow(2, attempt));
  const jitter = exponential * JITTER_FACTOR * Math.random();
  return Math.floor(exponential + jitter);
}

// src/core/utils/logger.ts
var TAG = "[VoiceStreamSDK]";
var debugEnabled = false;
function setDebugLogging(enabled) {
  debugEnabled = enabled;
}
function logDebug(...args) {
  if (debugEnabled) {
    console.log(TAG, ...args);
  }
}
function logWarn(...args) {
  console.warn(TAG, ...args);
}
function logError(...args) {
  console.error(TAG, ...args);
}

// src/core/websocket-manager.ts
var WebSocketManager = class extends TypedEventEmitter {
  constructor(config) {
    super();
    this.ws = null;
    this.state = "disconnected";
    this.reconnectAttempts = 0;
    this.reconnectTimer = null;
    this.pingTimer = null;
    this.manualDisconnect = false;
    this.config = config;
  }
  getConnectionState() {
    return this.state;
  }
  isConnected() {
    return this.state === "connected";
  }
  connect() {
    if (this.state === "connected" || this.state === "connecting") return;
    this.manualDisconnect = false;
    this.reconnectAttempts = 0;
    this.setState("connecting");
    this.openConnection();
  }
  disconnect() {
    this.manualDisconnect = true;
    this.clearTimers();
    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onclose = null;
      this.ws.onerror = null;
      this.ws.onmessage = null;
      this.ws.close(1e3, "Client disconnect");
      this.ws = null;
    }
    this.setState("disconnected");
    this.emit("close", { code: 1e3, reason: "Client disconnect" });
  }
  sendText(text) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      logWarn("Cannot send text: WebSocket not open");
      return;
    }
    this.ws.send(text);
  }
  sendBinary(data) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }
    this.ws.send(data);
  }
  sendJSON(payload) {
    this.sendText(JSON.stringify(payload));
  }
  cleanup() {
    this.disconnect();
    this.removeAllListeners();
  }
  // ─── Private ──────────────────────────────────────────────────
  openConnection() {
    try {
      const url = this.buildUrl();
      logDebug("Connecting to", url);
      this.ws = new WebSocket(url);
      this.ws.binaryType = "arraybuffer";
      this.ws.onopen = () => this.handleOpen();
      this.ws.onclose = (event) => this.handleClose(event);
      this.ws.onerror = () => this.handleError();
      this.ws.onmessage = (event) => this.handleMessage(event);
    } catch (err) {
      logError("Connection failed:", err);
      this.emit("error", String(err));
      this.scheduleReconnect();
    }
  }
  buildUrl() {
    const base = this.config.serverUrl;
    const params = new URLSearchParams();
    params.set("tenantId", this.config.tenantId);
    if (this.config.authToken) {
      params.set("token", this.config.authToken);
    }
    params.set("channel", "react-native");
    const separator = base.includes("?") ? "&" : "?";
    return `${base}${separator}${params.toString()}`;
  }
  handleOpen() {
    logDebug("WebSocket connected");
    this.reconnectAttempts = 0;
    this.setState("connected");
    this.sendJSON({
      type: "tenant_info",
      tenant_id: this.config.tenantId,
      tenant_name: this.config.tenantName,
      ...this.config.authToken && { auth_token: this.config.authToken },
      ...this.config.aiClinicMode && { ai_clinic_mode: true },
      ...this.config.fillerPhraseEn && { filler_phrase_en: this.config.fillerPhraseEn },
      ...this.config.fillerPhraseAr && { filler_phrase_ar: this.config.fillerPhraseAr }
    });
    this.startPingTimer();
    this.emit("open");
  }
  handleClose(event) {
    logDebug("WebSocket closed:", event.code, event.reason);
    this.clearTimers();
    this.ws = null;
    if (this.manualDisconnect) {
      this.setState("disconnected");
      this.emit("close", { code: event.code, reason: event.reason ?? "" });
      return;
    }
    this.emit("close", { code: event.code, reason: event.reason ?? "" });
    this.scheduleReconnect();
  }
  handleError() {
    logError("WebSocket error");
    this.emit("error", "WebSocket connection error");
  }
  handleMessage(event) {
    if (event.data instanceof ArrayBuffer) {
      this.emit("binaryMessage", event.data);
      return;
    }
    if (typeof event.data === "string") {
      logDebug("Received text:", event.data.substring(0, 100));
      this.emit("textMessage", event.data);
      return;
    }
    logWarn("Unknown message type received");
  }
  startPingTimer() {
    this.clearPingTimer();
    this.pingTimer = setInterval(() => {
      if (this.isConnected()) {
        this.sendJSON({ type: "ping", ts: Date.now() });
      }
    }, this.config.pingIntervalMs);
  }
  scheduleReconnect() {
    if (this.manualDisconnect || !this.config.autoReconnect) {
      this.setState("disconnected");
      return;
    }
    if (this.config.maxReconnectAttempts > 0 && this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      logError("Max reconnection attempts reached");
      this.setState("disconnected");
      this.emit("error", "Max reconnection attempts reached");
      return;
    }
    this.setState("reconnecting");
    const delay = calculateBackoff(
      this.reconnectAttempts,
      this.config.reconnectDelayMs,
      this.config.maxReconnectDelayMs
    );
    logDebug(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1})`);
    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++;
      this.openConnection();
    }, delay);
  }
  setState(newState) {
    if (this.state === newState) return;
    this.state = newState;
    this.emit("connectionStateChanged", newState);
  }
  clearTimers() {
    this.clearPingTimer();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
  clearPingTimer() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }
};

// src/core/utils/audio-format.ts
function decodePCM16LEToFloat32(pcmBytes) {
  const view = new DataView(pcmBytes);
  const numSamples = pcmBytes.byteLength / 2;
  const float32 = new Float32Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    const int16 = view.getInt16(i * 2, true);
    float32[i] = int16 / 32768;
  }
  return float32;
}
function encodeFloat32ToPCM16LE(float32) {
  const buffer = new ArrayBuffer(float32.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < float32.length; i++) {
    const clamped = Math.max(-1, Math.min(1, float32[i]));
    const int16 = clamped < 0 ? clamped * 32768 : clamped * 32767;
    view.setInt16(i * 2, int16, true);
  }
  return buffer;
}
function amplifyPCM16(pcmData, factor) {
  const view = new DataView(pcmData);
  const result = new ArrayBuffer(pcmData.byteLength);
  const resultView = new DataView(result);
  const numSamples = pcmData.byteLength / 2;
  for (let i = 0; i < numSamples; i++) {
    const sample = view.getInt16(i * 2, true);
    const amplified = Math.max(-32768, Math.min(32767, Math.round(sample * factor)));
    resultView.setInt16(i * 2, amplified, true);
  }
  return result;
}
function base64ToArrayBuffer(base64) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// src/core/audio-capture-manager.ts
var LiveAudioStream = null;
function getLiveAudioStream() {
  if (!LiveAudioStream) {
    try {
      LiveAudioStream = __require("react-native-live-audio-stream").default;
    } catch {
      throw new Error(
        "react-native-live-audio-stream is required for audio capture. Install it with: npm install react-native-live-audio-stream"
      );
    }
  }
  return LiveAudioStream;
}
var AudioCaptureManager = class extends TypedEventEmitter {
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
    if (Platform.OS === "android") {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: "Microphone Permission",
            message: "This app needs access to your microphone for voice chat.",
            buttonPositive: "Allow",
            buttonNegative: "Deny"
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        logError("Permission request failed:", err);
        return false;
      }
    }
    return true;
  }
  /**
   * Start capturing audio from the microphone.
   * Emits 'data' events with ArrayBuffer of PCM16 audio.
   */
  async startCapture() {
    if (this.isCapturing) return;
    const hasPermission = await this.requestPermission();
    if (!hasPermission) {
      const error = {
        code: "AUDIO_PERMISSION_DENIED",
        message: "Microphone permission denied"
      };
      this.emit("error", error);
      return;
    }
    try {
      const stream = getLiveAudioStream();
      stream.init({
        sampleRate: this.config.audioInputSampleRate,
        channels: this.config.audioChannels,
        bitsPerSample: this.config.audioBitDepth,
        audioSource: 6,
        // VOICE_COMMUNICATION on Android
        bufferSize: this.config.audioBufferSize
      });
      stream.on("data", (base64Data) => {
        if (this.isMuted) return;
        try {
          const audioBuffer = base64ToArrayBuffer(base64Data);
          this.emit("data", audioBuffer);
        } catch (err) {
          logError("Audio data decode error:", err);
        }
      });
      stream.start();
      this.isCapturing = true;
      this.isMuted = false;
      logDebug("Audio capture started");
    } catch (err) {
      logError("Audio capture start failed:", err);
      const error = {
        code: "AUDIO_CAPTURE_FAILED",
        message: `Failed to start audio capture: ${err}`
      };
      this.emit("error", error);
    }
  }
  /**
   * Stop capturing audio.
   */
  stopCapture() {
    if (!this.isCapturing) return;
    try {
      const stream = getLiveAudioStream();
      stream.stop();
    } catch {
    }
    this.isCapturing = false;
    this.isMuted = false;
    logDebug("Audio capture stopped");
  }
  /**
   * Mute the microphone (discard frames without stopping capture).
   * Used by echo prevention to avoid latency of stop/start.
   */
  mute() {
    this.isMuted = true;
    logDebug("Mic muted");
  }
  /**
   * Unmute the microphone (resume emitting frames).
   */
  unmute() {
    this.isMuted = false;
    logDebug("Mic unmuted");
  }
  cleanup() {
    this.stopCapture();
    this.removeAllListeners();
  }
};

// src/core/audio-playback-manager.ts
var AudioPlaybackManager = class extends TypedEventEmitter {
  constructor(config) {
    super();
    this.audioContext = null;
    // AudioContext from react-native-audio-api
    this.bufferQueue = [];
    this.isPlaying = false;
    this.scheduledEndTime = 0;
    this.pendingBuffers = 0;
    this.drainCheckTimer = null;
    /** Volume amplification factor (matches iOS 3x) */
    this.VOLUME_FACTOR = 3;
    this.config = config;
  }
  get playing() {
    return this.isPlaying;
  }
  get queueLength() {
    return this.bufferQueue.length + this.pendingBuffers;
  }
  /**
   * Initialize the audio context for playback.
   */
  ensureAudioContext() {
    if (this.audioContext) return;
    try {
      const AudioAPI = __require("react-native-audio-api");
      this.audioContext = new AudioAPI.AudioContext({
        sampleRate: this.config.audioOutputSampleRate
      });
      logDebug("AudioContext created at", this.config.audioOutputSampleRate, "Hz");
    } catch (err) {
      logError("Failed to create AudioContext:", err);
      throw new Error(
        "react-native-audio-api is required for audio playback. Install it with: npm install react-native-audio-api"
      );
    }
  }
  /**
   * Enqueue PCM16 audio data for playback.
   * Auto-starts playback if not already playing.
   */
  enqueueAudio(pcmData) {
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
  startPlayback() {
    try {
      this.ensureAudioContext();
      this.isPlaying = true;
      this.scheduledEndTime = this.audioContext.currentTime;
      this.emit("started");
      logDebug("Playback started");
      this.processQueue();
    } catch (err) {
      logError("Playback start failed:", err);
      const error = {
        code: "AUDIO_PLAYBACK_FAILED",
        message: `Failed to start playback: ${err}`
      };
      this.emit("error", error);
    }
  }
  /**
   * Process queued audio buffers and schedule them for playback.
   */
  processQueue() {
    if (!this.audioContext || this.bufferQueue.length === 0) {
      this.checkDrain();
      return;
    }
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
      const now = this.audioContext.currentTime;
      const startTime = Math.max(now, this.scheduledEndTime);
      source.start(startTime);
      const duration = numSamples / sampleRate;
      this.scheduledEndTime = startTime + duration;
      this.pendingBuffers++;
      source.onended = () => {
        this.pendingBuffers = Math.max(0, this.pendingBuffers - 1);
        this.checkDrain();
      };
    } catch (err) {
      logError("Buffer scheduling failed:", err);
    }
  }
  /**
   * Check if all buffers have been played (idle state).
   */
  checkDrain() {
    if (this.drainCheckTimer) {
      clearTimeout(this.drainCheckTimer);
    }
    this.drainCheckTimer = setTimeout(() => {
      if (this.bufferQueue.length === 0 && this.pendingBuffers === 0 && this.isPlaying) {
        this.isPlaying = false;
        logDebug("Playback idle \u2014 all buffers drained");
        this.emit("idle");
      }
    }, 50);
  }
  /**
   * Clear all queued audio and stop playback.
   */
  clearQueue() {
    this.bufferQueue = [];
    this.pendingBuffers = 0;
    if (this.audioContext) {
      try {
        this.audioContext.close();
        this.audioContext = null;
      } catch {
      }
    }
    this.isPlaying = false;
    logDebug("Audio queue cleared");
    this.emit("idle");
  }
  cleanup() {
    this.clearQueue();
    if (this.drainCheckTimer) {
      clearTimeout(this.drainCheckTimer);
    }
    this.removeAllListeners();
  }
};

// src/core/echo-prevention.ts
var _EchoPrevention = class _EchoPrevention {
  constructor(capture, playback) {
    this.unmutePendingTimer = null;
    this.unsubscribers = [];
    this.captureManager = capture;
    this.playbackManager = playback;
    this.unsubscribers.push(
      playback.on("started", () => this.onPlaybackStarted())
    );
    this.unsubscribers.push(
      playback.on("idle", () => this.onPlaybackIdle())
    );
  }
  onPlaybackStarted() {
    if (this.unmutePendingTimer) {
      clearTimeout(this.unmutePendingTimer);
      this.unmutePendingTimer = null;
    }
    this.captureManager.mute();
    logDebug("Echo prevention: mic muted (playback started)");
  }
  onPlaybackIdle() {
    if (this.unmutePendingTimer) {
      clearTimeout(this.unmutePendingTimer);
    }
    this.unmutePendingTimer = setTimeout(() => {
      this.captureManager.unmute();
      this.unmutePendingTimer = null;
      logDebug("Echo prevention: mic unmuted (playback idle + tail delay)");
    }, _EchoPrevention.TAIL_DELAY_MS);
  }
  /**
   * Force unmute (e.g., when clearing audio queue).
   */
  forceUnmute() {
    if (this.unmutePendingTimer) {
      clearTimeout(this.unmutePendingTimer);
      this.unmutePendingTimer = null;
    }
    this.captureManager.unmute();
  }
  destroy() {
    if (this.unmutePendingTimer) {
      clearTimeout(this.unmutePendingTimer);
      this.unmutePendingTimer = null;
    }
    for (const unsub of this.unsubscribers) {
      unsub();
    }
    this.unsubscribers = [];
  }
};
/** Delay after playback ends before unmuting (matches iOS 0.5s) */
_EchoPrevention.TAIL_DELAY_MS = 500;
var EchoPrevention = _EchoPrevention;

// src/core/voice-stream-config.ts
var DEFAULTS = {
  autoReconnect: true,
  maxReconnectAttempts: 5,
  reconnectDelayMs: 1e3,
  maxReconnectDelayMs: 3e4,
  pingIntervalMs: 3e4,
  audioInputSampleRate: 16e3,
  audioOutputSampleRate: 24e3,
  audioChannels: 1,
  audioBitDepth: 16,
  audioBufferSize: 1600,
  enableDebugLogging: false,
  aiClinicMode: false
};
function resolveConfig(config) {
  return {
    serverUrl: config.serverUrl,
    tenantId: config.tenantId,
    tenantName: config.tenantName ?? config.tenantId,
    authToken: config.authToken,
    autoReconnect: config.autoReconnect ?? DEFAULTS.autoReconnect,
    maxReconnectAttempts: config.maxReconnectAttempts ?? DEFAULTS.maxReconnectAttempts,
    reconnectDelayMs: config.reconnectDelayMs ?? DEFAULTS.reconnectDelayMs,
    maxReconnectDelayMs: config.maxReconnectDelayMs ?? DEFAULTS.maxReconnectDelayMs,
    pingIntervalMs: config.pingIntervalMs ?? DEFAULTS.pingIntervalMs,
    audioInputSampleRate: config.audioInputSampleRate ?? DEFAULTS.audioInputSampleRate,
    audioOutputSampleRate: config.audioOutputSampleRate ?? DEFAULTS.audioOutputSampleRate,
    audioChannels: config.audioChannels ?? DEFAULTS.audioChannels,
    audioBitDepth: config.audioBitDepth ?? DEFAULTS.audioBitDepth,
    audioBufferSize: config.audioBufferSize ?? DEFAULTS.audioBufferSize,
    enableDebugLogging: config.enableDebugLogging ?? DEFAULTS.enableDebugLogging,
    aiClinicMode: config.aiClinicMode ?? DEFAULTS.aiClinicMode,
    fillerPhraseEn: config.fillerPhraseEn,
    fillerPhraseAr: config.fillerPhraseAr
  };
}

// src/core/voice-stream-sdk.ts
var VoiceStreamSDK = class extends TypedEventEmitter {
  constructor(config) {
    super();
    this._streaming = false;
    this.unsubscribers = [];
    this.config = resolveConfig(config);
    setDebugLogging(this.config.enableDebugLogging);
    this.wsManager = new WebSocketManager(this.config);
    this.captureManager = new AudioCaptureManager(this.config);
    this.playbackManager = new AudioPlaybackManager(this.config);
    this.echoPrevention = new EchoPrevention(this.captureManager, this.playbackManager);
    this.wireWebSocketEvents();
    this.wireAudioCaptureEvents();
  }
  // ─── Connection ───────────────────────────────────────────────
  /**
   * Connect to the voice streaming server.
   */
  connect() {
    logDebug("Connecting...");
    this.wsManager.connect();
  }
  /**
   * Disconnect from the server.
   */
  disconnect() {
    logDebug("Disconnecting...");
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
    if (this._streaming) return;
    if (!this.isConnected()) {
      logError("Cannot start streaming: not connected");
      return;
    }
    await this.captureManager.startCapture();
    this._streaming = true;
    logDebug("Audio streaming started");
  }
  /**
   * Stop audio streaming.
   */
  stopAudioStreaming() {
    if (!this._streaming) return;
    this.captureManager.stopCapture();
    this.playbackManager.clearQueue();
    this.echoPrevention.forceUnmute();
    this._streaming = false;
    logDebug("Audio streaming stopped");
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
    logDebug("Playback-only mode ensured");
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
      type: "chat_message",
      text
    });
  }
  /**
   * Send an LLM response to be spoken via TTS (AI Clinic mode).
   */
  sendLlmResponse(text) {
    this.wsManager.sendJSON({
      type: "llm_response",
      text
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
    logDebug("SDK cleaned up");
  }
  // ─── Internal Wiring ──────────────────────────────────────────
  wireWebSocketEvents() {
    this.unsubscribers.push(
      this.wsManager.on("connectionStateChanged", (state) => {
        this.emit("connectionStateChanged", state);
      })
    );
    this.unsubscribers.push(
      this.wsManager.on("open", () => {
        this.emit("connected");
      })
    );
    this.unsubscribers.push(
      this.wsManager.on("close", (data) => {
        if (this._streaming) {
          this.stopAudioStreaming();
        }
        this.emit("disconnected", { reason: data.reason });
      })
    );
    this.unsubscribers.push(
      this.wsManager.on("error", (msg) => {
        const error = {
          code: "CONNECTION_FAILED",
          message: msg
        };
        this.emit("error", error);
      })
    );
    this.unsubscribers.push(
      this.wsManager.on("binaryMessage", (data) => {
        this.playbackManager.enqueueAudio(data);
        this.emit("audioReceived", data);
      })
    );
    this.unsubscribers.push(
      this.wsManager.on("textMessage", (text) => {
        this.routeTextMessage(text);
      })
    );
  }
  wireAudioCaptureEvents() {
    this.unsubscribers.push(
      this.captureManager.on("data", (audioData) => {
        this.wsManager.sendBinary(audioData);
        this.emit("audioSent", audioData);
      })
    );
    this.unsubscribers.push(
      this.captureManager.on("error", (error) => {
        this.emit("error", error);
      })
    );
  }
  routeTextMessage(text) {
    try {
      const msg = JSON.parse(text);
      const type = msg.type;
      switch (type) {
        case "transcript": {
          const data = {
            text: msg.text ?? "",
            isFinal: msg.is_final ?? false,
            language: msg.language ?? "en",
            requiresResponse: msg.requires_response ?? false
          };
          this.emit("transcript", data);
          break;
        }
        case "assistant_message": {
          const data = {
            text: msg.text ?? ""
          };
          this.emit("assistantMessage", data);
          break;
        }
        case "llm_required": {
          const data = {
            question: msg.question ?? msg.text ?? ""
          };
          this.emit("llmRequired", data);
          break;
        }
        case "filler_started":
          this.emit("fillerStarted");
          break;
        case "ready":
          this.emit("ready");
          break;
        case "interrupt":
          this.clearAudioQueue();
          this.emit("interrupt");
          break;
        case "diagnostic": {
          const data = {
            code: msg.code ?? "",
            message: msg.message ?? ""
          };
          this.emit("diagnostic", data);
          break;
        }
        case "pong":
          break;
        default:
          this.emit("message", text);
          break;
      }
    } catch {
      this.emit("message", text);
    }
  }
};
var idCounter = 0;
function uniqueId() {
  return `msg_${Date.now()}_${++idCounter}`;
}
function useVoiceChat(config, options) {
  const [messages, setMessages] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState("disconnected");
  const [subtitle, setSubtitle] = useState("Tap to start");
  const sdkRef = useRef(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;
  useEffect(() => {
    const sdk = new VoiceStreamSDK(config);
    sdkRef.current = sdk;
    sdk.on("connectionStateChanged", (state) => {
      setConnectionState(state);
      setIsConnected(state === "connected");
      optionsRef.current?.onConnectionStateChanged?.(state);
      switch (state) {
        case "connecting":
          setSubtitle("Connecting...");
          break;
        case "connected":
          setSubtitle("Connected");
          break;
        case "reconnecting":
          setSubtitle("Reconnecting...");
          break;
        case "disconnected":
          setSubtitle("Tap to start");
          setIsStreaming(false);
          break;
      }
    });
    sdk.on("error", (error) => {
      optionsRef.current?.onError?.(error);
      addMessage({
        type: "system",
        text: error.message,
        language: "en"
      });
    });
    sdk.on("transcript", (data) => {
      if (data.isFinal) {
        setMessages(
          (prev) => prev.filter((m) => !(m.type === "user" && m.isInterim))
        );
        addMessage({
          type: "user",
          text: data.text,
          language: data.language,
          isInterim: false
        });
        if (data.requiresResponse) {
          addThinkingMessage();
          handleLlmRequest({ question: data.text });
        }
      } else {
        setMessages((prev) => {
          const interimIdx = prev.findIndex(
            (m) => m.type === "user" && m.isInterim
          );
          if (interimIdx >= 0) {
            const updated = [...prev];
            updated[interimIdx] = { ...updated[interimIdx], text: data.text };
            return updated;
          }
          return [
            ...prev,
            {
              id: uniqueId(),
              type: "user",
              text: data.text,
              language: data.language,
              timestamp: Date.now(),
              isInterim: true
            }
          ];
        });
      }
    });
    sdk.on("assistantMessage", (data) => {
      removeThinkingMessages();
      addMessage({
        type: "assistant",
        text: data.text,
        language: "en"
      });
    });
    sdk.on("llmRequired", (data) => {
      addThinkingMessage();
      handleLlmRequest(data);
    });
    sdk.on("fillerStarted", () => {
      addThinkingMessage();
    });
    sdk.on("ready", () => {
      setSubtitle("Ready");
    });
    sdk.on("interrupt", () => {
      removeThinkingMessages();
    });
    return () => {
      sdk.cleanup();
      sdkRef.current = null;
    };
  }, [config.serverUrl, config.tenantId]);
  function addMessage(partial) {
    const msg = {
      id: uniqueId(),
      type: partial.type,
      text: partial.text,
      language: partial.language ?? "en",
      timestamp: Date.now(),
      isInterim: partial.isInterim ?? false
    };
    setMessages((prev) => [...prev, msg]);
  }
  function addThinkingMessage() {
    setMessages((prev) => {
      if (prev.some((m) => m.type === "thinking")) return prev;
      return [
        ...prev,
        {
          id: uniqueId(),
          type: "thinking",
          text: "",
          language: "en",
          timestamp: Date.now(),
          isInterim: false
        }
      ];
    });
  }
  function removeThinkingMessages() {
    setMessages((prev) => prev.filter((m) => m.type !== "thinking"));
  }
  async function handleLlmRequest(data) {
    const handler = optionsRef.current?.onLlmResponseRequired;
    if (!handler) return;
    try {
      const response = await handler(data);
      sdkRef.current?.sendLlmResponse(response);
    } catch (err) {
      removeThinkingMessages();
      addMessage({
        type: "system",
        text: "Failed to get AI response",
        language: "en"
      });
    }
  }
  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => {
      const next = !prev;
      if (next && connectionState === "disconnected") {
        sdkRef.current?.connect();
      }
      return next;
    });
  }, [connectionState]);
  const connect = useCallback(() => {
    sdkRef.current?.connect();
  }, []);
  const disconnect = useCallback(() => {
    sdkRef.current?.disconnect();
  }, []);
  const toggleMic = useCallback(async () => {
    const sdk = sdkRef.current;
    if (!sdk) return;
    if (sdk.isStreaming()) {
      sdk.stopAudioStreaming();
      setIsStreaming(false);
      setSubtitle("Mic off");
    } else {
      await sdk.startAudioStreaming();
      setIsStreaming(true);
      setSubtitle("Listening...");
    }
  }, []);
  const sendTextMessage = useCallback((text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    addMessage({
      type: "user",
      text: trimmed,
      language: "en"
    });
    sdkRef.current?.sendChatMessage(trimmed);
    addThinkingMessage();
  }, []);
  return {
    messages,
    isExpanded,
    isStreaming,
    isConnected,
    connectionState,
    subtitle,
    toggleExpanded,
    connect,
    disconnect,
    toggleMic,
    sendTextMessage
  };
}

// src/widget/theme.ts
var DEFAULT_THEME = {
  primaryColor: "#415FAC",
  primaryColorLight: "#6B8DE0",
  backgroundColor: "#FFFFFF",
  textColor: "#1F2937",
  userBubbleColor: "#415FAC",
  userBubbleTextColor: "#FFFFFF",
  assistantBubbleColor: "#F0F2F5",
  assistantBubbleTextColor: "#1F2937",
  systemMessageColor: "#94A3B8",
  headerGradientStart: "#3A54A0",
  headerGradientEnd: "#6B8DE0",
  micActiveColor: "#EF4444",
  connectedDotColor: "#22C55E",
  disconnectedDotColor: "#EF4444",
  fabSize: 56,
  panelMaxWidth: 360,
  panelMaxHeight: 520,
  borderRadius: 16,
  fontFamily: "System"
};
function resolveTheme(partial) {
  if (!partial) return DEFAULT_THEME;
  return { ...DEFAULT_THEME, ...partial };
}
function FloatingButton({ theme, isExpanded, onPress, position }) {
  if (isExpanded) return null;
  const positionStyle = position === "bottom-left" ? { left: 16, bottom: 32 } : { right: 16, bottom: 32 };
  return /* @__PURE__ */ jsx(
    TouchableOpacity,
    {
      onPress,
      activeOpacity: 0.8,
      style: [
        styles.fab,
        positionStyle,
        {
          width: theme.fabSize,
          height: theme.fabSize,
          borderRadius: theme.fabSize / 2,
          backgroundColor: theme.primaryColor
        }
      ],
      children: /* @__PURE__ */ jsxs(View, { style: styles.iconContainer, children: [
        /* @__PURE__ */ jsx(View, { style: [styles.headphoneArc, { borderColor: "#fff" }] }),
        /* @__PURE__ */ jsxs(View, { style: styles.earPieceRow, children: [
          /* @__PURE__ */ jsx(View, { style: [styles.earPiece, { backgroundColor: "#fff" }] }),
          /* @__PURE__ */ jsx(View, { style: [styles.earPiece, { backgroundColor: "#fff" }] })
        ] })
      ] })
    }
  );
}
var styles = StyleSheet.create({
  fab: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 1e3
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 24,
    height: 24
  },
  headphoneArc: {
    width: 18,
    height: 10,
    borderWidth: 2.5,
    borderBottomWidth: 0,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    backgroundColor: "transparent"
  },
  earPieceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 20,
    marginTop: -1
  },
  earPiece: {
    width: 5,
    height: 8,
    borderRadius: 2
  }
});
function StatusIndicator({ connectionState, subtitle, theme }) {
  const isConnected = connectionState === "connected";
  const dotColor = isConnected ? theme.connectedDotColor : theme.disconnectedDotColor;
  return /* @__PURE__ */ jsxs(View, { style: styles2.container, children: [
    /* @__PURE__ */ jsx(View, { style: [styles2.dot, { backgroundColor: dotColor }] }),
    /* @__PURE__ */ jsx(Text, { style: styles2.text, children: subtitle })
  ] });
}
var styles2 = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  text: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)"
  }
});
function ChatHeader({ theme, connectionState, subtitle, onClose }) {
  return /* @__PURE__ */ jsxs(View, { style: [styles3.container, { backgroundColor: theme.headerGradientStart }], children: [
    /* @__PURE__ */ jsx(View, { style: [styles3.avatar, { backgroundColor: "rgba(255,255,255,0.2)" }], children: /* @__PURE__ */ jsxs(View, { style: styles3.avatarIconContainer, children: [
      /* @__PURE__ */ jsx(View, { style: [styles3.headphoneArc, { borderColor: "#fff" }] }),
      /* @__PURE__ */ jsxs(View, { style: styles3.earPieceRow, children: [
        /* @__PURE__ */ jsx(View, { style: [styles3.earPiece, { backgroundColor: "#fff" }] }),
        /* @__PURE__ */ jsx(View, { style: [styles3.earPiece, { backgroundColor: "#fff" }] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs(View, { style: styles3.info, children: [
      /* @__PURE__ */ jsx(Text, { style: styles3.title, children: "AI Assistant" }),
      /* @__PURE__ */ jsx(
        StatusIndicator,
        {
          connectionState,
          subtitle,
          theme
        }
      )
    ] }),
    /* @__PURE__ */ jsx(TouchableOpacity, { onPress: onClose, style: styles3.closeButton, hitSlop: { top: 8, bottom: 8, left: 8, right: 8 }, children: /* @__PURE__ */ jsxs(View, { style: styles3.closeIcon, children: [
      /* @__PURE__ */ jsx(View, { style: [styles3.closeLine, styles3.closeLineA] }),
      /* @__PURE__ */ jsx(View, { style: [styles3.closeLine, styles3.closeLineB] })
    ] }) })
  ] });
}
var styles3 = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10
  },
  avatarIconContainer: {
    alignItems: "center",
    width: 18,
    height: 18
  },
  headphoneArc: {
    width: 14,
    height: 8,
    borderWidth: 2,
    borderBottomWidth: 0,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    backgroundColor: "transparent"
  },
  earPieceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 16,
    marginTop: -1
  },
  earPiece: {
    width: 4,
    height: 6,
    borderRadius: 1.5
  },
  info: {
    flex: 1
  },
  title: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2
  },
  closeButton: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.15)"
  },
  closeIcon: {
    width: 12,
    height: 12,
    alignItems: "center",
    justifyContent: "center"
  },
  closeLine: {
    position: "absolute",
    width: 12,
    height: 2,
    backgroundColor: "#fff",
    borderRadius: 1
  },
  closeLineA: {
    transform: [{ rotate: "45deg" }]
  },
  closeLineB: {
    transform: [{ rotate: "-45deg" }]
  }
});
function MessageBubble({ message, theme }) {
  if (message.type === "thinking") {
    return /* @__PURE__ */ jsx(ThinkingIndicator, { theme });
  }
  if (message.type === "system") {
    return /* @__PURE__ */ jsx(View, { style: styles4.systemContainer, children: /* @__PURE__ */ jsx(Text, { style: [styles4.systemText, { color: theme.systemMessageColor }], children: message.text }) });
  }
  const isUser = message.type === "user";
  const isRTL = message.language === "ar";
  return /* @__PURE__ */ jsxs(
    View,
    {
      style: [
        styles4.bubbleRow,
        isUser ? styles4.userRow : styles4.assistantRow
      ],
      children: [
        !isUser && /* @__PURE__ */ jsx(View, { style: [styles4.avatar, { backgroundColor: theme.primaryColor }], children: /* @__PURE__ */ jsx(Text, { style: styles4.avatarText, children: "AI" }) }),
        /* @__PURE__ */ jsx(
          View,
          {
            style: [
              styles4.bubble,
              isUser ? [
                styles4.userBubble,
                { backgroundColor: theme.userBubbleColor }
              ] : [
                styles4.assistantBubble,
                { backgroundColor: theme.assistantBubbleColor }
              ]
            ],
            children: /* @__PURE__ */ jsx(
              Text,
              {
                style: [
                  styles4.bubbleText,
                  {
                    color: isUser ? theme.userBubbleTextColor : theme.assistantBubbleTextColor,
                    textAlign: isRTL ? "right" : "left",
                    writingDirection: isRTL ? "rtl" : "ltr"
                  }
                ],
                children: message.text
              }
            )
          }
        )
      ]
    }
  );
}
function ThinkingIndicator({ theme }) {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    const animate = (dot, delay) => Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(dot, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        }),
        Animated.timing(dot, {
          toValue: 0.3,
          duration: 300,
          useNativeDriver: true
        })
      ])
    );
    animate(dot1, 0).start();
    animate(dot2, 150).start();
    animate(dot3, 300).start();
    return () => {
      dot1.stopAnimation();
      dot2.stopAnimation();
      dot3.stopAnimation();
    };
  }, [dot1, dot2, dot3]);
  return /* @__PURE__ */ jsxs(View, { style: styles4.assistantRow, children: [
    /* @__PURE__ */ jsx(View, { style: [styles4.avatar, { backgroundColor: theme.primaryColor }], children: /* @__PURE__ */ jsx(Text, { style: styles4.avatarText, children: "AI" }) }),
    /* @__PURE__ */ jsx(View, { style: [styles4.bubble, styles4.assistantBubble, { backgroundColor: theme.assistantBubbleColor }], children: /* @__PURE__ */ jsx(View, { style: styles4.dotsRow, children: [dot1, dot2, dot3].map((dot, i) => /* @__PURE__ */ jsx(
      Animated.View,
      {
        style: [
          styles4.thinkingDot,
          { backgroundColor: theme.systemMessageColor, opacity: dot }
        ]
      },
      i
    )) }) })
  ] });
}
var styles4 = StyleSheet.create({
  bubbleRow: {
    flexDirection: "row",
    marginBottom: 8,
    paddingHorizontal: 12,
    alignItems: "flex-end"
  },
  userRow: {
    justifyContent: "flex-end"
  },
  assistantRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 8,
    paddingHorizontal: 12,
    alignItems: "flex-end"
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6
  },
  avatarText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "700"
  },
  bubble: {
    maxWidth: "75%",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16
  },
  userBubble: {
    borderBottomRightRadius: 4
  },
  assistantBubble: {
    borderBottomLeftRadius: 4
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 20
  },
  systemContainer: {
    alignItems: "center",
    marginVertical: 4,
    paddingHorizontal: 16
  },
  systemText: {
    fontSize: 12,
    textAlign: "center",
    backgroundColor: "rgba(0,0,0,0.04)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: "hidden"
  },
  dotsRow: {
    flexDirection: "row",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 4
  },
  thinkingDot: {
    width: 8,
    height: 8,
    borderRadius: 4
  }
});
function MessageList({ messages, theme }) {
  const listRef = useRef(null);
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        listRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);
  return /* @__PURE__ */ jsx(
    FlatList,
    {
      ref: listRef,
      data: messages,
      keyExtractor: (item) => item.id,
      renderItem: ({ item }) => /* @__PURE__ */ jsx(MessageBubble, { message: item, theme }),
      style: styles5.list,
      contentContainerStyle: styles5.content,
      showsVerticalScrollIndicator: false,
      keyboardShouldPersistTaps: "handled"
    }
  );
}
var styles5 = StyleSheet.create({
  list: {
    flex: 1
  },
  content: {
    paddingVertical: 12
  }
});
function MicButton({ theme, isStreaming, isConnected, onPress }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (isStreaming) {
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(pulseAnim, {
              toValue: 1.4,
              duration: 750,
              useNativeDriver: true
            }),
            Animated.timing(opacityAnim, {
              toValue: 0,
              duration: 750,
              useNativeDriver: true
            })
          ]),
          Animated.parallel([
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 0,
              useNativeDriver: true
            }),
            Animated.timing(opacityAnim, {
              toValue: 0.3,
              duration: 0,
              useNativeDriver: true
            })
          ])
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
      opacityAnim.setValue(0);
    }
  }, [isStreaming, pulseAnim, opacityAnim]);
  const bgColor = isStreaming ? theme.micActiveColor : theme.primaryColor;
  return /* @__PURE__ */ jsxs(View, { style: styles6.wrapper, children: [
    isStreaming && /* @__PURE__ */ jsx(
      Animated.View,
      {
        style: [
          styles6.pulseRing,
          {
            backgroundColor: theme.micActiveColor,
            opacity: opacityAnim,
            transform: [{ scale: pulseAnim }]
          }
        ]
      }
    ),
    /* @__PURE__ */ jsx(
      TouchableOpacity,
      {
        onPress,
        disabled: !isConnected,
        activeOpacity: 0.7,
        style: [
          styles6.button,
          { backgroundColor: bgColor },
          !isConnected && styles6.disabled
        ],
        children: /* @__PURE__ */ jsxs(View, { style: styles6.iconContainer, children: [
          /* @__PURE__ */ jsx(View, { style: [styles6.micBody, { backgroundColor: "#fff" }] }),
          /* @__PURE__ */ jsx(View, { style: [styles6.micBase, { borderColor: "#fff" }] })
        ] })
      }
    )
  ] });
}
var styles6 = StyleSheet.create({
  wrapper: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center"
  },
  pulseRing: {
    position: "absolute",
    width: 44,
    height: 44,
    borderRadius: 22
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2
  },
  disabled: {
    opacity: 0.5
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 16,
    height: 20
  },
  micBody: {
    width: 8,
    height: 12,
    borderRadius: 4
  },
  micBase: {
    width: 14,
    height: 7,
    borderWidth: 2,
    borderTopWidth: 0,
    borderBottomLeftRadius: 7,
    borderBottomRightRadius: 7,
    marginTop: -2,
    backgroundColor: "transparent"
  }
});
function InputBar({ theme, isStreaming, isConnected, onSendText, onMicToggle }) {
  const [text, setText] = useState("");
  const handleSend = () => {
    if (!text.trim()) return;
    onSendText(text.trim());
    setText("");
  };
  return /* @__PURE__ */ jsxs(View, { style: styles7.container, children: [
    /* @__PURE__ */ jsx(
      TextInput,
      {
        style: [styles7.input, { color: theme.textColor }],
        value: text,
        onChangeText: setText,
        placeholder: "Type a message...",
        placeholderTextColor: "#9CA3AF",
        returnKeyType: "send",
        onSubmitEditing: handleSend,
        editable: isConnected
      }
    ),
    text.trim().length > 0 ? /* @__PURE__ */ jsx(
      TouchableOpacity,
      {
        onPress: handleSend,
        style: [styles7.sendButton, { backgroundColor: theme.primaryColor }],
        activeOpacity: 0.7,
        children: /* @__PURE__ */ jsxs(View, { style: styles7.arrowUp, children: [
          /* @__PURE__ */ jsx(View, { style: [styles7.arrowLine, { backgroundColor: "#fff" }] }),
          /* @__PURE__ */ jsx(View, { style: [styles7.arrowHead, { borderBottomColor: "#fff" }] })
        ] })
      }
    ) : /* @__PURE__ */ jsx(
      MicButton,
      {
        theme,
        isStreaming,
        isConnected,
        onPress: onMicToggle
      }
    )
  ] });
}
var styles7 = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#F3F4F6",
    gap: 8
  },
  input: {
    flex: 1,
    height: 36,
    fontSize: 14,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB"
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center"
  },
  arrowUp: {
    alignItems: "center",
    justifyContent: "center",
    width: 14,
    height: 14
  },
  arrowLine: {
    width: 2,
    height: 10,
    borderRadius: 1
  },
  arrowHead: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 6,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    marginTop: -6
  }
});
function PoweredByFooter() {
  return /* @__PURE__ */ jsx(View, { style: styles8.container, children: /* @__PURE__ */ jsx(Text, { style: styles8.text, children: "Powered by smartserve.ai" }) });
}
var styles8 = StyleSheet.create({
  container: {
    paddingVertical: 6,
    alignItems: "center"
  },
  text: {
    fontSize: 10,
    color: "rgba(0,0,0,0.3)"
  }
});
var { width: screenWidth, height: screenHeight } = Dimensions.get("window");
function ChatPanel({
  theme,
  messages,
  connectionState,
  isStreaming,
  subtitle,
  onClose,
  onSendText,
  onMicToggle
}) {
  const panelWidth = Math.min(theme.panelMaxWidth, screenWidth - 32);
  const panelHeight = Math.min(theme.panelMaxHeight, screenHeight - 120);
  return /* @__PURE__ */ jsx(
    KeyboardAvoidingView,
    {
      behavior: Platform.OS === "ios" ? "padding" : "height",
      style: styles9.keyboardAvoid,
      children: /* @__PURE__ */ jsxs(
        View,
        {
          style: [
            styles9.panel,
            {
              width: panelWidth,
              height: panelHeight,
              backgroundColor: theme.backgroundColor,
              borderRadius: theme.borderRadius
            }
          ],
          children: [
            /* @__PURE__ */ jsx(
              ChatHeader,
              {
                theme,
                connectionState,
                subtitle,
                onClose
              }
            ),
            /* @__PURE__ */ jsx(
              MessageList,
              {
                messages,
                theme
              }
            ),
            /* @__PURE__ */ jsx(PoweredByFooter, {}),
            /* @__PURE__ */ jsx(
              InputBar,
              {
                theme,
                isStreaming,
                isConnected: connectionState === "connected",
                onSendText,
                onMicToggle
              }
            )
          ]
        }
      )
    }
  );
}
var styles9 = StyleSheet.create({
  keyboardAvoid: {
    position: "absolute",
    right: 16,
    bottom: 32,
    zIndex: 1001
  },
  panel: {
    overflow: "hidden",
    elevation: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16
  }
});
function VoiceChatWidget({
  config,
  theme: themeOverrides,
  position = "bottom-right",
  onConnectionStateChanged,
  onError,
  onLlmResponseRequired
}) {
  const theme = resolveTheme(themeOverrides);
  const voiceChat = useVoiceChat(config, {
    onConnectionStateChanged,
    onError,
    onLlmResponseRequired
  });
  return /* @__PURE__ */ jsxs(View, { style: styles10.container, pointerEvents: "box-none", children: [
    voiceChat.isExpanded && /* @__PURE__ */ jsx(TouchableWithoutFeedback, { onPress: voiceChat.toggleExpanded, children: /* @__PURE__ */ jsx(View, { style: styles10.overlay }) }),
    voiceChat.isExpanded && /* @__PURE__ */ jsx(
      ChatPanel,
      {
        theme,
        messages: voiceChat.messages,
        connectionState: voiceChat.connectionState,
        isStreaming: voiceChat.isStreaming,
        subtitle: voiceChat.subtitle,
        onClose: voiceChat.toggleExpanded,
        onSendText: voiceChat.sendTextMessage,
        onMicToggle: voiceChat.toggleMic
      }
    ),
    /* @__PURE__ */ jsx(
      FloatingButton,
      {
        theme,
        isExpanded: voiceChat.isExpanded,
        onPress: voiceChat.toggleExpanded,
        position
      }
    )
  ] });
}
var styles10 = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)"
  }
});

export { DEFAULT_THEME, VoiceChatWidget, VoiceStreamSDK, amplifyPCM16, arrayBufferToBase64, base64ToArrayBuffer, decodePCM16LEToFloat32, encodeFloat32ToPCM16LE, resolveConfig, resolveTheme, useVoiceChat };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map