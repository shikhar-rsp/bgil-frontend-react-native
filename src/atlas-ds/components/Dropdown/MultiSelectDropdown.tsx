import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Check } from 'phosphor-react-native';
import { colors, radius, spacing, typography } from '../../theme';
import type { DropdownOption } from './Dropdown';

const CHECK_SIZE = 12;

export interface MultiSelectDropdownProps {
  /** Options to display. Each can optionally provide an icon (rendered 20×20). */
  options: DropdownOption[];
  /** Currently-selected `value`s. Passing `[]` means nothing is selected. */
  values: string[];
  /** Fired with the new array whenever the user toggles a row. */
  onChange: (values: string[]) => void;
  /** Show a "N/Total" count badge at the top of the list. Default true. */
  showCount?: boolean;
  /** Max height before the list starts scrolling (default 320). */
  maxHeight?: number;
  /** Style override on the outer container. */
  style?: object;
}

/**
 * Multi-select Dropdown — designed to live inside a BottomSheet on mobile.
 *
 * Figma source: vHExm4J0Y43BZkLYswSKm8 node 9034:43143.
 *
 * Differences from the single-select Dropdown:
 *   • Each row carries a 16×16 checkbox (filled brand when selected,
 *     outlined when not).
 *   • Selected rows get a brand-tinted background (#E8F4FF) per Figma.
 *   • A count badge ("3/10") sits above the list — automatic from `values.length`.
 *   • Confirm / Cancel actions live on the host BottomSheet (use its
 *     `primaryAction` / `secondaryAction` slots) — keeps this component
 *     focused on selection state.
 */
export const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  options,
  values,
  onChange,
  showCount = true,
  maxHeight = 320,
  style,
}) => {
  // Stable Set for O(1) "is this value selected" checks.
  const selected = React.useMemo(() => new Set(values), [values]);

  const toggle = (value: string) => {
    const next = new Set(selected);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    onChange(Array.from(next));
  };

  return (
    <View style={[styles.container, style]}>
      {showCount && (
        <View style={styles.countBadgeRow}>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>
              {values.length}/{options.length}
            </Text>
          </View>
        </View>
      )}

      <ScrollView
        style={{ maxHeight }}
        showsVerticalScrollIndicator
        contentContainerStyle={styles.list}
      >
        {options.map((opt) => {
          const isSelected = selected.has(opt.value);
          return (
            <Pressable
              key={opt.value}
              onPress={() => !opt.disabled && toggle(opt.value)}
              disabled={opt.disabled}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isSelected, disabled: !!opt.disabled }}
              style={({ pressed }) => [
                styles.row,
                isSelected && styles.rowSelected,
                pressed && !opt.disabled && !isSelected && styles.rowPressed,
                opt.disabled && styles.rowDisabled,
              ]}
            >
              {/* 16×16 checkbox — filled brand when selected, outlined when not. */}
              <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                {isSelected && (
                  <Check size={CHECK_SIZE} color={colors.textOnBrand} weight="bold" />
                )}
              </View>

              {opt.icon != null && <View style={styles.iconSlot}>{opt.icon}</View>}

              <Text
                style={[
                  styles.label,
                  opt.disabled && styles.labelDisabled,
                ]}
                numberOfLines={1}
              >
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

const CHECKBOX = 16;

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    gap: spacing.sm,
  },
  // "3/10" badge — Figma `layout_QCSSUJ` + Body 1/Regular.
  // Row hugs the centre so the badge sits centred under the sheet title.
  countBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadge: {
    paddingHorizontal: spacing.md, // 12
    paddingVertical: 2,
    backgroundColor: colors.surfaceMuted, // #F1F5F9
    borderRadius: radius.xl + 4, // ~16px per Figma
  },
  countBadgeText: {
    fontFamily: typography.fontFamily,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    color: colors.textHeading,
  },
  list: {
    gap: spacing.sm, // 8px between rows
  },
  // layout_LMXZKE — row, padding 8×12, gap 8
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
  },
  rowPressed: {
    backgroundColor: colors.surfaceSubtle,
  },
  rowSelected: {
    backgroundColor: colors.brandSubtle, // #E8F4FF per Figma
  },
  rowDisabled: {
    opacity: 0.5,
  },
  // 16×16 checkbox
  checkbox: {
    width: CHECKBOX,
    height: CHECKBOX,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border, // #CBD5E1 unselected
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  iconSlot: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    color: colors.textHeading,
    flex: 1,
  },
  labelDisabled: {
    color: colors.textMuted,
  },
});
