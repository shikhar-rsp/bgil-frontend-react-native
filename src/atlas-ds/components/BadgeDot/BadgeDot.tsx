import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography } from '../../theme';

export type BadgeDotSize = 'sm' | 'md' | 'lg';

/** The 13 colour variants of the web `<BadgeDot>` (@atlas-ds/css badge-dot). */
export type BadgeDotColor =
  | 'lime'
  | 'red'
  | 'warning'
  | 'brand'
  | 'amber'
  | 'emerald'
  | 'teal'
  | 'blue'
  | 'indigo'
  | 'pink'
  | 'rose'
  | 'violet'
  | 'neutral';

export interface BadgeDotProps {
  /** Optional text shown next to the dot. */
  label?: string;
  /** `sm` (6), `md` (10) or `lg` (14). Default `lg`. */
  size?: BadgeDotSize;
  /** Colour variant. Default `neutral`. */
  color?: BadgeDotColor;
  style?: object;
}

// Web --badge-dot-size-* tokens.
const DOT = { sm: 6, md: 10, lg: 14 } as const;

// Web --badge-dot-<color> tokens (badge-dot/tokens.css) — matched 1:1.
const BADGE_DOT_COLORS: Record<BadgeDotColor, string> = {
  lime:    '#65A30D',
  red:     '#DC2626',
  warning: '#EA580C',
  brand:   '#005DAC',
  amber:   '#D97706',
  emerald: '#059669',
  teal:    '#0D9488',
  blue:    '#2563EB',
  indigo:  '#4F46E5',
  pink:    '#DB2777',
  rose:    '#E11D48',
  violet:  '#7C3AED',
  neutral: '#475569',
};

/**
 * BadgeDot — a small status dot, optionally labelled. Mirrors
 * `@atlas-ds/react` `<BadgeDot>` 1:1 (13 colour variants, sizes 6/10/14).
 */
export const BadgeDot: React.FC<BadgeDotProps> = ({
  label,
  size = 'lg',
  color = 'neutral',
  style,
}) => {
  const d = DOT[size];
  return (
    <View style={[styles.row, style]}>
      <View style={{ width: d, height: d, borderRadius: d / 2, backgroundColor: BADGE_DOT_COLORS[color] }} />
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' },
  label: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    color: colors.textBody,
  },
});
