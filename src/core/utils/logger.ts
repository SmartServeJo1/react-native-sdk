const TAG = '[VoiceStreamSDK]';

let debugEnabled = false;

export function setDebugLogging(enabled: boolean): void {
  debugEnabled = enabled;
}

export function logDebug(...args: unknown[]): void {
  if (debugEnabled) {
    console.log(TAG, ...args);
  }
}

export function logWarn(...args: unknown[]): void {
  console.warn(TAG, ...args);
}

export function logError(...args: unknown[]): void {
  console.error(TAG, ...args);
}
