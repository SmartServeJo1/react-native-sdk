import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import type { MessageBubbleProps } from '../types';

/**
 * Renders a single chat message bubble.
 * Supports user, assistant, system, and thinking types.
 * Mirrors iOS VoiceChatView bubble styles.
 */
export function MessageBubble({ message, theme }: MessageBubbleProps) {
  if (message.type === 'thinking') {
    return <ThinkingIndicator theme={theme} />;
  }

  if (message.type === 'system') {
    return (
      <View style={styles.systemContainer}>
        <Text style={[styles.systemText, { color: theme.systemMessageColor }]}>
          {message.text}
        </Text>
      </View>
    );
  }

  const isUser = message.type === 'user';
  const isRTL = message.language === 'ar';

  return (
    <View
      style={[
        styles.bubbleRow,
        isUser ? styles.userRow : styles.assistantRow,
      ]}
    >
      {/* AI avatar badge for assistant */}
      {!isUser && (
        <View style={[styles.avatar, { backgroundColor: theme.primaryColor }]}>
          <Text style={styles.avatarText}>AI</Text>
        </View>
      )}

      <View
        style={[
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
        ]}
      >
        <Text
          style={[
            styles.bubbleText,
            {
              color: isUser
                ? theme.userBubbleTextColor
                : theme.assistantBubbleTextColor,
              textAlign: isRTL ? 'right' : 'left',
              writingDirection: isRTL ? 'rtl' : 'ltr',
            },
          ]}
        >
          {message.text}
        </Text>
      </View>
    </View>
  );
}

/**
 * Animated three-dot thinking indicator.
 */
function ThinkingIndicator({ theme }: { theme: MessageBubbleProps['theme'] }) {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animate = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0.3,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      );

    animate(dot1, 0).start();
    animate(dot2, 150).start();
    animate(dot3, 300).start();

    return () => {
      dot1.stopAnimation();
      dot2.stopAnimation();
      dot3.stopAnimation();
    };
  }, [dot1, dot2, dot3]);

  return (
    <View style={styles.assistantRow}>
      <View style={[styles.avatar, { backgroundColor: theme.primaryColor }]}>
        <Text style={styles.avatarText}>AI</Text>
      </View>
      <View style={[styles.bubble, styles.assistantBubble, { backgroundColor: theme.assistantBubbleColor }]}>
        <View style={styles.dotsRow}>
          {[dot1, dot2, dot3].map((dot, i) => (
            <Animated.View
              key={i}
              style={[
                styles.thinkingDot,
                { backgroundColor: theme.systemMessageColor, opacity: dot },
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
