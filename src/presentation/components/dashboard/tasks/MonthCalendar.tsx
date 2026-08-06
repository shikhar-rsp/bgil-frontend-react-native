import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { CaretLeft, CaretRight, CheckCircle } from 'phosphor-react-native';
import {
  BottomSheet,
  accent,
  colors,
  fontFamilyForWeight,
  radius,
  spacing,
  typography,
  type AccentColor,
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

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const CELL_WIDTH = 128;
const MAX_CHIPS = 3;
const DONE_GREEN = '#16A34A';

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
  while (cells.length % 7 !== 0) {
    cells.push({ day: next++, inMonth: false });
  }
  return cells;
}

/**
 * Month calendar with chips laid over a day grid. The `events` map is applied to
 * the reference month (August '26); navigating to other months shows an empty
 * grid. On a phone the grid scrolls sideways (128px cells).
 */
export const MonthCalendar: React.FC<{
  events: MonthEvents;
  onEventPress?: (event: MonthEvent) => void;
  /** Shown inside the month (in place of the day grid) when `events` is empty —
   *  e.g. a filter combination that matches nothing. */
  emptyState?: React.ReactNode;
}> = ({ events, onEventPress, emptyState }) => {
  const [view, setView] = useState({ year: TODAY.year, month: TODAY.month });
  // The day whose full event list is shown in the "+N more" bottom sheet.
  const [sheetDay, setSheetDay] = useState<{ day: number; events: MonthEvent[] } | null>(null);

  const weeks = useMemo(() => {
    const cells = buildCells(view.year, view.month);
    const rows: Cell[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
      rows.push(cells.slice(i, i + 7));
    }
    return rows;
  }, [view]);

  const step = (delta: number) => {
    setView((v) => {
      const m = v.month + delta;
      if (m < 0) return { year: v.year - 1, month: 11 };
      if (m > 11) return { year: v.year + 1, month: 0 };
      return { year: v.year, month: m };
    });
  };

  // No matching events at all — the consumer's filters emptied the set.
  const showEmpty = !!emptyState && Object.keys(events).length === 0;
  const isReferenceMonth = view.year === TODAY.year && view.month === TODAY.month;
  const eventsFor = (cell: Cell): MonthEvent[] =>
    isReferenceMonth && cell.inMonth ? events[cell.day] ?? [] : [];
  const isToday = (cell: Cell) => isReferenceMonth && cell.inMonth && cell.day === TODAY.day;

  return (
    <>
    <View style={styles.wrap}>
      {/* Month header (fixed — doesn't scroll with the grid) */}
      <View style={styles.header}>
        <Pressable onPress={() => step(-1)} hitSlop={8} accessibilityRole="button" accessibilityLabel="Previous month">
          <CaretLeft size={18} color={colors.textBody} weight="bold" />
        </Pressable>
        <Text style={styles.monthLabel}>
          {MONTHS[view.month]} '{String(view.year).slice(-2)}
        </Text>
        <Pressable onPress={() => step(1)} hitSlop={8} accessibilityRole="button" accessibilityLabel="Next month">
          <CaretRight size={18} color={colors.textBody} weight="bold" />
        </Pressable>
      </View>

      {showEmpty ? (
        <View style={styles.calendarEmpty}>{emptyState}</View>
      ) : (
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ width: CELL_WIDTH * 7 }}>
          {/* Weekday header row */}
          <View style={styles.weekdayRow}>
            {WEEKDAYS.map((d) => (
              <View key={d} style={styles.weekdayCell}>
                <Text style={styles.weekdayText}>{d}</Text>
              </View>
            ))}
          </View>

          {/* Day grid */}
          {weeks.map((week, wi) => (
            <View key={wi} style={styles.weekRow}>
              {week.map((cell, ci) => {
                const dayEvents = eventsFor(cell);
                const today = isToday(cell);
                const shown = dayEvents.slice(0, MAX_CHIPS);
                const overflow = dayEvents.length - shown.length;
                return (
                  <View
                    key={ci}
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

                    {shown.map((ev, i) => {
                      const c = accent[ev.color];
                      return (
                        <Pressable
                          key={i}
                          onPress={() => onEventPress?.(ev)}
                          disabled={!onEventPress}
                          style={[styles.chip, { backgroundColor: c.lightBg, borderLeftColor: c.solidBg }]}
                        >
                          <Text style={[styles.chipText, { color: c.solidBg }]} numberOfLines={1}>
                            {ev.label}
                          </Text>
                          {ev.done ? <CheckCircle size={13} color={DONE_GREEN} weight="regular" /> : null}
                        </Pressable>
                      );
                    })}

                    {overflow > 0 ? (
                      <Pressable
                        onPress={() => setSheetDay({ day: cell.day, events: dayEvents })}
                        accessibilityRole="button"
                        accessibilityLabel={`Show all ${dayEvents.length} on ${cell.day}`}
                      >
                        <Text style={styles.moreText}>+{overflow} more</Text>
                      </Pressable>
                    ) : null}
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>
      )}
    </View>

    {/* All events for a day, opened from "+N more" */}
    <BottomSheet
      visible={sheetDay !== null}
      onClose={() => setSheetDay(null)}
      title={sheetDay ? `${MONTHS[view.month]} ${sheetDay.day}` : undefined}
    >
      <View style={styles.sheetList}>
        {(sheetDay?.events ?? []).map((ev, i) => {
          const c = accent[ev.color];
          return (
            <Pressable
              key={i}
              onPress={() => {
                setSheetDay(null);
                onEventPress?.(ev);
              }}
              disabled={!onEventPress}
              style={[styles.sheetChip, { backgroundColor: c.lightBg, borderLeftColor: c.solidBg }]}
            >
              <Text style={[styles.sheetChipText, { color: c.solidBg }]} numberOfLines={1}>
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
    width: CELL_WIDTH,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: colors.borderSubtle,
  },
  weekdayText: { fontFamily: typography.fontFamily, fontSize: 12, lineHeight: 16, color: colors.textBody },

  weekRow: { flexDirection: 'row' },
  dayCell: {
    width: CELL_WIDTH,
    minHeight: 118,
    padding: spacing.xs,
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

  dayNumberRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  dayNumber: { fontFamily: typography.fontFamily, fontSize: 13, lineHeight: 18, color: colors.textBody },
  dayNumberMuted: { color: colors.textMuted },
  todayBadge: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 4,
    borderRadius: radius.sm,
    backgroundColor: colors.brandPressed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayNumber: { fontFamily: fontFamilyForWeight('400'), fontSize: 13, fontWeight: '400', color: colors.textOnBrand },

  // Event chip — pale category tint + a solid category left border.
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderLeftWidth: 3,
    borderRadius: 3,
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  chipText: { flex: 1, fontFamily: typography.fontFamily, fontSize: 11, lineHeight: 15 },
  moreText: { fontFamily: fontFamilyForWeight('500'), fontSize: 11, lineHeight: 15, fontWeight: '500', color: colors.brand, paddingHorizontal: 4 },

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
