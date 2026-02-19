import type { ChatMessage } from '../types';
import type { VoiceChatTheme } from '../theme';
interface MessageListProps {
    messages: ChatMessage[];
    theme: VoiceChatTheme;
}
/**
 * Scrollable message list with auto-scroll to bottom.
 * Mirrors iOS VoiceChatView message list.
 */
export declare function MessageList({ messages, theme }: MessageListProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=MessageList.d.ts.map