/**
 * Lightweight typed event emitter for internal use.
 * Avoids external dependencies while providing full type safety.
 */
export declare class TypedEventEmitter<EventMap extends Record<string, any> = Record<string, any>> {
    private listeners;
    on<K extends keyof EventMap>(event: K, callback: EventMap[K] extends void ? () => void : (data: EventMap[K]) => void): () => void;
    off<K extends keyof EventMap>(event: K, callback: Function): void;
    protected emit<K extends keyof EventMap>(...[event, data]: EventMap[K] extends void ? [K] : [K, EventMap[K]]): void;
    removeAllListeners(): void;
}
//# sourceMappingURL=event-emitter.d.ts.map