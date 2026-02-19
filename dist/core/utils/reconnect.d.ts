/**
 * Calculate exponential backoff delay with jitter.
 * Matches the iOS SDK's reconnection strategy.
 *
 * @param attempt - Current attempt number (0-indexed)
 * @param baseDelay - Initial delay in ms
 * @param maxDelay - Maximum delay cap in ms
 * @returns Delay in ms
 */
export declare function calculateBackoff(attempt: number, baseDelay: number, maxDelay: number): number;
//# sourceMappingURL=reconnect.d.ts.map