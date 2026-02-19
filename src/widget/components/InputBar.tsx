import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { MicButton } from './MicButton';
import type { InputBarProps } from '../types';

/**
 * Input bar with text field, send button, and mic toggle.
 * Mirrors iOS VoiceChatView input bar.
 */
export function InputBar({ theme, isStreaming, isConnected, onSendText, onMicToggle }: InputBarProps) {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (!text.trim()) return;
    onSendText(text.trim());
    setText('');
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.input, { color: theme.textColor }]}
        value={text}
        onChangeText={setText}
        placeholder="Type a message..."
        placeholderTextColor="#9CA3AF"
        returnKeyType="send"
        onSubmitEditing={handleSend}
        editable={isConnected}
      />

      {/* Send button (visible when text entered) */}
      {text.trim().length > 0 ? (
        <TouchableOpacity
          onPress={handleSend}
          style={[styles.sendButton, { backgroundColor: theme.primaryColor }]}
          activeOpacity={0.7}
        >
          {/* Arrow up icon */}
          <View style={styles.arrowUp}>
            <View style={[styles.arrowLine, { backgroundColor: '#fff' }]} />
            <View style={[styles.arrowHead, { borderBottomColor: '#fff' }]} />
          </View>
        </TouchableOpacity>
      ) : (
        <MicButton
          theme={theme}
          isStreaming={isStreaming}
          isConnected={isConnected}
          onPress={onMicToggle}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    gap: 8,
  },
  input: {
    flex: 1,
    height: 36,
    fontSize: 14,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowUp: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 14,
    height: 14,
  },
  arrowLine: {
    width: 2,
    height: 10,
    borderRadius: 1,
  },
  arrowHead: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -6,
  },
});
