import type { VoiceChatWidgetProps } from '../types';
/**
 * Drop-in voice chat widget with floating action button.
 * Renders a FAB that expands into a full chat panel.
 *
 * Mirrors iOS VoiceChatView.swift
 *
 * Usage:
 *   <VoiceChatWidget
 *     config={{ serverUrl: '...', tenantId: '...' }}
 *     theme={{ primaryColor: '#6366F1' }}
 *     onLlmResponseRequired={async ({ question }) => await myLLM(question)}
 *   />
 */
export declare function VoiceChatWidget({ config, theme: themeOverrides, position, onConnectionStateChanged, onError, onLlmResponseRequired, }: VoiceChatWidgetProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=VoiceChatWidget.d.ts.map