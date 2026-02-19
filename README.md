# VoiceStreamSDK for React Native

Real-time voice AI SDK for React Native. Add a fully working voice assistant to your app in under 5 minutes.

## Step 1: Install the SDK

```bash
npm install @smartserve/react-native-voice-sdk
```

Install required native dependencies:

```bash
npm install react-native-live-audio-stream react-native-audio-api
```

For the widget UI (optional):

```bash
npm install react-native-reanimated react-native-svg react-native-linear-gradient react-native-permissions
```

For iOS, install pods:

```bash
cd ios && pod install
```

## Step 2: Add Microphone Permission

### iOS

Add to your `Info.plist`:

```xml
<key>NSMicrophoneUsageDescription</key>
<string>Microphone access is needed for voice conversation</string>
```

### Android

Add to `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
```

## Step 3: Add the Widget

Drop a single component into any screen:

```tsx
import React from 'react';
import { View, Text } from 'react-native';
import { VoiceChatWidget } from '@smartserve/react-native-voice-sdk';

export default function App() {
  return (
    <View style={{ flex: 1 }}>
      {/* Your existing app content */}
      <Text>My App</Text>

      {/* Voice assistant widget */}
      <VoiceChatWidget
        config={{
          serverUrl: 'wss://your-server.com/ws',
          tenantId: 'your-tenant',
        }}
      />
    </View>
  );
}
```

That's it. A floating button appears in the bottom-right corner. Tap it to open the voice chat.

---

## LLM Delegation

If your voice AI delegates questions to your own LLM:

```tsx
<VoiceChatWidget
  config={{
    serverUrl: 'wss://your-server.com/ws',
    tenantId: 'clinic',
    aiClinicMode: true,
  }}
  onLlmResponseRequired={async ({ question }) => {
    // Your LLM processes the question
    const answer = await myLLMService.ask(question);
    return answer;
  }}
/>
```

**How it works:**
1. User asks "What are your clinic hours?"
2. Voice AI says "One moment please..."
3. Your callback receives the question
4. You call your LLM and return the answer
5. Voice AI speaks the answer naturally

---

## Direct SDK (No Widget)

For apps that build their own UI:

```typescript
import { VoiceStreamSDK } from '@smartserve/react-native-voice-sdk';

const sdk = new VoiceStreamSDK({
  serverUrl: 'wss://your-server.com/ws',
  tenantId: 'your-tenant',
  tenantName: 'Your App',
});

sdk.on('connected', () => {
  sdk.startAudioStreaming();
});

sdk.on('transcript', (data) => {
  console.log('User:', data.text);
});

sdk.on('assistantMessage', (data) => {
  console.log('AI:', data.text);
});

sdk.on('error', (error) => {
  console.error('Error:', error.message);
});

sdk.connect();
```

---

## Full Control (Listener)

For connection state, error handling, and LLM delegation:

```tsx
<VoiceChatWidget
  config={{
    serverUrl: 'wss://your-server.com/ws',
    tenantId: 'clinic',
    tenantName: 'My Clinic',
  }}
  onConnectionStateChanged={(state) => {
    console.log('State:', state);
  }}
  onError={(error) => {
    console.error('Error:', error);
  }}
  onLlmResponseRequired={async ({ question }) => {
    const answer = await myLLM(question);
    return answer;
  }}
/>
```

---

## Theming

Customize colors and sizes to match your app:

```tsx
<VoiceChatWidget
  config={{
    serverUrl: 'wss://your-server.com/ws',
    tenantId: 'clinic',
  }}
  theme={{
    primaryColor: '#1E3A5F',
    userBubbleColor: '#1E3A5F',
    assistantBubbleColor: '#F0F2F5',
    fabSize: 56,
  }}
/>
```

---

## Hook API

Use the `useVoiceChat` hook to build a completely custom UI:

```tsx
import { useVoiceChat } from '@smartserve/react-native-voice-sdk';

function MyCustomVoiceUI() {
  const {
    messages,
    isStreaming,
    isConnected,
    connectionState,
    subtitle,
    toggleExpanded,
    toggleMic,
    sendTextMessage,
  } = useVoiceChat({
    serverUrl: 'wss://your-server.com/ws',
    tenantId: 'your-tenant',
  });

  return (
    // Your custom UI using the state and actions above
  );
}
```

---

## Configuration

| Parameter | Default | Description |
|-----------|---------|-------------|
| `serverUrl` | required | WebSocket server URL |
| `tenantId` | required | Tenant identifier |
| `tenantName` | tenantId | Display name |
| `authToken` | undefined | Bearer token for auth |
| `autoReconnect` | true | Reconnect on disconnect |
| `maxReconnectAttempts` | 5 | Max retries (0 = unlimited) |
| `reconnectDelayMs` | 1000 | Initial reconnect delay |
| `maxReconnectDelayMs` | 30000 | Max reconnect delay |
| `pingIntervalMs` | 30000 | Keep-alive ping interval |
| `audioInputSampleRate` | 16000 | Mic sample rate (Hz) |
| `audioOutputSampleRate` | 24000 | Speaker sample rate (Hz) |
| `enableDebugLogging` | false | Print debug logs |
| `aiClinicMode` | false | Enable LLM delegation mode |

## Requirements

- React Native >= 0.72.0
- React >= 18.0.0
- iOS 14.0+
- Android API 21+

## License

MIT
