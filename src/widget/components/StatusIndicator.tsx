import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { ConnectionState } from '../../core/types';
import type { VoiceChatTheme } from '../theme';

interface StatusIndicatorProps {
  connectionState: ConnectionState;
  subtitle: string;
  theme: VoiceChatTheme;
}

export function StatusIndicator({ connectionState, subtitle, theme }: StatusIndicatorProps) {
  const isConnected = connectionState === 'connected';
  const dotColor = isConnected ? theme.connectedDotColor : theme.disconnectedDotColor;

  return (
    <View style={styles.container}>
      <View style={[styles.dot, { backgroundColor: dotColor }]} />
      <Text style={styles.text}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
