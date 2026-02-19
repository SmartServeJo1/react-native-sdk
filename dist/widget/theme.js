"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_THEME = void 0;
exports.resolveTheme = resolveTheme;
exports.DEFAULT_THEME = {
    primaryColor: '#415FAC',
    primaryColorLight: '#6B8DE0',
    backgroundColor: '#FFFFFF',
    textColor: '#1F2937',
    userBubbleColor: '#415FAC',
    userBubbleTextColor: '#FFFFFF',
    assistantBubbleColor: '#F0F2F5',
    assistantBubbleTextColor: '#1F2937',
    systemMessageColor: '#94A3B8',
    headerGradientStart: '#3A54A0',
    headerGradientEnd: '#6B8DE0',
    micActiveColor: '#EF4444',
    connectedDotColor: '#22C55E',
    disconnectedDotColor: '#EF4444',
    fabSize: 56,
    panelMaxWidth: 360,
    panelMaxHeight: 520,
    borderRadius: 16,
    fontFamily: 'System',
};
/**
 * Merge user's partial theme with defaults.
 */
function resolveTheme(partial) {
    if (!partial)
        return exports.DEFAULT_THEME;
    return { ...exports.DEFAULT_THEME, ...partial };
}
//# sourceMappingURL=theme.js.map