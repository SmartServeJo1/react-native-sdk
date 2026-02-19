import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import type { FloatingButtonProps } from '../types';

/**
 * Floating Action Button that opens/closes the chat panel.
 * Mirrors iOS VoiceChatView FAB.
 */
export function FloatingButton({ theme, isExpanded, onPress, position }: FloatingButtonProps) {
  if (isExpanded) return null;

  const positionStyle = position === 'bottom-left'
    ? { left: 16, bottom: 32 }
    : { right: 16, bottom: 32 };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.fab,
        positionStyle,
        {
          width: theme.fabSize,
          height: theme.fabSize,
          borderRadius: theme.fabSize / 2,
          backgroundColor: theme.primaryColor,
        },
      ]}
    >
      {/* Headphones icon */}
      <View style={styles.iconContainer}>
        <View style={[styles.headphoneArc, { borderColor: '#fff' }]} />
        <View style={styles.earPieceRow}>
          <View style={[styles.earPiece, { backgroundColor: '#fff' }]} />
          <View style={[styles.earPiece, { backgroundColor: '#fff' }]} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 1000,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
  },
  headphoneArc: {
    width: 18,
    height: 10,
    borderWidth: 2.5,
    borderBottomWidth: 0,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    backgroundColor: 'transparent',
  },
  earPieceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 20,
    marginTop: -1,
  },
  earPiece: {
    width: 5,
    height: 8,
    borderRadius: 2,
  },
});
