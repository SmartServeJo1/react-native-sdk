// ─── Core SDK ───────────────────────────────────────────────────
export { VoiceStreamSDK } from './core/voice-stream-sdk';
export { resolveConfig } from './core/voice-stream-config';

// ─── Core Types ─────────────────────────────────────────────────
export type {
  VoiceStreamConfig,
  ResolvedConfig,
  ConnectionState,
  VoiceStreamError,
  VoiceStreamErrorCode,
  VoiceStreamEventMap,
  TranscriptData,
  AssistantMessageData,
  LlmRequiredData,
  DiagnosticData,
} from './core/types';

// ─── Widget ─────────────────────────────────────────────────────
export { VoiceChatWidget } from './widget/components/VoiceChatWidget';
export { useVoiceChat } from './widget/hooks/use-voice-chat';
export { resolveTheme, DEFAULT_THEME } from './widget/theme';

// ─── Widget Types ───────────────────────────────────────────────
export type {
  VoiceChatTheme,
} from './widget/theme';

export type {
  ChatMessage,
  ChatMessageType,
  VoiceChatWidgetProps,
} from './widget/types';

// ─── Utilities ──────────────────────────────────────────────────
export {
  decodePCM16LEToFloat32,
  encodeFloat32ToPCM16LE,
  amplifyPCM16,
  base64ToArrayBuffer,
  arrayBufferToBase64,
} from './core/utils/audio-format';
