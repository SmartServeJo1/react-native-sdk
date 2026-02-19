import type { AudioCaptureManager } from './audio-capture-manager';
import type { AudioPlaybackManager } from './audio-playback-manager';
import { logDebug } from './utils/logger';

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
export class EchoPrevention {
  /** Delay after playback ends before unmuting (matches iOS 0.5s) */
  private static readonly TAIL_DELAY_MS = 500;

  private captureManager: AudioCaptureManager;
  private playbackManager: AudioPlaybackManager;
  private unmutePendingTimer: ReturnType<typeof setTimeout> | null = null;
  private unsubscribers: (() => void)[] = [];

  constructor(capture: AudioCaptureManager, playback: AudioPlaybackManager) {
    this.captureManager = capture;
    this.playbackManager = playback;

    // Mute mic when playback starts
    this.unsubscribers.push(
      playback.on('started', () => this.onPlaybackStarted()),
    );

    // Schedule unmute when playback goes idle
    this.unsubscribers.push(
      playback.on('idle', () => this.onPlaybackIdle()),
    );
  }

  private onPlaybackStarted(): void {
    // Cancel any pending unmute
    if (this.unmutePendingTimer) {
      clearTimeout(this.unmutePendingTimer);
      this.unmutePendingTimer = null;
    }

    // Mute mic immediately
    this.captureManager.mute();
    logDebug('Echo prevention: mic muted (playback started)');
  }

  private onPlaybackIdle(): void {
    // Cancel any existing timer
    if (this.unmutePendingTimer) {
      clearTimeout(this.unmutePendingTimer);
    }

    // Unmute after tail delay
    this.unmutePendingTimer = setTimeout(() => {
      this.captureManager.unmute();
      this.unmutePendingTimer = null;
      logDebug('Echo prevention: mic unmuted (playback idle + tail delay)');
    }, EchoPrevention.TAIL_DELAY_MS);
  }

  /**
   * Force unmute (e.g., when clearing audio queue).
   */
  forceUnmute(): void {
    if (this.unmutePendingTimer) {
      clearTimeout(this.unmutePendingTimer);
      this.unmutePendingTimer = null;
    }
    this.captureManager.unmute();
  }

  destroy(): void {
    if (this.unmutePendingTimer) {
      clearTimeout(this.unmutePendingTimer);
      this.unmutePendingTimer = null;
    }
    for (const unsub of this.unsubscribers) {
      unsub();
    }
    this.unsubscribers = [];
  }
}
