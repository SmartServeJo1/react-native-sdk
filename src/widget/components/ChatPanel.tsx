import React from 'react';
import { View, StyleSheet, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { InputBar } from './InputBar';
import { PoweredByFooter } from './PoweredByFooter';
import type { ChatPanelProps } from '../types';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

/**
 * Expanded chat panel with header, message list, and input bar.
 * Mirrors iOS VoiceChatView expanded state.
 */
export function ChatPanel({
  theme,
  messages,
  connectionState,
  isStreaming,
  subtitle,
  onClose,
  onSendText,
  onMicToggle,
}: ChatPanelProps) {
  const panelWidth = Math.min(theme.panelMaxWidth, screenWidth - 32);
  const panelHeight = Math.min(theme.panelMaxHeight, screenHeight - 120);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoid}
    >
      <View
        style={[
          styles.panel,
          {
            width: panelWidth,
            height: panelHeight,
            backgroundColor: theme.backgroundColor,
            borderRadius: theme.borderRadius,
          },
        ]}
      >
        <ChatHeader
          theme={theme}
          connectionState={connectionState}
          subtitle={subtitle}
          onClose={onClose}
        />

        <MessageList
          messages={messages}
          theme={theme}
        />

        <PoweredByFooter />

        <InputBar
          theme={theme}
          isStreaming={isStreaming}
          isConnected={connectionState === 'connected'}
          onSendText={onSendText}
          onMicToggle={onMicToggle}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoid: {
    position: 'absolute',
    right: 16,
    bottom: 32,
    zIndex: 1001,
  },
  panel: {
    overflow: 'hidden',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
});
