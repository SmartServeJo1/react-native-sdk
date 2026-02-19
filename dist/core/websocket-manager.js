"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketManager = void 0;
const event_emitter_1 = require("./event-emitter");
const reconnect_1 = require("./utils/reconnect");
const logger_1 = require("./utils/logger");
/**
 * Manages WebSocket connection with automatic reconnection,
 * keep-alive pings, and message routing.
 *
 * Mirrors iOS WebSocketManager.swift
 */
class WebSocketManager extends event_emitter_1.TypedEventEmitter {
    constructor(config) {
        super();
        this.ws = null;
        this.state = 'disconnected';
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
        return this.state === 'connected';
    }
    connect() {
        if (this.state === 'connected' || this.state === 'connecting')
            return;
        this.manualDisconnect = false;
        this.reconnectAttempts = 0;
        this.setState('connecting');
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
            this.ws.close(1000, 'Client disconnect');
            this.ws = null;
        }
        this.setState('disconnected');
        this.emit('close', { code: 1000, reason: 'Client disconnect' });
    }
    sendText(text) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            (0, logger_1.logWarn)('Cannot send text: WebSocket not open');
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
            (0, logger_1.logDebug)('Connecting to', url);
            this.ws = new WebSocket(url);
            // React Native WebSocket supports binaryType
            this.ws.binaryType = 'arraybuffer';
            this.ws.onopen = () => this.handleOpen();
            this.ws.onclose = (event) => this.handleClose(event);
            this.ws.onerror = () => this.handleError();
            this.ws.onmessage = (event) => this.handleMessage(event);
        }
        catch (err) {
            (0, logger_1.logError)('Connection failed:', err);
            this.emit('error', String(err));
            this.scheduleReconnect();
        }
    }
    buildUrl() {
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
    handleOpen() {
        (0, logger_1.logDebug)('WebSocket connected');
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
    handleClose(event) {
        (0, logger_1.logDebug)('WebSocket closed:', event.code, event.reason);
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
    handleError() {
        (0, logger_1.logError)('WebSocket error');
        this.emit('error', 'WebSocket connection error');
    }
    handleMessage(event) {
        // Binary audio frame
        if (event.data instanceof ArrayBuffer) {
            this.emit('binaryMessage', event.data);
            return;
        }
        // Text message (JSON)
        if (typeof event.data === 'string') {
            (0, logger_1.logDebug)('Received text:', event.data.substring(0, 100));
            this.emit('textMessage', event.data);
            return;
        }
        (0, logger_1.logWarn)('Unknown message type received');
    }
    startPingTimer() {
        this.clearPingTimer();
        this.pingTimer = setInterval(() => {
            if (this.isConnected()) {
                this.sendJSON({ type: 'ping', ts: Date.now() });
            }
        }, this.config.pingIntervalMs);
    }
    scheduleReconnect() {
        if (this.manualDisconnect || !this.config.autoReconnect) {
            this.setState('disconnected');
            return;
        }
        // Check max attempts (0 = unlimited)
        if (this.config.maxReconnectAttempts > 0 &&
            this.reconnectAttempts >= this.config.maxReconnectAttempts) {
            (0, logger_1.logError)('Max reconnection attempts reached');
            this.setState('disconnected');
            this.emit('error', 'Max reconnection attempts reached');
            return;
        }
        this.setState('reconnecting');
        const delay = (0, reconnect_1.calculateBackoff)(this.reconnectAttempts, this.config.reconnectDelayMs, this.config.maxReconnectDelayMs);
        (0, logger_1.logDebug)(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1})`);
        this.reconnectTimer = setTimeout(() => {
            this.reconnectAttempts++;
            this.openConnection();
        }, delay);
    }
    setState(newState) {
        if (this.state === newState)
            return;
        this.state = newState;
        this.emit('connectionStateChanged', newState);
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
}
exports.WebSocketManager = WebSocketManager;
//# sourceMappingURL=websocket-manager.js.map