import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { StatusIndicator } from './StatusIndicator';
import type { ChatHeaderProps } from '../types';

/**
 * Chat panel header with gradient background, title, status, and close button.
 * Mirrors iOS VoiceChatView header.
 *
 * Note: Uses solid background by default. If react-native-linear-gradient
 * is available, consumers can wrap this or pass gradient colors.
 */
export function ChatHeader({ theme, connectionState, subtitle, onClose }: ChatHeaderProps) {
  return (
    <View style={[styles.container, { backgroundColor: theme.headerGradientStart }]}>
      {/* Avatar */}
      <View style={[styles.avatar, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
        <View style={styles.avatarIconContainer}>
          <View style={[styles.headphoneArc, { borderColor: '#fff' }]} />
          <View style={styles.earPieceRow}>
            <View style={[styles.earPiece, { backgroundColor: '#fff' }]} />
            <View style={[styles.earPiece, { backgroundColor: '#fff' }]} />
          </View>
        </View>
      </View>

      {/* Title + Status */}
      <View style={styles.info}>
        <Text style={styles.title}>AI Assistant</Text>
        <StatusIndicator
          connectionState={connectionState}
          subtitle={subtitle}
          theme={theme}
        />
      </View>

      {/* Close button */}
      <TouchableOpacity onPress={onClose} style={styles.closeButton} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <View style={styles.closeIcon}>
          <View style={[styles.closeLine, styles.closeLineA]} />
          <View style={[styles.closeLine, styles.closeLineB]} />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarIconContainer: {
    alignItems: 'center',
    width: 18,
    height: 18,
  },
  headphoneArc: {
    width: 14,
    height: 8,
    borderWidth: 2,
    borderBottomWidth: 0,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    backgroundColor: 'transparent',
  },
  earPieceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 16,
    marginTop: -1,
  },
  earPiece: {
    width: 4,
    height: 6,
    borderRadius: 1.5,
  },
  info: {
    flex: 1,
  },
  title: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  closeButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  closeIcon: {
    width: 12,
    height: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeLine: {
    position: 'absolute',
    width: 12,
    height: 2,
    backgroundColor: '#fff',
    borderRadius: 1,
  },
  closeLineA: {
    transform: [{ rotate: '45deg' }],
  },
  closeLineB: {
    transform: [{ rotate: '-45deg' }],
  },
});
