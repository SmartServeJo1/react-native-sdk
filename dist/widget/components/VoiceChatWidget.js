"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoiceChatWidget = VoiceChatWidget;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_native_1 = require("react-native");
const use_voice_chat_1 = require("../hooks/use-voice-chat");
const theme_1 = require("../theme");
const FloatingButton_1 = require("./FloatingButton");
const ChatPanel_1 = require("./ChatPanel");
/**
 * Drop-in voice chat widget with floating action button.
 * Renders a FAB that expands into a full chat panel.
 *
 * Mirrors iOS VoiceChatView.swift
 *
 * Usage:
 *   <VoiceChatWidget
 *     config={{ serverUrl: '...', tenantId: '...' }}
 *     theme={{ primaryColor: '#6366F1' }}
 *     onLlmResponseRequired={async ({ question }) => await myLLM(question)}
 *   />
 */
function VoiceChatWidget({ config, theme: themeOverrides, position = 'bottom-right', onConnectionStateChanged, onError, onLlmResponseRequired, }) {
    const theme = (0, theme_1.resolveTheme)(themeOverrides);
    const voiceChat = (0, use_voice_chat_1.useVoiceChat)(config, {
        onConnectionStateChanged,
        onError,
        onLlmResponseRequired,
    });
    return ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.container, pointerEvents: "box-none", children: [voiceChat.isExpanded && ((0, jsx_runtime_1.jsx)(react_native_1.TouchableWithoutFeedback, { onPress: voiceChat.toggleExpanded, children: (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.overlay }) })), voiceChat.isExpanded && ((0, jsx_runtime_1.jsx)(ChatPanel_1.ChatPanel, { theme: theme, messages: voiceChat.messages, connectionState: voiceChat.connectionState, isStreaming: voiceChat.isStreaming, subtitle: voiceChat.subtitle, onClose: voiceChat.toggleExpanded, onSendText: voiceChat.sendTextMessage, onMicToggle: voiceChat.toggleMic })), (0, jsx_runtime_1.jsx)(FloatingButton_1.FloatingButton, { theme: theme, isExpanded: voiceChat.isExpanded, onPress: voiceChat.toggleExpanded, position: position })] }));
}
const styles = react_native_1.StyleSheet.create({
    container: {
        ...react_native_1.StyleSheet.absoluteFillObject,
        zIndex: 999,
    },
    overlay: {
        ...react_native_1.StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
});
//# sourceMappingURL=VoiceChatWidget.js.map