import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  FlatList,
  ViewToken,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { CalendarPanel } from './CalendarPanel';
import { CalendarMonthYearPicker } from './CalendarMonthYearPicker';
import { addMonths, monthKey } from './utils';
import { colors, radius, spacing, typography } from '../../theme';

export type CalendarMode = 'single' | 'range';
export type CalendarView = 'days' | 'month' | 'year';

export interface CalendarProps {
  mode?: CalendarMode;
  /** Selected date in `mode="single"`. */
  selectedDate?: Date | null;
  onDateSelect?: (date: Date) => void;
  /** Range start in `mode="range"`. */
  startDate?: Date | null;
  /** Range end in `mode="range"`. */
  endDate?: Date | null;
  onRangeSelect?: (start: Date | null, end: Date | null) => void;
  /** Range mode: tapped Apply. */
  onApply?: () => void;
  /** Range mode: tapped Cancel. */
  onCancel?: () => void;
  /**
   * How many months to pre-render in each direction. Larger = more years
   * reachable (the year picker is capped to this range) but more memory.
   * Default 240 (= 20 years of headroom each way).
   */
  monthWindow?: number;
  style?: object;
}

/**
 * Calendar — mobile (React Native) edition.
 *
 * Notable differences from the web component:
 *  • Single panel only (mobile doesn't have room for a side-by-side dual view).
 *  • The date grid scrolls vertically (FlatList of month-pages). When a new
 *    month "lands" in the viewport, the header label updates automatically.
 *  • Tapping the month name in the header opens the month picker; tapping the
 *    year opens the year picker (mirrors the web behaviour).
 *  • Range-select gestures and Apply/Cancel footer are preserved.
 */
export const Calendar: React.FC<CalendarProps> = ({
  mode = 'single',
  selectedDate,
  onDateSelect,
  startDate,
  endDate,
  onRangeSelect,
  onApply,
  onCancel,
  monthWindow = 240,
  style,
}) => {
  // We anchor the FlatList around a "central" month and let the user scroll up
  // (into the past) and down (into the future). Anchor is whichever of
  // startDate / selectedDate / today is most relevant.
  const anchorMonth = useMemo(() => {
    const seed = startDate ?? selectedDate ?? new Date();
    return new Date(seed.getFullYear(), seed.getMonth(), 1);
  }, []); // intentionally only on first mount — scrolling owns subsequent state

  const months = useMemo(
    () =>
      Array.from({ length: monthWindow * 2 + 1 }, (_, i) =>
        addMonths(anchorMonth, i - monthWindow)
      ),
    [anchorMonth, monthWindow]
  );
  const initialIndex = monthWindow; // anchor sits at the center
  // Last year reachable in the scroll window — the year picker is capped to
  // this so a selected year always has a month page to scroll to.
  const maxNavigableYear = months[months.length - 1].getFullYear();

  const [headerDate, setHeaderDate] = useState<Date>(anchorMonth);
  const [view, setView] = useState<CalendarView>('days');
  const listRef = useRef<FlatList<Date>>(null);

  // ---- header navigation (chevrons) ----------------------------------------
  const scrollToMonth = useCallback((target: Date) => {
    const idx = months.findIndex((m) => monthKey(m) === monthKey(target));
    if (idx < 0) return;
    listRef.current?.scrollToIndex({ index: idx, animated: true });
    setHeaderDate(target);
  }, [months]);

  const stepMonth = useCallback((delta: number) => {
    scrollToMonth(addMonths(headerDate, delta));
  }, [headerDate, scrollToMonth]);

  const stepYear = useCallback((delta: number) => {
    const next = new Date(headerDate);
    next.setFullYear(next.getFullYear() + delta);
    scrollToMonth(next);
  }, [headerDate, scrollToMonth]);

  // ---- date selection -------------------------------------------------------
  const handleDateClick = (date: Date) => {
    if (mode === 'single') {
      onDateSelect?.(date);
      return;
    }
    // Range mode: same state machine as the web component.
    if (!startDate || (startDate && endDate)) {
      onRangeSelect?.(date, null);
    } else if (startDate && !endDate) {
      if (date < startDate) onRangeSelect?.(date, startDate);
      else onRangeSelect?.(startDate, date);
    }
  };

  // ---- scroll → update header ----------------------------------------------
  // We could rely on onViewableItemsChanged, but it fires late on iOS. Pairing
  // it with a momentum-end fallback keeps the header in lockstep with the grid.
  const onViewable = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    const first = viewableItems[0];
    if (first?.item) setHeaderDate(first.item as Date);
  }).current;
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    const idx = Math.round(y / MONTH_PAGE_HEIGHT);
    const m = months[idx];
    if (m) setHeaderDate(m);
  };

  // FlatList needs a fixed item layout to support scrollToIndex efficiently.
  const getItemLayout = (_: any, index: number) => ({
    length: MONTH_PAGE_HEIGHT,
    offset: MONTH_PAGE_HEIGHT * index,
    index,
  });

  // Each scrolling panel renders its own "Month YYYY" label per Figma —
  // there is no longer a fixed chevron header at the top of the Calendar.
  // Tapping a panel's month/year label opens the corresponding picker.
  const openMonthPicker = (date: Date) => { setHeaderDate(date); setView('month'); };
  const openYearPicker  = (date: Date) => { setHeaderDate(date); setView('year'); };

  // ---- views ----------------------------------------------------------------
  return (
    <View style={[styles.container, style]}>
      {view === 'days' && (
        <FlatList
          ref={listRef}
          data={months}
          keyExtractor={(m) => String(monthKey(m))}
          initialScrollIndex={initialIndex}
          getItemLayout={getItemLayout}
          showsVerticalScrollIndicator={false}
          // Smooth continuous scroll: no snapToInterval here. Each month flows
          // into the next so the user can see e.g. "March 2026" finishing then
          // "April 2026" starting, matching the Figma scroll behaviour.
          onViewableItemsChanged={onViewable}
          viewabilityConfig={viewabilityConfig}
          onMomentumScrollEnd={onMomentumEnd}
          style={styles.list}
          contentContainerStyle={{ paddingBottom: spacing.sm }}
          renderItem={({ item }) => (
            <View style={{ height: MONTH_PAGE_HEIGHT }}>
              <CalendarPanel
                currentDate={item}
                selectedDate={selectedDate}
                startDate={startDate}
                endDate={endDate}
                onDateClick={handleDateClick}
                mode={mode}
                showMonthLabel
                onMonthPress={openMonthPicker}
                onYearPress={openYearPicker}
              />
            </View>
          )}
        />
      )}

      {(view === 'month' || view === 'year') && (
        <CalendarMonthYearPicker
          type={view}
          currentDate={headerDate}
          maxYear={maxNavigableYear}
          onHeaderPress={() => setView(view === 'month' ? 'year' : 'month')}
          onSelect={(value) => {
            const next = new Date(headerDate);
            if (view === 'month') {
              next.setMonth(value);
              scrollToMonth(next);
              setView('days');
            } else {
              next.setFullYear(value);
              setHeaderDate(next);
              setView('month'); // year picker → back to month picker (Figma flow)
            }
          }}
        />
      )}

      {/*
        Submit / Reset (or Apply / Cancel) action buttons are owned by the
        host BottomSheet now — see CalendarPage docs example. Keeping the
        Calendar purely focused on date selection lets a consumer plug it
        into any container (sheet, screen, modal) without an opinionated
        footer baked in.
      */}
    </View>
  );
};

