import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';
import { MONTH_NAMES_LONG } from './utils';

export interface CalendarMonthYearPickerProps {
  type: 'month' | 'year';
  /** Anchor — picker shows the month/year block this falls into. */
  currentDate: Date;
  onSelect: (value: number) => void;
  /** Tap the inactive header label (year on month-picker, month on year-picker) to flip view. */
  onHeaderPress?: () => void;
  /**
   * Last selectable year. The year grid runs from the current 12-year block
   * start up to this year and scrolls — so the user can reach years beyond the
   * initial dozen. Defaults to a single 12-year block (legacy behaviour).
   */
  maxYear?: number;
}

/**
 * Month / Year picker matching Figma node 9020:40304 (Bajaj Mobile DS).
 *
 * Layout (per Figma):
 *   • 344×344 white surface, 8px radius
 *   • Header row: "<MonthName> <Year>" centered, both labels independently
 *     tappable. The label corresponding to the current `type` is tinted brand
 *     blue (the active picker); the other is dark text and tappable to flip.
 *   • 4 rows × 3 columns grid of label chips — full month names for the
 *     month picker, 12 consecutive years for the year picker.
 *   • Each row: padding 16×24, columns gap 20, row-to-row gap 12.
 *   • Each chip: padding 4, radius 4, Body 3/Regular (Rubik 12/16) #475569.
 *
 * Selecting an item:
 *   • Month picker → calls onSelect(monthIndex 0–11) and parent closes view.
 *   • Year picker  → calls onSelect(year), parent flips back to month picker.
 */
export const CalendarMonthYearPicker: React.FC<CalendarMonthYearPickerProps> = ({
  type,
  currentDate,
  onSelect,
  onHeaderPress,
  maxYear,
}) => {
  const currentYear = currentDate.getFullYear();
  // Year grid starts at the current 12-year block (Figma groups years by dozen)
  // and, when `maxYear` is supplied, extends forward to it — the grid scrolls
  // so years beyond the first dozen are reachable.
  const startYear = Math.floor(currentYear / 12) * 12;
  const lastYear = Math.max(maxYear ?? startYear + 11, startYear + 11);
  const items = type === 'month'
    ? MONTH_NAMES_LONG.map((label, i) => ({ label, value: i }))
    : Array.from({ length: lastYear - startYear + 1 }, (_, i) => ({ label: String(startYear + i), value: startYear + i }));

  // Pack the 12 items into 4 rows of 3 so the grid layout matches Figma's row
  // padding (16×24) cleanly instead of using flex-wrap on a single row.
  const rows: Array<Array<{ label: string; value: number }>> = [];
  for (let i = 0; i < items.length; i += 3) rows.push(items.slice(i, i + 3));

  const monthName = MONTH_NAMES_LONG[currentDate.getMonth()];
  const isSelected = (value: number) =>
    type === 'month'
      ? currentDate.getMonth() === value
      : currentDate.getFullYear() === value;

  return (
    <View style={styles.container}>
      {/* Header — month + year, active one tinted brand-blue, other tappable */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Pressable
            onPress={() => type !== 'month' && onHeaderPress?.()}
            hitSlop={8}
            accessibilityRole="button"
          >
            <Text style={[styles.headerLabel, type === 'month' && styles.headerLabelActive]}>
              {monthName}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => type !== 'year' && onHeaderPress?.()}
            hitSlop={8}
            accessibilityRole="button"
          >
            <Text style={[styles.headerLabel, type === 'year' && styles.headerLabelActive]}>
              {currentYear}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Grid of selectable chips (3 per row). Months: a static 4×3 block.
          Years: scrollable, so the range can run past the first dozen. */}
      {type === 'year' ? (
        <ScrollView
          style={styles.yearScroll}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
        >
          {renderRows()}
        </ScrollView>
      ) : (
        <View style={styles.grid}>{renderRows()}</View>
      )}
    </View>
  );

  function renderRows() {
    return rows.map((row, ri) => (
      <View key={ri} style={styles.row}>
        {row.map(({ label, value }) => {
          const selected = isSelected(value);
          return (
            <Pressable
              key={value}
              onPress={() => onSelect(value)}
              style={({ pressed }) => [
                styles.cell,
                selected && styles.cellSelected,
                pressed && !selected && styles.cellPressed,
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected }}
            >
              <Text style={[styles.cellText, selected && styles.cellTextSelected]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    ));
  }
};

const styles = StyleSheet.create({
  container: {
    // 344×344 fixed canvas to match Figma; consumer can override via parent
    // (e.g. when hosting inside a Bottom Sheet that already constrains width).
    width: 344,
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md, // 12
    paddingTop: spacing.sm,        // 8
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs, // 4 between Month and Year
  },
  // Body 1 / Medium — Rubik 500, 16/24
  headerLabel: {
    fontFamily: typography.fontFamily,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    color: colors.textHeading,
  },
  // The label representing the currently-open picker is brand-blue (Figma
  // `fill_YP4JLX` is empty in the export, indicating it inherits the accent
  // token — interpreted here as the brand colour, matching Bajaj's #005DAC).
  headerLabelActive: {
    color: colors.brand,
  },
  grid: {
    flex: 1,
    paddingHorizontal: spacing.sm, // 8
    paddingVertical: spacing.sm,   // 8
    gap: spacing.md,               // 12 between rows
  },
  // Year grid is scrollable — cap the height so ~4 rows (the current dozen)
  // show and later years scroll into view.
  yearScroll: {
    maxHeight: 300,
    alignSelf: 'stretch',
  },
  gridContent: {
    paddingHorizontal: spacing.sm, // 8
    paddingVertical: spacing.sm,   // 8
    gap: spacing.md,               // 12 between rows
  },
  // Each row of 3 chips — gap 20 between chips, padding 16×24 around row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: spacing.lg, // 16
    gap: 20,
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xs, // 4
    borderRadius: radius.sm, // 4
  },
  cellPressed: {
    backgroundColor: colors.surfaceSubtle,
  },
  cellSelected: {
    backgroundColor: colors.brand,
  },
  // Body 3 / regular — Rubik 400, 12/16, #475569
  cellText: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
    color: colors.textBody,
    textAlign: 'center',
  },
  cellTextSelected: {
    color: colors.textOnBrand,
  },
});
