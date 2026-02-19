import React from 'react';
import { View, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import { useVoiceChat } from '../hooks/use-voice-chat';
import { resolveTheme } from '../theme';
import { FloatingButton } from './FloatingButton';
import { ChatPanel } from './ChatPanel';
import type { VoiceChatWidgetProps } from '../types';

/**
 * Drop-in voice chat widget with floating action button.
 * Renders a FAB that expands into a full chat panel.
 *
 * Mirrors iOS VoiceChatView.swift
 *
 * Usage:
 *   <VoiceChatWidget
 *     config={{ serverUrl: '...', tenantId: '...' }}
 *     theme={{ primaryColor: '#6366F1' }}
 *     onLlmResponseRequired={async ({ question }) => await myLLM(question)}
 *   />
 */
export function VoiceChatWidget({
  config,
  theme: themeOverrides,
  position = 'bottom-right',
  onConnectionStateChanged,
  onError,
  onLlmResponseRequired,
}: VoiceChatWidgetProps) {
  const theme = resolveTheme(themeOverrides);

  const voiceChat = useVoiceChat(config, {
    onConnectionStateChanged,
    onError,
    onLlmResponseRequired,
  });

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Dim overlay when expanded */}
      {voiceChat.isExpanded && (
        <TouchableWithoutFeedback onPress={voiceChat.toggleExpanded}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
      )}

      {/* Chat panel */}
      {voiceChat.isExpanded && (
        <ChatPanel
          theme={theme}
          messages={voiceChat.messages}
          connectionState={voiceChat.connectionState}
          isStreaming={voiceChat.isStreaming}
          subtitle={voiceChat.subtitle}
          onClose={voiceChat.toggleExpanded}
          onSendText={voiceChat.sendTextMessage}
          onMicToggle={voiceChat.toggleMic}
        />
      )}

      {/* FAB */}
      <FloatingButton
        theme={theme}
        isExpanded={voiceChat.isExpanded}
        onPress={voiceChat.toggleExpanded}
        position={position}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
});
