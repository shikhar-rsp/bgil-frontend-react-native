import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { accent, radius, typography } from '../../theme';
import type { AccentColor } from '../../theme';

/** Semantic status → accent colour mapping. */
export type LozengeStatus = 'neutral' | 'success' | 'warning' | 'error' | 'info';

const STATUS_COLOR: Record<LozengeStatus, AccentColor> = {
  neutral: 'neutral',
  success: 'emerald',
  warning: 'amber',
  error: 'red',
  info: 'blue',
};

export interface LozengeProps {
  /** Text label. */
  label: string;
  /** Semantic status. Default `neutral`. Ignored if `color` is set. */
  status?: LozengeStatus;
  /** Explicit accent colour (overrides `status`). */
  color?: AccentColor;
  /** Show a leading status dot. Default true. */
  dot?: boolean;
  style?: object;
}

/**
 * Lozenge — a subtle status pill (tinted background, optional leading dot).
 * Mirrors `@atlas-ds/react` `<Lozenge>`.
 */
export const Lozenge: React.FC<LozengeProps> = ({
  label,
  status = 'neutral',
  color,
  dot = true,
  style,
}) => {
  const c = accent[color ?? STATUS_COLOR[status]];
  return (
    <View style={[styles.base, { backgroundColor: c.lightBg }, style]}>
      {dot ? <View style={[styles.dot, { backgroundColor: c.solidBg }]} /> : null}
      <Text style={[styles.label, { color: c.solidBg }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: radius.full,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  label: { fontFamily: typography.fontFamily, fontSize: 12, lineHeight: 16, fontWeight: '500' },
});
