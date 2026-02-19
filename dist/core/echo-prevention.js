"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EchoPrevention = void 0;
const logger_1 = require("./utils/logger");
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
class EchoPrevention {
    constructor(capture, playback) {
        this.unmutePendingTimer = null;
        this.unsubscribers = [];
        this.captureManager = capture;
        this.playbackManager = playback;
        // Mute mic when playback starts
        this.unsubscribers.push(playback.on('started', () => this.onPlaybackStarted()));
        // Schedule unmute when playback goes idle
        this.unsubscribers.push(playback.on('idle', () => this.onPlaybackIdle()));
    }
    onPlaybackStarted() {
        // Cancel any pending unmute
        if (this.unmutePendingTimer) {
            clearTimeout(this.unmutePendingTimer);
            this.unmutePendingTimer = null;
        }
        // Mute mic immediately
        this.captureManager.mute();
        (0, logger_1.logDebug)('Echo prevention: mic muted (playback started)');
    }
    onPlaybackIdle() {
        // Cancel any existing timer
        if (this.unmutePendingTimer) {
            clearTimeout(this.unmutePendingTimer);
        }
        // Unmute after tail delay
        this.unmutePendingTimer = setTimeout(() => {
            this.captureManager.unmute();
            this.unmutePendingTimer = null;
            (0, logger_1.logDebug)('Echo prevention: mic unmuted (playback idle + tail delay)');
        }, EchoPrevention.TAIL_DELAY_MS);
    }
    /**
     * Force unmute (e.g., when clearing audio queue).
     */
    forceUnmute() {
        if (this.unmutePendingTimer) {
            clearTimeout(this.unmutePendingTimer);
            this.unmutePendingTimer = null;
        }
        this.captureManager.unmute();
    }
    destroy() {
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
exports.EchoPrevention = EchoPrevention;
/** Delay after playback ends before unmuting (matches iOS 0.5s) */
EchoPrevention.TAIL_DELAY_MS = 500;
//# sourceMappingURL=echo-prevention.js.map