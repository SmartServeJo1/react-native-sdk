/**
 * Decode PCM16 little-endian bytes into Float32 samples (-1.0 to 1.0).
 */
export function decodePCM16LEToFloat32(pcmBytes: ArrayBuffer): Float32Array {
  const view = new DataView(pcmBytes);
  const numSamples = pcmBytes.byteLength / 2;
  const float32 = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const int16 = view.getInt16(i * 2, true); // little-endian
    float32[i] = int16 / 32768;
  }

  return float32;
}

/**
 * Encode Float32 samples into PCM16 little-endian bytes.
 */
export function encodeFloat32ToPCM16LE(float32: Float32Array): ArrayBuffer {
  const buffer = new ArrayBuffer(float32.length * 2);
  const view = new DataView(buffer);

  for (let i = 0; i < float32.length; i++) {
    const clamped = Math.max(-1, Math.min(1, float32[i]));
    const int16 = clamped < 0 ? clamped * 32768 : clamped * 32767;
    view.setInt16(i * 2, int16, true); // little-endian
  }

  return buffer;
}

/**
 * Amplify PCM16 audio data by a given factor with clamping.
 * Matches iOS SDK's 3x volume amplification.
 */
export function amplifyPCM16(pcmData: ArrayBuffer, factor: number): ArrayBuffer {
  const view = new DataView(pcmData);
  const result = new ArrayBuffer(pcmData.byteLength);
  const resultView = new DataView(result);
  const numSamples = pcmData.byteLength / 2;

  for (let i = 0; i < numSamples; i++) {
    const sample = view.getInt16(i * 2, true);
    const amplified = Math.max(-32768, Math.min(32767, Math.round(sample * factor)));
    resultView.setInt16(i * 2, amplified, true);
  }

  return result;
}

/**
 * Convert a base64 string to an ArrayBuffer.
 */
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Convert an ArrayBuffer to a base64 string.
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
