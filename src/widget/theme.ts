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

export const DEFAULT_THEME: VoiceChatTheme = {
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
export function resolveTheme(partial?: Partial<VoiceChatTheme>): VoiceChatTheme {
  if (!partial) return DEFAULT_THEME;
  return { ...DEFAULT_THEME, ...partial };
}
