const JITTER_FACTOR = 0.3;

/**
 * Calculate exponential backoff delay with jitter.
 * Matches the iOS SDK's reconnection strategy.
 *
 * @param attempt - Current attempt number (0-indexed)
 * @param baseDelay - Initial delay in ms
 * @param maxDelay - Maximum delay cap in ms
 * @returns Delay in ms
 */
export function calculateBackoff(
  attempt: number,
  baseDelay: number,
  maxDelay: number,
): number {
  const exponential = Math.min(maxDelay, baseDelay * Math.pow(2, attempt));
  const jitter = exponential * JITTER_FACTOR * Math.random();
  return Math.floor(exponential + jitter);
}
