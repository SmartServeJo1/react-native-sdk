"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageList = MessageList;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_native_1 = require("react-native");
const MessageBubble_1 = require("./MessageBubble");
/**
 * Scrollable message list with auto-scroll to bottom.
 * Mirrors iOS VoiceChatView message list.
 */
function MessageList({ messages, theme }) {
    const listRef = (0, react_1.useRef)(null);
    // Auto-scroll to bottom when new messages arrive
    (0, react_1.useEffect)(() => {
        if (messages.length > 0) {
            setTimeout(() => {
                listRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages.length]);
    return ((0, jsx_runtime_1.jsx)(react_native_1.FlatList, { ref: listRef, data: messages, keyExtractor: (item) => item.id, renderItem: ({ item }) => (0, jsx_runtime_1.jsx)(MessageBubble_1.MessageBubble, { message: item, theme: theme }), style: styles.list, contentContainerStyle: styles.content, showsVerticalScrollIndicator: false, keyboardShouldPersistTaps: "handled" }));
}
const styles = react_native_1.StyleSheet.create({
    list: {
        flex: 1,
    },
    content: {
        paddingVertical: 12,
    },
});
//# sourceMappingURL=MessageList.js.map