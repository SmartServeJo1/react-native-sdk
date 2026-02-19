"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FloatingButton = FloatingButton;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_native_1 = require("react-native");
/**
 * Floating Action Button that opens/closes the chat panel.
 * Mirrors iOS VoiceChatView FAB.
 */
function FloatingButton({ theme, isExpanded, onPress, position }) {
    if (isExpanded)
        return null;
    const positionStyle = position === 'bottom-left'
        ? { left: 16, bottom: 32 }
        : { right: 16, bottom: 32 };
    return ((0, jsx_runtime_1.jsx)(react_native_1.TouchableOpacity, { onPress: onPress, activeOpacity: 0.8, style: [
            styles.fab,
            positionStyle,
            {
                width: theme.fabSize,
                height: theme.fabSize,
                borderRadius: theme.fabSize / 2,
                backgroundColor: theme.primaryColor,
            },
        ], children: (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.iconContainer, children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { style: [styles.headphoneArc, { borderColor: '#fff' }] }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.earPieceRow, children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { style: [styles.earPiece, { backgroundColor: '#fff' }] }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: [styles.earPiece, { backgroundColor: '#fff' }] })] })] }) }));
}
const styles = react_native_1.StyleSheet.create({
    fab: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        zIndex: 1000,
    },
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 24,
        height: 24,
    },
    headphoneArc: {
        width: 18,
        height: 10,
        borderWidth: 2.5,
        borderBottomWidth: 0,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        backgroundColor: 'transparent',
    },
    earPieceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: 20,
        marginTop: -1,
    },
    earPiece: {
        width: 5,
        height: 8,
        borderRadius: 2,
    },
});
//# sourceMappingURL=FloatingButton.js.map