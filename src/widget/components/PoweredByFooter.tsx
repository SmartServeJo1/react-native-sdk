import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function PoweredByFooter() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Powered by smartserve.ai</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 6,
    alignItems: 'center',
  },
  text: {
    fontSize: 10,
    color: 'rgba(0,0,0,0.3)',
  },
});
