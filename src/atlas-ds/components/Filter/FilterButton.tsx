import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { FunnelSimple } from 'phosphor-react-native';
import { colors, radius, spacing, typography } from '../../theme';

export interface FilterButtonProps {
  /** Button text. Default "Filter". */
  label?: string;
  /** Tap handler — typically opens the filter Bottom Sheet. */
  onPress?: () => void;
  /** Optional count of applied filters, shown as a trailing badge. */
  count?: number;
  /** Override the leading FunnelSimple icon. */
  icon?: React.ReactNode;
  disabled?: boolean;
  style?: object;
}

/**
 * FilterButton — the filter trigger button from Figma (node 9699:4257):
 * a neutral outline button with a FunnelSimple icon and "Filter" label.
 *
 * White surface, #CBD5E1 (border.bold) 1px border, radius 8, padding 16×8,
 * gap 8, label Body 2 / Regular (Rubik 14·20) in #475569 (text.subtle).
 */
export const FilterButton: React.FC<FilterButtonProps> = ({
  label = 'Filter',
  onPress,
  count,
  icon,
  disabled = false,
  style,
}) => (
  <Pressable
    onPress={onPress}
    disabled={disabled}
    accessibilityRole="button"
    accessibilityLabel={label}
    style={({ pressed }) => [
      styles.button,
      pressed && !disabled && styles.pressed,
      disabled && styles.disabled,
      style,
    ]}
  >
    {icon ?? <FunnelSimple size={20} color={colors.textBody} weight="regular" />}
    <Text style={styles.label}>{label}</Text>
    {count != null && count > 0 && (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{count}</Text>
      </View>
    )}
  </Pressable>
);

FilterButton.displayName = 'FilterButton';

const styles = StyleSheet.create({
  // Figma: row, gap 8, padding px16/py8, radius 8, 1px #CBD5E1 border, white bg.
  button: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm, // 8
    paddingHorizontal: spacing.lg, // 16
    paddingVertical: spacing.sm, // 8
    borderRadius: radius.lg, // 8
    borderWidth: 1,
    borderColor: colors.border, // #CBD5E1 (border.bold)
    backgroundColor: colors.surface,
  },
  pressed: { backgroundColor: colors.surfaceSubtle },
  disabled: { opacity: 0.5 },
  // Body 2 / Regular, #475569 (text.subtle).
  label: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    color: colors.textBody,
  },
  // Trailing applied-count badge (brand-tinted, matches Filter group badges).
  badge: {
    minWidth: 20,
    paddingHorizontal: 6,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brandSubtle,
  },
  badgeText: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    color: colors.brandPressed,
  },
});
