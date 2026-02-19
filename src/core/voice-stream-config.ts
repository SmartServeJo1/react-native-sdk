import type { VoiceStreamConfig, ResolvedConfig } from './types';

const DEFAULTS = {
  autoReconnect: true,
  maxReconnectAttempts: 5,
  reconnectDelayMs: 1000,
  maxReconnectDelayMs: 30000,
  pingIntervalMs: 30000,
  audioInputSampleRate: 16000,
  audioOutputSampleRate: 24000,
  audioChannels: 1,
  audioBitDepth: 16,
  audioBufferSize: 1600,
  enableDebugLogging: false,
  aiClinicMode: false,
} as const;

/**
 * Resolves a partial VoiceStreamConfig into a fully-populated ResolvedConfig
 * by applying default values for any unspecified fields.
 */
export function resolveConfig(config: VoiceStreamConfig): ResolvedConfig {
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
    fillerPhraseAr: config.fillerPhraseAr,
  };
}
