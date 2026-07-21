import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography, fontFamilyForWeight } from '../../theme';

export interface TileProps {
  /** Title text. */
  label: string;
  /** Optional supporting line. */
  description?: string;
  /** Optional icon (recommended 24×24). */
  icon?: React.ReactNode;
  /** Selected (highlighted) state. */
  selected?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  style?: object;
}

/**
 * Tile — a selectable card with icon + label + optional description. Mirrors
 * `@atlas-ds/react` `<Tile>`. Brand border/tint when selected.
 */
export const Tile: React.FC<TileProps> = ({
  label,
  description,
  icon,
  selected = false,
  disabled = false,
  onPress,
  style,
}) => (
  <Pressable
    onPress={() => !disabled && onPress?.()}
    disabled={disabled}
    accessibilityRole="button"
    accessibilityState={{ selected, disabled }}
    style={[
      styles.tile,
      selected ? styles.selected : styles.idle,
      disabled && styles.disabled,
      style,
    ]}
  >
    {icon ? <View style={styles.icon}>{icon}</View> : null}
    <Text style={[styles.label, selected && { color: colors.brand }]} numberOfLines={2}>
      {label}
    </Text>
    {description ? (
      <Text style={styles.description} numberOfLines={2}>
        {description}
      </Text>
    ) : null}
  </Pressable>
);

const styles = StyleSheet.create({
  // Web tile: column, centred, padding 16, gap 12, radius 8, 1px border.
  tile: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md, // 12
    padding: spacing.lg, // 16
    borderRadius: radius.lg, // 8
    borderWidth: 1,
    minWidth: 120,
  },
  idle: { borderColor: colors.border, backgroundColor: colors.surface },
  // Web selected: blue-50 bg, 2px brand border, brand text.
  selected: { borderColor: colors.brand, backgroundColor: colors.brandSubtle, borderWidth: 2 },
  disabled: { opacity: 0.5 },
  icon: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  label: { fontFamily: fontFamilyForWeight('500'), fontSize: 14, lineHeight: 20, fontWeight: '500', color: colors.textHeading, textAlign: 'center' },
  description: { fontFamily: typography.fontFamily, fontSize: 12, lineHeight: 16, color: colors.textBody, textAlign: 'center' },
});