/**
 * Height of one month inside the FlatList. Sum:
 *   header text (24) + header top padding (8) + body gap (12)
 * + weekday row (32) + body gap (12)
 * + 6 date rows (6×32) + 5 row gaps (5×12)
 * + body bottom padding (8)
 * = 348
 */
const MONTH_PAGE_HEIGHT =
  24 /* "Month YYYY" line-height */ +
  spacing.sm /* header top padding */ +
  spacing.md /* gap between header and weekday row */ +
  32 /* weekday row */ +
  spacing.md /* gap between weekday and date grid */ +
  6 * 32 /* date rows */ +
  5 * spacing.md /* row gaps */ +
  spacing.sm /* bottom padding */;

const styles = StyleSheet.create({
  container: {
    // Mobile spec: white surface, 8px radius, no border, no shadow.
    // Width stretches to fill whatever wrapper hosts it (Bottom Sheet, screen, etc.)
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    alignSelf: 'stretch',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  navGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  // Body1 / Medium per Figma mobile spec — 16/24, weight 500.
  titleText: {
    fontFamily: typography.fontFamily,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    color: colors.textHeading,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
  },
  titleTextActive: {
    color: colors.brand,
  },
  list: {
    height: MONTH_PAGE_HEIGHT,
  },
  footer: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceMuted,
  },
  footerBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
  },
  footerBtnSecondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  footerBtnSecondaryText: {
    ...typography.body3,
    fontFamily: typography.fontFamily,
    color: colors.textBody,
  },
  footerBtnPrimary: {
    backgroundColor: colors.brand,
  },
  footerBtnPrimaryText: {
    ...typography.body3,
    fontFamily: typography.fontFamily,
    color: colors.textOnBrand,
    fontWeight: '500',
  },
});
