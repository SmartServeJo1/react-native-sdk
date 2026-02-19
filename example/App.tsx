import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  StatusBar,
} from 'react-native';

// In a real app, import from '@smartserve/react-native-voice-sdk'
import { VoiceChatWidget } from '../src';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* App content */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.logo}>MediCare</Text>
          <Text style={styles.subtitle}>AI-Powered Clinic</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Welcome back!</Text>
          <Text style={styles.cardText}>
            Tap the voice button to speak with our AI assistant.
            Ask about appointments, hours, or any other questions.
          </Text>
        </View>

        <View style={styles.grid}>
          {[
            { icon: '📅', label: 'Book Appointment' },
            { icon: '👨‍⚕️', label: 'Find Doctor' },
            { icon: '🔬', label: 'Lab Results' },
            { icon: '💊', label: 'Prescriptions' },
          ].map((item) => (
            <View key={item.label} style={styles.gridItem}>
              <Text style={styles.gridIcon}>{item.icon}</Text>
              <Text style={styles.gridLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Voice Chat Widget */}
      <VoiceChatWidget
        config={{
          serverUrl: 'wss://streaming-poc.smartserve.ai/ws',
          tenantId: 'clinic',
          tenantName: 'MediCare Clinic',
          aiClinicMode: true,
        }}
        theme={{
          primaryColor: '#1E3A5F',
          headerGradientStart: '#1E3A5F',
          headerGradientEnd: '#4A90C4',
        }}
        onLlmResponseRequired={async ({ question }) => {
          // Demo: simulate LLM response
          console.log('[Demo] LLM question:', question);
          await new Promise((r) => setTimeout(r, 800));
          return `This is a demo response for: "${question}". In production, your LLM provides the real answer.`;
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginTop: 20,
    marginBottom: 32,
  },
  logo: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E3A5F',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#64748B',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  gridIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  gridLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#334155',
  },
});
