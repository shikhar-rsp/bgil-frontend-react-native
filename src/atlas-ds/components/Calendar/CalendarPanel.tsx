import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, radius, typography, spacing } from '../../theme';
import { buildMonthGrid, sameDay, isBetween, WEEKDAYS_SHORT, MONTH_NAMES_LONG } from './utils';

export interface CalendarPanelProps {
  /** Month to render (only year + month matter — day is ignored). */
  currentDate: Date;
  selectedDate?: Date | null;
  startDate?: Date | null;
  endDate?: Date | null;
  onDateClick: (date: Date) => void;
  mode?: 'single' | 'range';
  minDate?: Date;
  maxDate?: Date;
  /**
   * If true, render the "Month YYYY" header inline above the weekday row.
   * Per Figma mobile spec, every month in the vertically-scrolling list shows
   * its own label (no global header / chevrons).
   */
  showMonthLabel?: boolean;
  /** Tap "Month" → opens the month picker for this panel's year. */
  onMonthPress?: (date: Date) => void;
  /** Tap "YYYY" → opens the year picker for this panel's month. */
  onYearPress?: (date: Date) => void;
}

/**
 * Renders ONE month's date grid (weekday row + 6×7 day cells). Stateless — the
 * parent owns currentDate and tells us what's selected/in-range. This is the
 * unit that becomes a "page" inside the vertical FlatList.
 */
export const CalendarPanel: React.FC<CalendarPanelProps> = ({
  currentDate,
  selectedDate,
  startDate,
  endDate,
  onDateClick,
  mode = 'single',
  minDate,
  maxDate,
  showMonthLabel = false,
  onMonthPress,
  onYearPress,
}) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const cells = buildMonthGrid(year, month);
  const showExternalDays = mode === 'single';

  const isDisabled = (date: Date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  return (
    <View style={styles.body}>
      {showMonthLabel && (
        <View style={styles.monthHeader}>
          <Pressable
            onPress={() => onMonthPress?.(currentDate)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`Open month picker, ${MONTH_NAMES_LONG[month]}`}
          >
            <Text style={styles.monthHeaderText}>{MONTH_NAMES_LONG[month]}</Text>
          </Pressable>
          <Pressable
            onPress={() => onYearPress?.(currentDate)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`Open year picker, ${year}`}
          >
            <Text style={styles.monthHeaderText}>{year}</Text>
          </Pressable>
        </View>
      )}
      <View style={styles.weekdays}>
        {WEEKDAYS_SHORT.map((wd) => (
          <View key={wd} style={styles.weekdayCell}>
            <Text style={styles.weekdayText}>{wd}</Text>
          </View>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map(({ date, inMonth }, idx) => {
          // For range mode we hide cells outside the current month (matches web).
          if (!inMonth && !showExternalDays) {
            return <View key={idx} style={styles.cell} />;
          }

          const selected = sameDay(date, selectedDate);
          const rangeStart = sameDay(date, startDate);
          const rangeEnd = sameDay(date, endDate);
          const inRange = startDate && endDate
            ? isBetween(date, startDate, endDate)
            : false;
          const isEndpoint = rangeStart || rangeEnd;
          const today = sameDay(date, new Date());
          const disabled = !inMonth || isDisabled(date);

          // Background + radius logic mirrors the Figma range pill:
          //   start → rounded-left,  middle → square + tint,  end → rounded-right
          const cellStyles: any[] = [styles.cell];
          const textStyles: any[] = [styles.cellText];

          if (selected || isEndpoint) {
            cellStyles.push(styles.cellSelected);
            textStyles.push(styles.cellSelectedText);
            if (rangeStart && endDate) cellStyles.push(styles.cellRangeStartShape);
            if (rangeEnd && startDate) cellStyles.push(styles.cellRangeEndShape);
          } else if (inRange) {
            cellStyles.push(styles.cellRangeMid);
            textStyles.push(styles.cellRangeMidText);
          } else if (disabled) {
            textStyles.push(styles.cellDisabledText);
          }

          return (
            <Pressable
              key={idx}
              onPress={() => !disabled && onDateClick(date)}
              disabled={disabled}
              accessibilityRole="button"
              accessibilityLabel={date.toDateString()}
              accessibilityState={{ selected, disabled }}
              style={({ pressed }) => [
                cellStyles,
                pressed && !disabled && styles.cellPressed,
              ]}
            >
              <Text style={textStyles}>{date.getDate()}</Text>
              {today && !selected && !isEndpoint && <View style={styles.todayDot} />}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const CELL = 32;

const styles = StyleSheet.create({
  body: {
    // Mobile-spec padding — body fills the calendar container; cells stretch.
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
    gap: spacing.md, // 12px between blocks (header, weekday row, grid)
  },
  // "Month YYYY" header above each month in the vertical scroll. Body 1/Medium
  // (Rubik 500, 16/24, #1E293B). Month and year are independently tappable.
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs, // 4px between "Month" and "YYYY"
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  monthHeaderText: {
    fontFamily: typography.fontFamily,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    color: colors.textHeading,
  },
  weekdays: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  // Weekday cells stretch to fill the row (no fixed width) so they line up
  // exactly with the date cells below, regardless of container width.
  weekdayCell: {
    height: CELL,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  weekdayText: {
    ...typography.body3,
    color: colors.textMuted,
    fontFamily: typography.fontFamily,
  },
  // Use row+wrap so we can give each row its own 12px vertical gap (matches Figma).
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: spacing.md, // 12px between week rows
  },
  cell: {
    width: `${100 / 7}%` as any, // each column = 1/7 of the row (fills width)
    height: CELL,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
  },
  cellPressed: {
    backgroundColor: colors.surfaceSubtle,
  },
  cellText: {
    ...typography.body3,
    color: colors.textBody,
    fontFamily: typography.fontFamily,
  },
  cellDisabledText: {
    color: colors.textDisabled,
  },
  cellSelected: {
    backgroundColor: colors.brand,
  },
  cellSelectedText: {
    color: colors.textOnBrand,
  },
  cellRangeMid: {
    backgroundColor: colors.brandSubtle,
    borderRadius: 0,
  },
  cellRangeMidText: {
    color: colors.brandPressed,
  },
  // Asymmetric radii give the "pill" effect at the range endpoints.
  cellRangeStartShape: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  cellRangeEndShape: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  todayDot: {
    position: 'absolute',
    bottom: 3,
    width: 4,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.brand,
  },
});
