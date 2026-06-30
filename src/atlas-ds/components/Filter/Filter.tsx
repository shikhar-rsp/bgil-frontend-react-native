import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { CaretUp, CaretDown, Check } from 'phosphor-react-native';
import { colors, radius, spacing, typography } from '../../theme';

const CARET_SIZE = 20;
const CHECK_SIZE = 12;

/** A single selectable option inside a Filter group. */
export interface FilterOption {
  value: string;
  label: string;
  disabled?: boolean;
}

/** A logical grouping of related filter options (e.g. "LOB Type"). */
export interface FilterGroup {
  /** Stable identifier — used as a key in the `values` map. */
  key: string;
  /** Display label shown in the accordion header. */
  label: string;
  /** Checkbox options inside this group. */
  options: FilterOption[];
}

export interface FilterProps {
  /** Filter groups to render — each becomes a collapsible accordion. */
  groups: FilterGroup[];
  /** Current selections per group, keyed by `group.key`. */
  values: Record<string, string[]>;
  /** Fired with the full next selection map whenever any checkbox toggles. */
  onChange: (next: Record<string, string[]>) => void;
  /** Group keys that start expanded. Defaults to the first group only. */
  defaultExpanded?: string[];
  /** Max height before the list starts scrolling. Default 360. */
  maxHeight?: number;
  /** Style override on the outer container. */
  style?: object;
}

/**
 * Filter — collapsible filter groups for the mobile Bottom Sheet pattern.
 *
 * Figma source: vHExm4J0Y43BZkLYswSKm8 node 9181:94214.
 *
 * Layout per Figma:
 *   • Vertical stack of accordion headers (collapsed or open).
 *   • Header: row, padding 12×16, gap 16. Label on the left (Body 1/Medium
 *     when open, Body 1/Regular when collapsed), right side has a count
 *     badge + caret icon.
 *   • Open header bg: #F8FAFC. Closed header bg: #FFFFFF.
 *   • Open-group badge: #E8F4FF bg / #004E91 text. Closed badge: #F1F5F9 / #1E293B.
 *   • Accordion carets use Phosphor CaretUp / CaretDown; selected checkboxes
 *     use Phosphor Check (regular weight on carets, bold on check).
 *
 * Apply / Cancel buttons live on the host BottomSheet (use its primaryAction
 * / secondaryAction). The Filter itself is just the body content.
 */
export const Filter: React.FC<FilterProps> = ({
  groups,
  values,
  onChange,
  defaultExpanded,
  maxHeight = 360,
  style,
}) => {
  // Track expanded groups. Uncontrolled (state lives here); the consumer
  // controls the SELECTIONS via `values`/`onChange`, not the open/close UI.
  const [expanded, setExpanded] = React.useState<Set<string>>(
    () => new Set(defaultExpanded ?? (groups[0] ? [groups[0].key] : []))
  );

  const toggleGroup = (key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleOption = (groupKey: string, optValue: string) => {
    const current = values[groupKey] ?? [];
    const set = new Set(current);
    if (set.has(optValue)) set.delete(optValue);
    else set.add(optValue);
    onChange({ ...values, [groupKey]: Array.from(set) });
  };

  return (
    <ScrollView
      style={[{ maxHeight }, style]}
      showsVerticalScrollIndicator
      contentContainerStyle={styles.list}
    >
      {groups.map((group) => {
        const isOpen = expanded.has(group.key);
        const selected = new Set(values[group.key] ?? []);
        const count = selected.size;

        return (
          <View key={group.key}>
            {/* Accordion header */}
            <Pressable
              onPress={() => toggleGroup(group.key)}
              accessibilityRole="button"
              accessibilityState={{ expanded: isOpen }}
              style={[styles.header, isOpen && styles.headerOpen]}
            >
              <Text style={[styles.headerLabel, isOpen && styles.headerLabelOpen]}>
                {group.label}
              </Text>
              <View style={styles.headerRight}>
                {count > 0 && (
                  <View style={[styles.badge, isOpen ? styles.badgeOpen : styles.badgeClosed]}>
                    <Text style={[styles.badgeText, isOpen ? styles.badgeTextOpen : styles.badgeTextClosed]}>
                      {count}
                    </Text>
                  </View>
                )}
                {isOpen ? (
                  <CaretUp size={CARET_SIZE} color={colors.textBody} weight="regular" />
                ) : (
                  <CaretDown size={CARET_SIZE} color={colors.textBody} weight="regular" />
                )}
              </View>
            </Pressable>

            {/* Options — visible only when group is expanded */}
            {isOpen && (
              <View style={styles.options}>
                {group.options.map((opt) => {
                  const isSelected = selected.has(opt.value);
                  return (
                    <Pressable
                      key={opt.value}
                      onPress={() => !opt.disabled && toggleOption(group.key, opt.value)}
                      disabled={opt.disabled}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: isSelected, disabled: !!opt.disabled }}
                      style={({ pressed }) => [
                        styles.optionRow,
                        // Selected rows take the brand-tinted background — same
                        // selection language as MultiSelectDropdown and the
                        // Calendar's range-mid cells.
                        isSelected && styles.optionRowSelected,
                        pressed && !opt.disabled && !isSelected && styles.optionRowPressed,
                        opt.disabled && styles.optionRowDisabled,
                      ]}
                    >
                      <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                        {isSelected && (
                          <Check size={CHECK_SIZE} color={colors.textOnBrand} weight="bold" />
                        )}
                      </View>
                      <Text style={[styles.optionLabel, opt.disabled && styles.optionLabelDisabled]} numberOfLines={1}>
                        {opt.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  list: {
    gap: spacing.xs, // 4 between accordion groups per Figma `layout_L7PHO6`
  },
  // Accordion header — 12×16 padding, gap 16, row layout per `layout_VDSB2R`
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md, // 12
    paddingHorizontal: spacing.lg, // 16
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
  },
  headerOpen: {
    backgroundColor: colors.surfaceSubtle, // #F8FAFC per Figma
  },
  // Body 1/Regular when collapsed, Body 1/Medium when open (Figma differentiates
  // weight for the active group — we mirror that here for visual feedback).
  headerLabel: {
    fontFamily: typography.fontFamily,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    color: colors.textHeading,
    flex: 1,
  },
  headerLabelOpen: {
    fontWeight: '500',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  // Count badge — pill shape, padding 0 8, radius 16
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 0,
    borderRadius: radius.xl + 4, // ~16px per Figma
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeOpen: {
    backgroundColor: colors.brandSubtle, // #E8F4FF
  },
  badgeClosed: {
    backgroundColor: colors.surfaceMuted, // #F1F5F9
  },
  badgeText: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
  badgeTextOpen: {
    color: colors.brandPressed, // #004E91
  },
  badgeTextClosed: {
    color: colors.textHeading, // #1E293B
  },
  options: {
    paddingVertical: spacing.xs,
    gap: spacing.xs, // 4px between checkbox rows
  },
  // Checkbox row — same metrics as MultiSelectDropdown's row
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
  },
  optionRowPressed: {
    backgroundColor: colors.surfaceSubtle,
  },
  // Brand-tinted background (#E8F4FF) — same as MultiSelectDropdown selected
  // rows and the Calendar range-mid tint. Unified selection language.
  optionRowSelected: {
    backgroundColor: colors.brandSubtle,
  },
  optionRowDisabled: {
    opacity: 0.5,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  optionLabel: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    color: colors.textHeading,
    flex: 1,
  },
  optionLabelDisabled: {
    color: colors.textMuted,
  },
});
