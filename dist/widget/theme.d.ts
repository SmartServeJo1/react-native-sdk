export interface VoiceChatTheme {
    /** Primary brand color */
    primaryColor: string;
    /** Lighter shade of primary */
    primaryColorLight: string;
    /** Panel background color */
    backgroundColor: string;
    /** Primary text color */
    textColor: string;
    /** User bubble background */
    userBubbleColor: string;
    /** User bubble text color */
    userBubbleTextColor: string;
    /** Assistant bubble background */
    assistantBubbleColor: string;
    /** Assistant bubble text color */
    assistantBubbleTextColor: string;
    /** System message text color */
    systemMessageColor: string;
    /** Header gradient start */
    headerGradientStart: string;
    /** Header gradient end */
    headerGradientEnd: string;
    /** Active mic button color */
    micActiveColor: string;
    /** Connected status dot color */
    connectedDotColor: string;
    /** Disconnected status dot color */
    disconnectedDotColor: string;
    /** FAB diameter */
    fabSize: number;
    /** Chat panel max width */
    panelMaxWidth: number;
    /** Chat panel max height */
    panelMaxHeight: number;
    /** Panel border radius */
    borderRadius: number;
    /** Font family (System default) */
    fontFamily: string;
}
export declare const DEFAULT_THEME: VoiceChatTheme;
/**
 * Merge user's partial theme with defaults.
 */
export declare function resolveTheme(partial?: Partial<VoiceChatTheme>): VoiceChatTheme;
//# sourceMappingURL=theme.d.ts.map