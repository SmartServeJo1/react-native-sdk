import type { ConnectionState } from '../../core/types';
import type { VoiceChatTheme } from '../theme';
interface StatusIndicatorProps {
    connectionState: ConnectionState;
    subtitle: string;
    theme: VoiceChatTheme;
}
export declare function StatusIndicator({ connectionState, subtitle, theme }: StatusIndicatorProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=StatusIndicator.d.ts.map