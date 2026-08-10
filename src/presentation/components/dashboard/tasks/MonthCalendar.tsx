import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { CheckCircle } from 'phosphor-react-native';
import {
  BADGE_DOT_COLORS,
  BadgeDot,
  BottomSheet,
  accent,
  colors,
  fontFamilyForWeight,
  radius,
  spacing,
  typography,
  type AccentColor,
  type BadgeDotColor,
} from '@atlas-ds/react-native';

/** One chip on a calendar day. */
export interface MonthEvent {
  label: string;
  color: AccentColor;
  done?: boolean;
  /** Links the chip back to its source row (e.g. a meeting id) so the consumer
   *  can open the matching detail. */
  id?: string;
}

/** Events keyed by day-of-month within the reference month. */
export type MonthEvents = Record<number, MonthEvent[]>;

// Today, read from the device clock — drives the highlight and the reference
// month (the month whose day cells the `events` map is applied to).
const NOW = new Date();
const TODAY = { year: NOW.getFullYear(), month: NOW.getMonth(), day: NOW.getDate() };

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// Dots shown under a day number before the rest collapse into "+N".
const MAX_DOTS = 3;
const DONE_GREEN = '#16A34A';

// The day cells reuse the same `BadgeDot` as the filter tags above the
// calendar. The two palettes are 1:1 apart from accent `orange`, which the
// badge-dot tokens call `warning`.
const DOT_COLOR: Record<AccentColor, BadgeDotColor> = {
  red: 'red',
  amber: 'amber',
  lime: 'lime',
  blue: 'blue',
  neutral: 'neutral',
  brand: 'brand',
  indigo: 'indigo',
  emerald: 'emerald',
  teal: 'teal',
  orange: 'warning',
  pink: 'pink',
  violet: 'violet',
  rose: 'rose',
};

// Months reachable by scrolling the grid — the current one plus the rest of
// the rolling year.
const MONTHS_SHOWN = 12;

// Every month is drawn as a full 6-row grid so all pages are the same height —
// that's what lets the grid page cleanly from one month to the next.
const WEEK_ROWS = 6;
const DAY_CELL_HEIGHT = 58;
const GRID_HEIGHT = WEEK_ROWS * DAY_CELL_HEIGHT;

interface Cell {
  day: number;
  inMonth: boolean;
}

/** Build the 6-week (42-cell) grid for a month, padded with adjacent days. */
function buildCells(year: number, month: number): Cell[] {
  const startDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevDays = new Date(year, month, 0).getDate();
  const cells: Cell[] = [];
  for (let i = 0; i < startDow; i++) {
    cells.push({ day: prevDays - startDow + 1 + i, inMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, inMonth: true });
  }
  let next = 1;
  while (cells.length < WEEK_ROWS * 7) {
    cells.push({ day: next++, inMonth: false });
  }
  return cells;
}

/**
 * Month calendar with a compact day grid. There is no month stepper: the grid
 * itself scrolls vertically and pages from one month to the next, inside a
 * fixed-height card, so the surrounding screen keeps its length. The header
 * above it names whichever month the grid has settled on. The `events` map is
 * applied to the reference month (the current one); later months show an empty
 * grid. The seven columns share the phone width — a day's events show as
 * category dots, and tapping the day opens the bottom sheet with the labelled
 * list.
 */
