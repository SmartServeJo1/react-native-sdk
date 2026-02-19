import { TypedEventEmitter } from './event-emitter';
import type { WSManagerEventMap, ResolvedConfig, ConnectionState } from './types';
/**
 * Manages WebSocket connection with automatic reconnection,
 * keep-alive pings, and message routing.
 *
 * Mirrors iOS WebSocketManager.swift
 */
export declare class WebSocketManager extends TypedEventEmitter<WSManagerEventMap> {
    private ws;
    private config;
    private state;
    private reconnectAttempts;
    private reconnectTimer;
    private pingTimer;
    private manualDisconnect;
    constructor(config: ResolvedConfig);
    getConnectionState(): ConnectionState;
    isConnected(): boolean;
    connect(): void;
    disconnect(): void;
    sendText(text: string): void;
    sendBinary(data: ArrayBuffer): void;
    sendJSON(payload: Record<string, unknown>): void;
    cleanup(): void;
    private openConnection;
    private buildUrl;
    private handleOpen;
    private handleClose;
    private handleError;
    private handleMessage;
    private startPingTimer;
    private scheduleReconnect;
    private setState;
    private clearTimers;
    private clearPingTimer;
}
//# sourceMappingURL=websocket-manager.d.ts.map