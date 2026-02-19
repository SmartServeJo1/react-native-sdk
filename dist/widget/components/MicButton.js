"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MicButton = MicButton;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_native_1 = require("react-native");
/**
 * Microphone button with red pulse animation when streaming.
 * Mirrors iOS mic button with ripple animation.
 */
function MicButton({ theme, isStreaming, isConnected, onPress }) {
    const pulseAnim = (0, react_1.useRef)(new react_native_1.Animated.Value(1)).current;
    const opacityAnim = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    (0, react_1.useEffect)(() => {
        if (isStreaming) {
            react_native_1.Animated.loop(react_native_1.Animated.sequence([
                react_native_1.Animated.parallel([
                    react_native_1.Animated.timing(pulseAnim, {
                        toValue: 1.4,
                        duration: 750,
                        useNativeDriver: true,
                    }),
                    react_native_1.Animated.timing(opacityAnim, {
                        toValue: 0,
                        duration: 750,
                        useNativeDriver: true,
                    }),
                ]),
                react_native_1.Animated.parallel([
                    react_native_1.Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 0,
                        useNativeDriver: true,
                    }),
                    react_native_1.Animated.timing(opacityAnim, {
                        toValue: 0.3,
                        duration: 0,
                        useNativeDriver: true,
                    }),
                ]),
            ])).start();
        }
        else {
            pulseAnim.setValue(1);
            opacityAnim.setValue(0);
        }
    }, [isStreaming, pulseAnim, opacityAnim]);
    const bgColor = isStreaming ? theme.micActiveColor : theme.primaryColor;
    return ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.wrapper, children: [isStreaming && ((0, jsx_runtime_1.jsx)(react_native_1.Animated.View, { style: [
                    styles.pulseRing,
                    {
                        backgroundColor: theme.micActiveColor,
                        opacity: opacityAnim,
                        transform: [{ scale: pulseAnim }],
                    },
                ] })), (0, jsx_runtime_1.jsx)(react_native_1.TouchableOpacity, { onPress: onPress, disabled: !isConnected, activeOpacity: 0.7, style: [
                    styles.button,
                    { backgroundColor: bgColor },
                    !isConnected && styles.disabled,
                ], children: (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.iconContainer, children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { style: [styles.micBody, { backgroundColor: '#fff' }] }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: [styles.micBase, { borderColor: '#fff' }] })] }) })] }));
}
const styles = react_native_1.StyleSheet.create({
    wrapper: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pulseRing: {
        position: 'absolute',
        width: 44,
        height: 44,
        borderRadius: 22,
    },
    button: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    disabled: {
        opacity: 0.5,
    },
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 16,
        height: 20,
    },
    micBody: {
        width: 8,
        height: 12,
        borderRadius: 4,
    },
    micBase: {
        width: 14,
        height: 7,
        borderWidth: 2,
        borderTopWidth: 0,
        borderBottomLeftRadius: 7,
        borderBottomRightRadius: 7,
        marginTop: -2,
        backgroundColor: 'transparent',
    },
});
//# sourceMappingURL=MicButton.js.map