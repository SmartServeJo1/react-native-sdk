import type { AudioCaptureManager } from './audio-capture-manager';
import type { AudioPlaybackManager } from './audio-playback-manager';
/**
 * Echo prevention controller.
 * Mutes the microphone while audio is being played back,
 * then unmutes after all buffers are drained + a tail delay.
 *
 * This prevents the microphone from picking up the speaker's output,
 * which would cause echo/feedback in the conversation.
 *
 * Mirrors iOS SDK echo prevention logic.
 */
export declare class EchoPrevention {
    /** Delay after playback ends before unmuting (matches iOS 0.5s) */
    private static readonly TAIL_DELAY_MS;
    private captureManager;
    private playbackManager;
    private unmutePendingTimer;
    private unsubscribers;
    constructor(capture: AudioCaptureManager, playback: AudioPlaybackManager);
    private onPlaybackStarted;
    private onPlaybackIdle;
    /**
     * Force unmute (e.g., when clearing audio queue).
     */
    forceUnmute(): void;
    destroy(): void;
}
//# sourceMappingURL=echo-prevention.d.ts.map