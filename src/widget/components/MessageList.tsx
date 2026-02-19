import React, { useRef, useEffect } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { MessageBubble } from './MessageBubble';
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
export function MessageList({ messages, theme }: MessageListProps) {
  const listRef = useRef<FlatList>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        listRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  return (
    <FlatList
      ref={listRef}
      data={messages}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <MessageBubble message={item} theme={theme} />}
      style={styles.list}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  content: {
    paddingVertical: 12,
  },
});