export const MonthCalendar: React.FC<{
  events: MonthEvents;
  onEventPress?: (event: MonthEvent) => void;
  /** Shown inside the month (in place of the day grid) when `events` is empty —
   *  e.g. a filter combination that matches nothing. */
  emptyState?: React.ReactNode;
}> = ({ events, onEventPress, emptyState }) => {
  // The day whose full event list is shown in the "+N more" bottom sheet.
  const [sheetDay, setSheetDay] = useState<{ day: number; month: number; events: MonthEvent[] } | null>(
    null,
  );
  // Which month page the grid has scrolled to — drives the header label only.
  const [index, setIndex] = useState(0);

  // The current month first, then the following ones — scrolling down walks
  // forward through the year.
  const months = useMemo(
    () =>
      Array.from({ length: MONTHS_SHOWN }, (_, i) => {
        const absolute = TODAY.month + i;
        const year = TODAY.year + Math.floor(absolute / 12);
        const month = absolute % 12;
        const cells = buildCells(year, month);
        const weeks: Cell[][] = [];
        for (let c = 0; c < cells.length; c += 7) {
          weeks.push(cells.slice(c, c + 7));
        }
        return { year, month, weeks };
      }),
    [],
  );

  // No matching events at all — the consumer's filters emptied the set.
  const showEmpty = !!emptyState && Object.keys(events).length === 0;

  const visible = months[Math.min(index, months.length - 1)];

  // The grid pages by its own height, so the settled page is the month on show.
  const onSettle = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(e.nativeEvent.contentOffset.y / GRID_HEIGHT);
    setIndex(Math.max(0, Math.min(next, months.length - 1)));
  };

  return (
    <>
    <View style={styles.wrap}>
      {/* Month header — names the month the grid has scrolled to */}
      <View style={styles.header}>
        <Text style={styles.monthLabel}>
          {MONTHS[visible.month]} '{String(visible.year).slice(-2)}
        </Text>
      </View>

      {showEmpty ? (
        <View style={styles.calendarEmpty}>{emptyState}</View>
      ) : (
      <View>
        {/* Weekday header row — fixed; only the grid below it scrolls */}
        <View style={styles.weekdayRow}>
          {WEEKDAYS.map((d) => (
            <View key={d} style={styles.weekdayCell}>
              <Text style={styles.weekdayText}>{d}</Text>
            </View>
          ))}
        </View>

        {/* Day grid — one full-height page per month */}
        <ScrollView
          style={styles.grid}
          pagingEnabled
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
          onMomentumScrollEnd={onSettle}
          onScrollEndDrag={onSettle}
        >
          {months.map(({ year, month, weeks }) => {
            const isReferenceMonth = year === TODAY.year && month === TODAY.month;
            const eventsFor = (cell: Cell): MonthEvent[] =>
              isReferenceMonth && cell.inMonth ? events[cell.day] ?? [] : [];
            const isToday = (cell: Cell) => isReferenceMonth && cell.inMonth && cell.day === TODAY.day;

            return (
              <View key={`${year}-${month}`} style={styles.gridPage}>
                {weeks.map((week, wi) => (
                  <View key={wi} style={styles.weekRow}>
                    {week.map((cell, ci) => {
                      const dayEvents = eventsFor(cell);
                      const today = isToday(cell);
                      const dots = dayEvents.slice(0, MAX_DOTS);
                      const overflow = dayEvents.length - dots.length;
                      const hasEvents = dayEvents.length > 0;
                      return (
                        <Pressable
                          key={ci}
                          // Labels don't fit a 1/7-width cell, so the day itself opens
                          // the sheet that lists them.
                          onPress={
                            hasEvents ? () => setSheetDay({ day: cell.day, month, events: dayEvents }) : undefined
                          }
                          disabled={!hasEvents}
                          accessibilityRole={hasEvents ? 'button' : undefined}
                          accessibilityLabel={
                            hasEvents ? `${cell.day} — show all ${dayEvents.length} events` : undefined
                          }
                          style={[styles.dayCell, !cell.inMonth && styles.dayCellMuted, today && styles.dayCellToday]}
                        >
                          <View style={styles.dayNumberRow}>
                            {today ? (
                              <View style={styles.todayBadge}>
                                <Text style={styles.todayNumber}>{cell.day}</Text>
                              </View>
                            ) : (
                              <Text style={[styles.dayNumber, !cell.inMonth && styles.dayNumberMuted]}>{cell.day}</Text>
                            )}
                          </View>

                          <View style={styles.dotRow}>
                            {dots.map((ev, i) => (
                              <BadgeDot key={i} size="sm" color={DOT_COLOR[ev.color]} />
                            ))}
                            {overflow > 0 ? <Text style={styles.moreText}>+{overflow}</Text> : null}
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>
                ))}
              </View>
            );
          })}
        </ScrollView>
      </View>
      )}
    </View>

    {/* All events for a day, opened from "+N more" */}
    <BottomSheet
      visible={sheetDay !== null}
      onClose={() => setSheetDay(null)}
      title={sheetDay ? `${MONTHS[sheetDay.month]} ${sheetDay.day}` : undefined}
    >
      <View style={styles.sheetList}>
        {(sheetDay?.events ?? []).map((ev, i) => {
          // Border + text take the badge-dot value so a row reads as the same
          // colour as its dot in the grid; the pale wash still comes from the
          // accent pair, which is the only place a light tint is defined.
          const dotColor = BADGE_DOT_COLORS[DOT_COLOR[ev.color]];
          return (
            <Pressable
              key={i}
              onPress={() => {
                setSheetDay(null);
                onEventPress?.(ev);
              }}
              disabled={!onEventPress}
              style={[styles.sheetChip, { backgroundColor: accent[ev.color].lightBg, borderLeftColor: dotColor }]}
            >
              <Text style={[styles.sheetChipText, { color: dotColor }]} numberOfLines={1}>
                {ev.label}
              </Text>
              {ev.done ? <CheckCircle size={16} color={DONE_GREEN} weight="regular" /> : null}
            </Pressable>
          );
        })}
      </View>
    </BottomSheet>
    </>
  );
};

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
    paddingVertical: spacing.md,
  },
  // The scrolling area: exactly one month tall, so `pagingEnabled` snaps a
  // whole month at a time and the card never grows with the months below.
  grid: { height: GRID_HEIGHT },
  gridPage: { height: GRID_HEIGHT },
  monthLabel: { fontFamily: fontFamilyForWeight('600'), fontSize: 16, fontWeight: '600', color: colors.textHeading },

  calendarEmpty: {
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  weekdayRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.borderSubtle },
  weekdayCell: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: colors.borderSubtle,
  },
  weekdayText: { fontFamily: typography.fontFamily, fontSize: 11, lineHeight: 16, color: colors.textBody },

  weekRow: { flexDirection: 'row' },
  // Seven columns share the phone width — no sideways scroll.
  dayCell: {
    flex: 1,
    // Fixed (not min) so six rows measure exactly one page.
    height: DAY_CELL_HEIGHT,
    paddingVertical: spacing.xs,
    paddingHorizontal: 2,
    gap: 3,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surface,
  },
  // Out-of-month days sit on a subtle grey wash.
  dayCellMuted: { backgroundColor: colors.surfaceSubtle },
  // Today — brand outline drawn inside the cell.
  dayCellToday: { borderWidth: 1, borderColor: colors.brand },

  dayNumberRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  dayNumber: { fontFamily: typography.fontFamily, fontSize: 13, lineHeight: 20, color: colors.textBody },
  dayNumberMuted: { color: colors.textMuted },
  todayBadge: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 4,
    borderRadius: radius.sm,
    backgroundColor: colors.brandPressed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayNumber: { fontFamily: fontFamilyForWeight('400'), fontSize: 13, fontWeight: '400', color: colors.textOnBrand },

  // Category dots stand in for the chips the narrow cell can't fit; the labels
  // live in the day's bottom sheet.
  dotRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3, minHeight: 12 },
  moreText: { fontFamily: fontFamilyForWeight('500'), fontSize: 10, lineHeight: 12, fontWeight: '500', color: colors.brand },

  // "+N more" bottom-sheet list.
  sheetList: { gap: spacing.sm },
  sheetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderLeftWidth: 3,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  sheetChipText: { flex: 1, fontFamily: typography.fontFamily, fontSize: 14, lineHeight: 20 },
});
