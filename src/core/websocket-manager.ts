import { TypedEventEmitter } from './event-emitter';
import type { WSManagerEventMap, ResolvedConfig, ConnectionState } from './types';
import { calculateBackoff } from './utils/reconnect';
import { logDebug, logWarn, logError } from './utils/logger';

/**
 * Manages WebSocket connection with automatic reconnection,
 * keep-alive pings, and message routing.
 *
 * Mirrors iOS WebSocketManager.swift
 */
export class WebSocketManager extends TypedEventEmitter<WSManagerEventMap> {
  private ws: WebSocket | null = null;
  private config: ResolvedConfig;
  private state: ConnectionState = 'disconnected';
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private pingTimer: ReturnType<typeof setTimeout> | null = null;
  private manualDisconnect = false;

  constructor(config: ResolvedConfig) {
    super();
    this.config = config;
  }

  getConnectionState(): ConnectionState {
    return this.state;
  }

  isConnected(): boolean {
    return this.state === 'connected';
  }

  connect(): void {
    if (this.state === 'connected' || this.state === 'connecting') return;

    this.manualDisconnect = false;
    this.reconnectAttempts = 0;
    this.setState('connecting');
    this.openConnection();
  }

  disconnect(): void {
    this.manualDisconnect = true;
    this.clearTimers();

    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onclose = null;
      this.ws.onerror = null;
      this.ws.onmessage = null;
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }

    this.setState('disconnected');
    this.emit('close', { code: 1000, reason: 'Client disconnect' });
  }

  sendText(text: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      logWarn('Cannot send text: WebSocket not open');
      return;
    }
    this.ws.send(text);
  }

  sendBinary(data: ArrayBuffer): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }
    this.ws.send(data);
  }

  sendJSON(payload: Record<string, unknown>): void {
    this.sendText(JSON.stringify(payload));
  }

  cleanup(): void {
    this.disconnect();
    this.removeAllListeners();
  }

  // ─── Private ──────────────────────────────────────────────────

  private openConnection(): void {
    try {
      const url = this.buildUrl();
      logDebug('Connecting to', url);

      this.ws = new WebSocket(url);
      // React Native WebSocket supports binaryType
      (this.ws as any).binaryType = 'arraybuffer';

      this.ws.onopen = () => this.handleOpen();
      this.ws.onclose = (event: any) => this.handleClose(event);
      this.ws.onerror = () => this.handleError();
      this.ws.onmessage = (event: any) => this.handleMessage(event);
    } catch (err) {
      logError('Connection failed:', err);
      this.emit('error', String(err));
      this.scheduleReconnect();
    }
  }

  private buildUrl(): string {
    const base = this.config.serverUrl;
    const params = new URLSearchParams();
    params.set('tenantId', this.config.tenantId);
    if (this.config.authToken) {
      params.set('token', this.config.authToken);
    }
    params.set('channel', 'react-native');

    const separator = base.includes('?') ? '&' : '?';
    return `${base}${separator}${params.toString()}`;
  }

  private handleOpen(): void {
    logDebug('WebSocket connected');
    this.reconnectAttempts = 0;
    this.setState('connected');

    // Send tenant info immediately (matches iOS SDK behavior)
    this.sendJSON({
      type: 'tenant_info',
      tenant_id: this.config.tenantId,
      tenant_name: this.config.tenantName,
      ...(this.config.authToken && { auth_token: this.config.authToken }),
      ...(this.config.aiClinicMode && { ai_clinic_mode: true }),
      ...(this.config.fillerPhraseEn && { filler_phrase_en: this.config.fillerPhraseEn }),
      ...(this.config.fillerPhraseAr && { filler_phrase_ar: this.config.fillerPhraseAr }),
    });

    this.startPingTimer();
    this.emit('open');
  }

  private handleClose(event: WebSocketCloseEvent): void {
    logDebug('WebSocket closed:', event.code, event.reason);
    this.clearTimers();
    this.ws = null;

    if (this.manualDisconnect) {
      this.setState('disconnected');
      this.emit('close', { code: event.code, reason: event.reason ?? '' });
      return;
    }

    this.emit('close', { code: event.code, reason: event.reason ?? '' });
    this.scheduleReconnect();
  }

  private handleError(): void {
    logError('WebSocket error');
    this.emit('error', 'WebSocket connection error');
  }

  private handleMessage(event: WebSocketMessageEvent): void {
    // Binary audio frame
    if (event.data instanceof ArrayBuffer) {
      this.emit('binaryMessage', event.data);
      return;
    }

    // Text message (JSON)
    if (typeof event.data === 'string') {
      logDebug('Received text:', event.data.substring(0, 100));
      this.emit('textMessage', event.data);
      return;
    }

    logWarn('Unknown message type received');
  }

  private startPingTimer(): void {
    this.clearPingTimer();
    this.pingTimer = setInterval(() => {
      if (this.isConnected()) {
        this.sendJSON({ type: 'ping', ts: Date.now() });
      }
    }, this.config.pingIntervalMs);
  }

  private scheduleReconnect(): void {
    if (this.manualDisconnect || !this.config.autoReconnect) {
      this.setState('disconnected');
      return;
    }

    // Check max attempts (0 = unlimited)
    if (
      this.config.maxReconnectAttempts > 0 &&
      this.reconnectAttempts >= this.config.maxReconnectAttempts
    ) {
      logError('Max reconnection attempts reached');
      this.setState('disconnected');
      this.emit('error', 'Max reconnection attempts reached');
      return;
    }

    this.setState('reconnecting');
    const delay = calculateBackoff(
      this.reconnectAttempts,
      this.config.reconnectDelayMs,
      this.config.maxReconnectDelayMs,
    );

    logDebug(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1})`);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++;
      this.openConnection();
    }, delay);
  }

  private setState(newState: ConnectionState): void {
    if (this.state === newState) return;
    this.state = newState;
    this.emit('connectionStateChanged', newState);
  }

  private clearTimers(): void {
    this.clearPingTimer();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private clearPingTimer(): void {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }
}

// React Native WebSocket event types
interface WebSocketCloseEvent {
  code: number;
  reason?: string;
}

interface WebSocketMessageEvent {
  data: string | ArrayBuffer;
}
