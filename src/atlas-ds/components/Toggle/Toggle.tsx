import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { colors, typography } from '../../theme';

export type ToggleSize = 'sm' | 'md';

// Figma sizes (node 72:26576): Small 36×20 track / 16 thumb, Medium 44×24 / 20.
// Text: Small 14/20, Medium 16/24 (label #1E293B, subtext #475569). The gap
// between the switch and the text block is 8 (sm) / 12 (md).
const SIZE: Record<
  ToggleSize,
  { trackW: number; trackH: number; thumb: number; rowGap: number; textGap: number; label: number; labelLh: number; sub: number; subLh: number }
> = {
  sm: { trackW: 36, trackH: 20, thumb: 16, rowGap: 8, textGap: 0, label: 14, labelLh: 20, sub: 14, subLh: 20 },
  md: { trackW: 44, trackH: 24, thumb: 20, rowGap: 12, textGap: 2, label: 16, labelLh: 24, sub: 16, subLh: 24 },
};

// Shadow/sm — white thumb elevation (Figma). Native uses shadow*, web boxShadow.
const THUMB_SHADOW = Platform.select({
  web: { boxShadow: '0px 1px 2px 0px rgba(10,13,18,0.06), 0px 1px 3px 0px rgba(10,13,18,0.10)' },
  default: {
    shadowColor: '#0A0D12',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 2,
    elevation: 2,
  },
}) as object;

export interface ToggleProps {
  /** On/off state (controlled). */
  value: boolean;
  /** Fired with the next value. */
  onValueChange?: (value: boolean) => void;
  /** Optional label to the right of the switch. */
  label?: string;
  /** Optional supporting text under the label. */
  subtext?: string;
  /** Switch size — `sm` (36×20) or `md` (44×24). Default `md`. */
  size?: ToggleSize;
  /** Disable interaction + dim. */
  disabled?: boolean;
  style?: object;
}

/**
 * Toggle — a switch with optional label + supporting text. Mirrors Figma
 * nodes 72:26576 (sizes) and 72:26641 (label/subtext).
 *
 * Per Figma (tokens):
 *   • Off  — track #F1F5F9 (neutral.bold), white thumb (left).
 *   • On   — track #005DAC (brand), white thumb (right).
 *   • Disabled — track stays #F1F5F9 (never brand), faded; text → #94A3B8.
 */
export const Toggle: React.FC<ToggleProps> = ({
  value,
  onValueChange,
  label,
  subtext,
  size = 'md',
  disabled = false,
  style,
}) => {
  const s = SIZE[size];
  // Track is brand only when on AND enabled; otherwise the muted neutral.
  const trackColor = !disabled && value ? colors.brand : colors.surfaceMuted;
  // Top-align the switch with the first text line when supporting text wraps;
  // otherwise centre it against a single label.
  const alignItems = subtext ? 'flex-start' : 'center';

  return (
    <Pressable
      style={[styles.row, { gap: s.rowGap, alignItems }, style]}
      onPress={() => !disabled && onValueChange?.(!value)}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
    >
      <View
        style={[
          styles.track,
          { width: s.trackW, height: s.trackH, borderRadius: s.trackH / 2, backgroundColor: trackColor },
          disabled && styles.switchDisabled,
        ]}
      >
        <View
          style={[
            styles.thumb,
            THUMB_SHADOW,
            { width: s.thumb, height: s.thumb, borderRadius: s.thumb / 2, alignSelf: value ? 'flex-end' : 'flex-start' },
          ]}
        />
      </View>

      {(label || subtext) && (
        <View style={[styles.textCol, { gap: s.textGap }]}>
          {label ? (
            <Text style={[styles.label, { fontSize: s.label, lineHeight: s.labelLh }, disabled && styles.textDisabled]}>
              {label}
            </Text>
          ) : null}
          {subtext ? (
            <Text style={[styles.subtext, { fontSize: s.sub, lineHeight: s.subLh }, disabled && styles.textDisabled]}>
              {subtext}
            </Text>
          ) : null}
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignSelf: 'flex-start' },
  track: { padding: 2, justifyContent: 'center' },
  switchDisabled: { opacity: 0.6 },
  thumb: { backgroundColor: '#FFFFFF' },
  textCol: { flexShrink: 1 },
  // Label — #1E293B (color.text). Size/lineHeight applied inline per size.
  label: { fontFamily: typography.fontFamily, fontWeight: '400', color: colors.textHeading },
  // Supporting text — #475569 (color.text.subtle).
  subtext: { fontFamily: typography.fontFamily, fontWeight: '400', color: colors.textBody },
  // Disabled label + supporting text → #94A3B8 (color.text.subtlest).
  textDisabled: { color: colors.textMuted },
});
