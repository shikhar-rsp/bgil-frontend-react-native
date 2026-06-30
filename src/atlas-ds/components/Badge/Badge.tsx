import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { accent, radius, typography } from '../../theme';
import type { AccentColor } from '../../theme';

export type BadgeVariant = 'solid' | 'light';
export type BadgeSize = 'sm' | 'lg';

export interface BadgeProps {
  /** Text inside the badge. */
  label: string;
  /** Filled (`solid`) or tinted (`light`). Default `solid`. */
  variant?: BadgeVariant;
  /** `sm` or `lg`. Default `lg`. */
  size?: BadgeSize;
  /** Accent colour. Default `neutral`. */
  color?: AccentColor;
  /** Show a leading status dot coloured to match the label (Figma node 9696:2846). */
  dot?: boolean;
  /**
   * Custom icon node — rendered beside the label (overrides `dot`).
   * Size it to ~12px and tint it with the badge's foreground colour
   * (`badgeForeground(color, variant)`) for an on-palette look.
   */
  icon?: React.ReactNode;
  /** Which side the `icon` sits on. Default `left`. */
  iconPosition?: 'left' | 'right';
  style?: object;
}

/** Resolve the label/icon colour for a given badge colour + variant. */
export function badgeForeground(color: AccentColor = 'neutral', variant: BadgeVariant = 'solid'): string {
  return variant === 'solid' ? '#FFFFFF' : accent[color].solidBg;
}

/**
 * Badge — a pill label. Mirrors `@atlas-ds/react` `<Badge>`: solid/light
 * variants, sm/lg sizes, the shared accent palette, and an optional leading
 * dot or custom icon.
 */
export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'solid',
  size = 'lg',
  color = 'neutral',
  dot = false,
  icon,
  iconPosition = 'left',
  style,
}) => {
  const c = accent[color];
  const bg = variant === 'solid' ? c.solidBg : c.lightBg;
  const fg = variant === 'solid' ? '#FFFFFF' : c.solidBg;
  const dotSize = size === 'sm' ? 6 : 8;

  const iconNode = icon != null ? <View style={styles.iconSlot}>{icon}</View> : null;
  const dotNode = dot ? (
    <View style={{ width: dotSize, height: dotSize, borderRadius: dotSize / 2, backgroundColor: fg }} />
  ) : null;
  // Leading slot: an icon (when left) else the dot. Trailing slot: a right icon.
  const leading = iconNode && iconPosition === 'left' ? iconNode : dotNode;
  const trailing = iconNode && iconPosition === 'right' ? iconNode : null;

  return (
    <View style={[styles.base, size === 'sm' ? styles.sm : styles.lg, { backgroundColor: bg }, style]}>
      {leading}
      <Text style={[size === 'sm' ? styles.textSm : styles.textLg, { color: fg }]} numberOfLines={1}>
        {label}
      </Text>
      {trailing}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4, // Figma space-02 between leading dot/icon and label
    borderRadius: radius.full,
  },
  lg: { paddingVertical: 2, paddingHorizontal: 8 },
  sm: { paddingVertical: 1, paddingHorizontal: 6 },
  iconSlot: { width: 12, height: 12, alignItems: 'center', justifyContent: 'center' },
  textLg: { fontFamily: typography.fontFamily, fontSize: 12, lineHeight: 16, fontWeight: '400' },
  textSm: { fontFamily: typography.fontFamily, fontSize: 11, lineHeight: 14, fontWeight: '400' },
});
