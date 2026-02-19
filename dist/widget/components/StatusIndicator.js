"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusIndicator = StatusIndicator;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_native_1 = require("react-native");
function StatusIndicator({ connectionState, subtitle, theme }) {
    const isConnected = connectionState === 'connected';
    const dotColor = isConnected ? theme.connectedDotColor : theme.disconnectedDotColor;
    return ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.container, children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { style: [styles.dot, { backgroundColor: dotColor }] }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.text, children: subtitle })] }));
}
const styles = react_native_1.StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    text: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
    },
});
//# sourceMappingURL=StatusIndicator.js.map