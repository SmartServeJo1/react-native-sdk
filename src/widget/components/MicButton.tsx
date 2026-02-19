import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import type { MicButtonProps } from '../types';

/**
 * Microphone button with red pulse animation when streaming.
 * Mirrors iOS mic button with ripple animation.
 */
export function MicButton({ theme, isStreaming, isConnected, onPress }: MicButtonProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isStreaming) {
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(pulseAnim, {
              toValue: 1.4,
              duration: 750,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 0,
              duration: 750,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 0,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 0.3,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ).start();
    } else {
      pulseAnim.setValue(1);
      opacityAnim.setValue(0);
    }
  }, [isStreaming, pulseAnim, opacityAnim]);

  const bgColor = isStreaming ? theme.micActiveColor : theme.primaryColor;

  return (
    <View style={styles.wrapper}>
      {/* Pulse ring */}
      {isStreaming && (
        <Animated.View
          style={[
            styles.pulseRing,
            {
              backgroundColor: theme.micActiveColor,
              opacity: opacityAnim,
              transform: [{ scale: pulseAnim }],
            },
          ]}
        />
      )}

      <TouchableOpacity
        onPress={onPress}
        disabled={!isConnected}
        activeOpacity={0.7}
        style={[
          styles.button,
          { backgroundColor: bgColor },
          !isConnected && styles.disabled,
        ]}
      >
        {/* Mic SVG icon */}
        <View style={styles.iconContainer}>
          <View style={[styles.micBody, { backgroundColor: '#fff' }]} />
          <View style={[styles.micBase, { borderColor: '#fff' }]} />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  disabled: {
    opacity: 0.5,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 16,
    height: 20,
  },
  micBody: {
    width: 8,
    height: 12,
    borderRadius: 4,
  },
  micBase: {
    width: 14,
    height: 7,
    borderWidth: 2,
    borderTopWidth: 0,
    borderBottomLeftRadius: 7,
    borderBottomRightRadius: 7,
    marginTop: -2,
    backgroundColor: 'transparent',
  },
});
