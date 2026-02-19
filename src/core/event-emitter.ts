/**
 * Lightweight typed event emitter for internal use.
 * Avoids external dependencies while providing full type safety.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class TypedEventEmitter<EventMap extends Record<string, any> = Record<string, any>> {
  private listeners = new Map<keyof EventMap, Set<Function>>();

  on<K extends keyof EventMap>(
    event: K,
    callback: EventMap[K] extends void ? () => void : (data: EventMap[K]) => void,
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  off<K extends keyof EventMap>(
    event: K,
    callback: Function,
  ): void {
    this.listeners.get(event)?.delete(callback);
  }

  protected emit<K extends keyof EventMap>(
    ...[event, data]: EventMap[K] extends void ? [K] : [K, EventMap[K]]
  ): void {
    const set = this.listeners.get(event);
    if (!set) return;
    for (const cb of set) {
      try {
        cb(data);
      } catch {
        // Swallow listener errors to prevent cascade
      }
    }
  }

  removeAllListeners(): void {
    this.listeners.clear();
  }
}
