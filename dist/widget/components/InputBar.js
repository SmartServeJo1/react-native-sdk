"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputBar = InputBar;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_native_1 = require("react-native");
const MicButton_1 = require("./MicButton");
/**
 * Input bar with text field, send button, and mic toggle.
 * Mirrors iOS VoiceChatView input bar.
 */
function InputBar({ theme, isStreaming, isConnected, onSendText, onMicToggle }) {
    const [text, setText] = (0, react_1.useState)('');
    const handleSend = () => {
        if (!text.trim())
            return;
        onSendText(text.trim());
        setText('');
    };
    return ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.container, children: [(0, jsx_runtime_1.jsx)(react_native_1.TextInput, { style: [styles.input, { color: theme.textColor }], value: text, onChangeText: setText, placeholder: "Type a message...", placeholderTextColor: "#9CA3AF", returnKeyType: "send", onSubmitEditing: handleSend, editable: isConnected }), text.trim().length > 0 ? ((0, jsx_runtime_1.jsx)(react_native_1.TouchableOpacity, { onPress: handleSend, style: [styles.sendButton, { backgroundColor: theme.primaryColor }], activeOpacity: 0.7, children: (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.arrowUp, children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { style: [styles.arrowLine, { backgroundColor: '#fff' }] }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: [styles.arrowHead, { borderBottomColor: '#fff' }] })] }) })) : ((0, jsx_runtime_1.jsx)(MicButton_1.MicButton, { theme: theme, isStreaming: isStreaming, isConnected: isConnected, onPress: onMicToggle }))] }));
}
const styles = react_native_1.StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#F3F4F6',
        gap: 8,
    },
    input: {
        flex: 1,
        height: 36,
        fontSize: 14,
        paddingHorizontal: 12,
        backgroundColor: '#fff',
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    sendButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    arrowUp: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 14,
        height: 14,
    },
    arrowLine: {
        width: 2,
        height: 10,
        borderRadius: 1,
    },
    arrowHead: {
        width: 0,
        height: 0,
        borderLeftWidth: 5,
        borderRightWidth: 5,
        borderBottomWidth: 6,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        marginTop: -6,
    },
});
//# sourceMappingURL=InputBar.js.map