/**
 * Decode PCM16 little-endian bytes into Float32 samples (-1.0 to 1.0).
 */
export declare function decodePCM16LEToFloat32(pcmBytes: ArrayBuffer): Float32Array;
/**
 * Encode Float32 samples into PCM16 little-endian bytes.
 */
export declare function encodeFloat32ToPCM16LE(float32: Float32Array): ArrayBuffer;
/**
 * Amplify PCM16 audio data by a given factor with clamping.
 * Matches iOS SDK's 3x volume amplification.
 */
export declare function amplifyPCM16(pcmData: ArrayBuffer, factor: number): ArrayBuffer;
/**
 * Convert a base64 string to an ArrayBuffer.
 */
export declare function base64ToArrayBuffer(base64: string): ArrayBuffer;
/**
 * Convert an ArrayBuffer to a base64 string.
 */
export declare function arrayBufferToBase64(buffer: ArrayBuffer): string;
//# sourceMappingURL=audio-format.d.ts.map