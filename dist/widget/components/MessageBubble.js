"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageBubble = MessageBubble;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_native_1 = require("react-native");
/**
 * Renders a single chat message bubble.
 * Supports user, assistant, system, and thinking types.
 * Mirrors iOS VoiceChatView bubble styles.
 */
function MessageBubble({ message, theme }) {
    if (message.type === 'thinking') {
        return (0, jsx_runtime_1.jsx)(ThinkingIndicator, { theme: theme });
    }
    if (message.type === 'system') {
        return ((0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.systemContainer, children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: [styles.systemText, { color: theme.systemMessageColor }], children: message.text }) }));
    }
    const isUser = message.type === 'user';
    const isRTL = message.language === 'ar';
    return ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: [
            styles.bubbleRow,
            isUser ? styles.userRow : styles.assistantRow,
        ], children: [!isUser && ((0, jsx_runtime_1.jsx)(react_native_1.View, { style: [styles.avatar, { backgroundColor: theme.primaryColor }], children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.avatarText, children: "AI" }) })), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: [
                    styles.bubble,
                    isUser
                        ? [
                            styles.userBubble,
                            { backgroundColor: theme.userBubbleColor },
                        ]
                        : [
                            styles.assistantBubble,
                            { backgroundColor: theme.assistantBubbleColor },
                        ],
                ], children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: [
                        styles.bubbleText,
                        {
                            color: isUser
                                ? theme.userBubbleTextColor
                                : theme.assistantBubbleTextColor,
                            textAlign: isRTL ? 'right' : 'left',
                            writingDirection: isRTL ? 'rtl' : 'ltr',
                        },
                    ], children: message.text }) })] }));
}
/**
 * Animated three-dot thinking indicator.
 */
function ThinkingIndicator({ theme }) {
    const dot1 = (0, react_1.useRef)(new react_native_1.Animated.Value(0.3)).current;
    const dot2 = (0, react_1.useRef)(new react_native_1.Animated.Value(0.3)).current;
    const dot3 = (0, react_1.useRef)(new react_native_1.Animated.Value(0.3)).current;
    (0, react_1.useEffect)(() => {
        const animate = (dot, delay) => react_native_1.Animated.loop(react_native_1.Animated.sequence([
            react_native_1.Animated.delay(delay),
            react_native_1.Animated.timing(dot, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            react_native_1.Animated.timing(dot, {
                toValue: 0.3,
                duration: 300,
                useNativeDriver: true,
            }),
        ]));
        animate(dot1, 0).start();
        animate(dot2, 150).start();
        animate(dot3, 300).start();
        return () => {
            dot1.stopAnimation();
            dot2.stopAnimation();
            dot3.stopAnimation();
        };
    }, [dot1, dot2, dot3]);
    return ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.assistantRow, children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { style: [styles.avatar, { backgroundColor: theme.primaryColor }], children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.avatarText, children: "AI" }) }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: [styles.bubble, styles.assistantBubble, { backgroundColor: theme.assistantBubbleColor }], children: (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.dotsRow, children: [dot1, dot2, dot3].map((dot, i) => ((0, jsx_runtime_1.jsx)(react_native_1.Animated.View, { style: [
                            styles.thinkingDot,
                            { backgroundColor: theme.systemMessageColor, opacity: dot },
                        ] }, i))) }) })] }));
}
const styles = react_native_1.StyleSheet.create({
    bubbleRow: {
        flexDirection: 'row',
        marginBottom: 8,
        paddingHorizontal: 12,
        alignItems: 'flex-end',
    },
    userRow: {
        justifyContent: 'flex-end',
    },
    assistantRow: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginBottom: 8,
        paddingHorizontal: 12,
        alignItems: 'flex-end',
    },
    avatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 6,
    },
    avatarText: {
        color: '#fff',
        fontSize: 9,
        fontWeight: '700',
    },
    bubble: {
        maxWidth: '75%',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
    },
    userBubble: {
        borderBottomRightRadius: 4,
    },
    assistantBubble: {
        borderBottomLeftRadius: 4,
    },
    bubbleText: {
        fontSize: 14,
        lineHeight: 20,
    },
    systemContainer: {
        alignItems: 'center',
        marginVertical: 4,
        paddingHorizontal: 16,
    },
    systemText: {
        fontSize: 12,
        textAlign: 'center',
        backgroundColor: 'rgba(0,0,0,0.04)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 10,
        overflow: 'hidden',
    },
    dotsRow: {
        flexDirection: 'row',
        gap: 4,
        paddingVertical: 4,
        paddingHorizontal: 4,
    },
    thinkingDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
});
//# sourceMappingURL=MessageBubble.js.map