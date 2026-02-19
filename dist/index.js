"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.arrayBufferToBase64 = exports.base64ToArrayBuffer = exports.amplifyPCM16 = exports.encodeFloat32ToPCM16LE = exports.decodePCM16LEToFloat32 = exports.DEFAULT_THEME = exports.resolveTheme = exports.useVoiceChat = exports.VoiceChatWidget = exports.resolveConfig = exports.VoiceStreamSDK = void 0;
// ─── Core SDK ───────────────────────────────────────────────────
var voice_stream_sdk_1 = require("./core/voice-stream-sdk");
Object.defineProperty(exports, "VoiceStreamSDK", { enumerable: true, get: function () { return voice_stream_sdk_1.VoiceStreamSDK; } });
var voice_stream_config_1 = require("./core/voice-stream-config");
Object.defineProperty(exports, "resolveConfig", { enumerable: true, get: function () { return voice_stream_config_1.resolveConfig; } });
// ─── Widget ─────────────────────────────────────────────────────
var VoiceChatWidget_1 = require("./widget/components/VoiceChatWidget");
Object.defineProperty(exports, "VoiceChatWidget", { enumerable: true, get: function () { return VoiceChatWidget_1.VoiceChatWidget; } });
var use_voice_chat_1 = require("./widget/hooks/use-voice-chat");
Object.defineProperty(exports, "useVoiceChat", { enumerable: true, get: function () { return use_voice_chat_1.useVoiceChat; } });
var theme_1 = require("./widget/theme");
Object.defineProperty(exports, "resolveTheme", { enumerable: true, get: function () { return theme_1.resolveTheme; } });
Object.defineProperty(exports, "DEFAULT_THEME", { enumerable: true, get: function () { return theme_1.DEFAULT_THEME; } });
// ─── Utilities ──────────────────────────────────────────────────
var audio_format_1 = require("./core/utils/audio-format");
Object.defineProperty(exports, "decodePCM16LEToFloat32", { enumerable: true, get: function () { return audio_format_1.decodePCM16LEToFloat32; } });
Object.defineProperty(exports, "encodeFloat32ToPCM16LE", { enumerable: true, get: function () { return audio_format_1.encodeFloat32ToPCM16LE; } });
Object.defineProperty(exports, "amplifyPCM16", { enumerable: true, get: function () { return audio_format_1.amplifyPCM16; } });
Object.defineProperty(exports, "base64ToArrayBuffer", { enumerable: true, get: function () { return audio_format_1.base64ToArrayBuffer; } });
Object.defineProperty(exports, "arrayBufferToBase64", { enumerable: true, get: function () { return audio_format_1.arrayBufferToBase64; } });
//# sourceMappingURL=index.js.map