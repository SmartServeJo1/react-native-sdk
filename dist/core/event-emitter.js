"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypedEventEmitter = void 0;
/**
 * Lightweight typed event emitter for internal use.
 * Avoids external dependencies while providing full type safety.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
class TypedEventEmitter {
    constructor() {
        this.listeners = new Map();
    }
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);
        // Return unsubscribe function
        return () => {
            this.listeners.get(event)?.delete(callback);
        };
    }
    off(event, callback) {
        this.listeners.get(event)?.delete(callback);
    }
    emit(...[event, data]) {
        const set = this.listeners.get(event);
        if (!set)
            return;
        for (const cb of set) {
            try {
                cb(data);
            }
            catch {
                // Swallow listener errors to prevent cascade
            }
        }
    }
    removeAllListeners() {
        this.listeners.clear();
    }
}
exports.TypedEventEmitter = TypedEventEmitter;
//# sourceMappingURL=event-emitter.js.map