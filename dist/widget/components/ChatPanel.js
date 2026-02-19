"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatPanel = ChatPanel;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_native_1 = require("react-native");
const ChatHeader_1 = require("./ChatHeader");
const MessageList_1 = require("./MessageList");
const InputBar_1 = require("./InputBar");
const PoweredByFooter_1 = require("./PoweredByFooter");
const { width: screenWidth, height: screenHeight } = react_native_1.Dimensions.get('window');
/**
 * Expanded chat panel with header, message list, and input bar.
 * Mirrors iOS VoiceChatView expanded state.
 */
function ChatPanel({ theme, messages, connectionState, isStreaming, subtitle, onClose, onSendText, onMicToggle, }) {
    const panelWidth = Math.min(theme.panelMaxWidth, screenWidth - 32);
    const panelHeight = Math.min(theme.panelMaxHeight, screenHeight - 120);
    return ((0, jsx_runtime_1.jsx)(react_native_1.KeyboardAvoidingView, { behavior: react_native_1.Platform.OS === 'ios' ? 'padding' : 'height', style: styles.keyboardAvoid, children: (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: [
                styles.panel,
                {
                    width: panelWidth,
                    height: panelHeight,
                    backgroundColor: theme.backgroundColor,
                    borderRadius: theme.borderRadius,
                },
            ], children: [(0, jsx_runtime_1.jsx)(ChatHeader_1.ChatHeader, { theme: theme, connectionState: connectionState, subtitle: subtitle, onClose: onClose }), (0, jsx_runtime_1.jsx)(MessageList_1.MessageList, { messages: messages, theme: theme }), (0, jsx_runtime_1.jsx)(PoweredByFooter_1.PoweredByFooter, {}), (0, jsx_runtime_1.jsx)(InputBar_1.InputBar, { theme: theme, isStreaming: isStreaming, isConnected: connectionState === 'connected', onSendText: onSendText, onMicToggle: onMicToggle })] }) }));
}
const styles = react_native_1.StyleSheet.create({
    keyboardAvoid: {
        position: 'absolute',
        right: 16,
        bottom: 32,
        zIndex: 1001,
    },
    panel: {
        overflow: 'hidden',
        elevation: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
    },
});
//# sourceMappingURL=ChatPanel.js.map