"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setDebugLogging = setDebugLogging;
exports.logDebug = logDebug;
exports.logWarn = logWarn;
exports.logError = logError;
const TAG = '[VoiceStreamSDK]';
let debugEnabled = false;
function setDebugLogging(enabled) {
    debugEnabled = enabled;
}
function logDebug(...args) {
    if (debugEnabled) {
        console.log(TAG, ...args);
    }
}
function logWarn(...args) {
    console.warn(TAG, ...args);
}
function logError(...args) {
    console.error(TAG, ...args);
}
//# sourceMappingURL=logger.js.map