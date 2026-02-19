"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatHeader = ChatHeader;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_native_1 = require("react-native");
const StatusIndicator_1 = require("./StatusIndicator");
/**
 * Chat panel header with gradient background, title, status, and close button.
 * Mirrors iOS VoiceChatView header.
 *
 * Note: Uses solid background by default. If react-native-linear-gradient
 * is available, consumers can wrap this or pass gradient colors.
 */
function ChatHeader({ theme, connectionState, subtitle, onClose }) {
    return ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: [styles.container, { backgroundColor: theme.headerGradientStart }], children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { style: [styles.avatar, { backgroundColor: 'rgba(255,255,255,0.2)' }], children: (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.avatarIconContainer, children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { style: [styles.headphoneArc, { borderColor: '#fff' }] }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.earPieceRow, children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { style: [styles.earPiece, { backgroundColor: '#fff' }] }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: [styles.earPiece, { backgroundColor: '#fff' }] })] })] }) }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.info, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.title, children: "AI Assistant" }), (0, jsx_runtime_1.jsx)(StatusIndicator_1.StatusIndicator, { connectionState: connectionState, subtitle: subtitle, theme: theme })] }), (0, jsx_runtime_1.jsx)(react_native_1.TouchableOpacity, { onPress: onClose, style: styles.closeButton, hitSlop: { top: 8, bottom: 8, left: 8, right: 8 }, children: (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.closeIcon, children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { style: [styles.closeLine, styles.closeLineA] }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: [styles.closeLine, styles.closeLineB] })] }) })] }));
}
const styles = react_native_1.StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    avatarIconContainer: {
        alignItems: 'center',
        width: 18,
        height: 18,
    },
    headphoneArc: {
        width: 14,
        height: 8,
        borderWidth: 2,
        borderBottomWidth: 0,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        backgroundColor: 'transparent',
    },
    earPieceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: 16,
        marginTop: -1,
    },
    earPiece: {
        width: 4,
        height: 6,
        borderRadius: 1.5,
    },
    info: {
        flex: 1,
    },
    title: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 2,
    },
    closeButton: {
        width: 28,
        height: 28,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.15)',
    },
    closeIcon: {
        width: 12,
        height: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeLine: {
        position: 'absolute',
        width: 12,
        height: 2,
        backgroundColor: '#fff',
        borderRadius: 1,
    },
    closeLineA: {
        transform: [{ rotate: '45deg' }],
    },
    closeLineB: {
        transform: [{ rotate: '-45deg' }],
    },
});
//# sourceMappingURL=ChatHeader.js.map