import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { CalendarBlank, Info, WarningCircle, X } from 'phosphor-react-native';
import {
  BottomSheet,
  Calendar,
  Filter,
  FilterButton,
  SearchBar,
  Tooltip,
  colors,
  fontFamilyForWeight,
  radius,
  spacing,
  typography,
  type BottomSheetAction,
  type BottomSheetPage,
  type FilterGroup,
} from '@atlas-ds/react-native';
import { formatShortDate } from './toolkitData';

/**
 * The shell every Your-Toolkit tool sheet is built on.
 *
 * The web opens each tool in a right-hand `Sidedrawer` with the search box,
 * a calendar popover and a filter dropdown floating over it. A phone has no
 * room for popovers over a sheet, and stacking a second modal on top of the
 * sheet's own modal is fragile — so the filter and the date range become
 * *steps of the same sheet* (`BottomSheet` `pages`), reached from the toolbar
 * and dismissed with the sheet's back arrow.
 *
 * A tool supplies its list as `children` and keeps ownership of its own data;
 * this component owns only the chrome and the step routing.
 */

export interface ToolkitSheetProps {
  visible: boolean;
  onClose: () => void;
  /** Sheet heading — the tool's name. */
  title: string;
  /** Featured icon above the heading. */
  icon?: React.ReactNode;

  /** Search box. Omit `onSearchChange` to drop the search row entirely. */
  search?: string;
  onSearchChange?: (value: string) => void;

  /** Filter groups. Omit to drop the Filter button. */
  filterGroups?: FilterGroup[];
  filterValues?: Record<string, string[]>;
  onFilterChange?: (next: Record<string, string[]>) => void;

  /** Created-on range filter. Omit `onDateRangeChange` to drop the field. */
  rangeStart?: Date | null;
  rangeEnd?: Date | null;
  onDateRangeChange?: (start: Date | null, end: Date | null) => void;

  /**
   * Block between the toolbar and the section heading — a summary card the
   * list is *about* (e.g. the float balance above its transactions), as opposed
   * to `toolbarExtra`, which sits under the heading and belongs to the list.
   */
  headerExtra?: React.ReactNode;
  /** Heading above the list, e.g. "Your Recent Queries". */
  sectionTitle?: string;
  /** Long-press copy for the ⓘ beside `sectionTitle`. */
  sectionHint?: string;
  /** Extra row between the section heading and the list (e.g. quick filters). */
  toolbarExtra?: React.ReactNode;
  /** Banner pinned above the list — used for the sheets' inline toasts. */
  banner?: React.ReactNode;

  primaryAction?: BottomSheetAction;
  secondaryAction?: BottomSheetAction;

  /**
   * A pushed detail step (Campaigns opens one per card). While set it replaces
   * the list, and the sheet's back arrow calls `onDetailBack`.
   */
  detail?: React.ReactNode;
  /** Heading for the detail step — the list keeps `title`. */
  detailTitle?: string;
  onDetailBack?: () => void;
  /**
   * Footer actions while the detail step is showing. Without these the step
   * renders footer-less, which is right for a read-only detail but not for one
   * that ends in a decision (e.g. resending a payment link).
   */
  detailPrimaryAction?: BottomSheetAction;
  detailSecondaryAction?: BottomSheetAction;

  /** The list itself. */
  children?: React.ReactNode;
}

/** Step order — the sheet animates forward/back by index. */
const PAGE = { list: 0, filter: 1, dates: 2, detail: 3 };

export const ToolkitSheet: React.FC<ToolkitSheetProps> = ({
  visible,
  onClose,
  title,
  icon,
  search,
  onSearchChange,
  filterGroups,
  filterValues,
  onFilterChange,
  rangeStart = null,
  rangeEnd = null,
  onDateRangeChange,
  headerExtra,
  sectionTitle,
  sectionHint,
  toolbarExtra,
  banner,
  primaryAction,
  secondaryAction,
  detail,
  detailTitle,
  onDetailBack,
  detailPrimaryAction,
  detailSecondaryAction,
  children,
}) => {
  const [step, setStep] = useState<'list' | 'filter' | 'dates'>('list');
  // Range being drawn on the calendar step — only committed on Apply, so
  // backing out leaves the applied range untouched.
  const [draftStart, setDraftStart] = useState<Date | null>(rangeStart);
  const [draftEnd, setDraftEnd] = useState<Date | null>(rangeEnd);

  // Re-opening a tool should land on its list, not wherever it was left.
  useEffect(() => {
    if (!visible) {
      setStep('list');
    }
  }, [visible]);

  // Retains the detail step's content for the length of its exit animation.
  const heldDetail = useRef<React.ReactNode>(null);
  if (detail) {
    heldDetail.current = detail;
  }

  const appliedCount = Object.values(filterValues ?? {}).reduce((n, v) => n + v.length, 0);
  const hasRange = !!(rangeStart && rangeEnd);

  const openDates = () => {
    setDraftStart(rangeStart);
    setDraftEnd(rangeEnd);
    setStep('dates');
  };

  const listContent = (
    <View style={styles.page}>
      {banner ? <View style={styles.banner}>{banner}</View> : null}

      {onSearchChange || onDateRangeChange || filterGroups ? (
        <View style={styles.toolbar}>
          {onSearchChange ? (
            <View style={styles.searchRow}>
              <View style={styles.searchFlex}>
                <SearchBar
                  value={search}
                  onChangeText={onSearchChange}
                  placeholder="Search"
                  onClear={() => onSearchChange('')}
                />
              </View>
              {filterGroups ? (
                <FilterButton onPress={() => setStep('filter')} count={appliedCount || undefined} />
              ) : null}
            </View>
          ) : null}

          {onDateRangeChange ? (
            <View style={styles.dateRow}>
              <Pressable
                style={styles.dateField}
                onPress={openDates}
                accessibilityRole="button"
                accessibilityLabel="Select date range"
              >
                <CalendarBlank size={20} color={colors.textMuted} />
                <Text style={hasRange ? styles.dateValue : styles.datePlaceholder} numberOfLines={1}>
                  {hasRange && rangeStart && rangeEnd
                    ? `${formatShortDate(rangeStart)} – ${formatShortDate(rangeEnd)}`
                    : 'From – To'}
                </Text>
              </Pressable>
              {hasRange ? (
                <Pressable
                  style={styles.dateClear}
                  onPress={() => onDateRangeChange(null, null)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="Clear date range"
                >
                  <X size={16} color={colors.textBody} />
                </Pressable>
              ) : null}
            </View>
          ) : null}
        </View>
      ) : null}

      {headerExtra}

      {sectionTitle ? (
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>{sectionTitle}</Text>
          {sectionHint ? (
            <Tooltip content={sectionHint} theme="dark" placement="bottom">
              <Info size={16} color={colors.textMuted} />
            </Tooltip>
          ) : null}
        </View>
      ) : null}

      {toolbarExtra}

      <View style={styles.list}>{children}</View>
    </View>
  );

  const pages: BottomSheetPage[] = [
    {
      key: 'list',
      icon,
      title,
      content: listContent,
      contentMinHeight: 420,
      primaryAction,
      secondaryAction,
    },
    {
      key: 'filter',
      title: 'Filter',
      subtitle: 'Narrow down the list',
      content:
        filterGroups && filterValues && onFilterChange ? (
          <Filter groups={filterGroups} values={filterValues} onChange={onFilterChange} />
        ) : null,
      contentMinHeight: 0,
      primaryAction: { label: 'Apply', onPress: () => setStep('list') },
      secondaryAction: { label: 'Clear all', onPress: () => onFilterChange?.({}) },
    },
    {
      key: 'dates',
      title: 'Select date range',
      content: (
        <Calendar
          mode="range"
          startDate={draftStart}
          endDate={draftEnd}
          onRangeSelect={(start, end) => {
            setDraftStart(start);
            setDraftEnd(end);
          }}
          onApply={() => {
            onDateRangeChange?.(draftStart, draftEnd);
            setStep('list');
          }}
          onCancel={() => {
            // Matches the web's Cancel: it drops the range rather than
            // restoring the previous one.
            onDateRangeChange?.(null, null);
            setStep('list');
          }}
        />
      ),
      contentMinHeight: 0,
    },
    {
      key: 'detail',
      title: detailTitle,
      // The step animates out *after* the consumer clears `detail`, so the last
      // one rendered is held back to fill that frame — otherwise the outgoing
      // step slides away empty.
      content: detail ?? heldDetail.current,
      contentMinHeight: 420,
      primaryAction: detailPrimaryAction,
      secondaryAction: detailSecondaryAction,
    },
  ];

  const pageIndex =
    step === 'filter'
      ? PAGE.filter
      : step === 'dates'
        ? PAGE.dates
        : detail
          ? PAGE.detail
          : PAGE.list;

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      pages={pages}
      pageIndex={pageIndex}
      onBack={() => {
        if (step !== 'list') {
          setStep('list');
        } else {
          onDetailBack?.();
        }
      }}
    />
  );
};

/**
 * The web's `toolkits/components/EmptyState` — an amber halo, a heading and a
 * line of guidance. Shown by every tool sheet when its filters match nothing.
 */
export const ToolkitEmptyState: React.FC<{ title?: string; description?: string }> = ({
  title = 'No results found',
  description = 'Try a different search term, or clear the filters and date range.',
}) => (
  <View style={styles.emptyWrap}>
    <View style={styles.emptyOuter}>
      <View style={styles.emptyInner}>
        <WarningCircle size={20} color="#D97706" />
      </View>
    </View>
    <Text style={styles.emptyTitle}>{title}</Text>
    <Text style={styles.emptyText}>{description}</Text>
  </View>
);

/**
 * A list row inside a tool sheet — the RN stand-in for the web's `<Card>` with
 * its hover-revealed action strip. Actions sit inline instead, since a phone
 * has no hover to reveal them.
 */
export const ToolkitCard: React.FC<{ onPress?: () => void; children: React.ReactNode }> = ({
  onPress,
  children,
}) =>
  onPress ? (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
      accessibilityRole="button"
    >
      {children}
    </Pressable>
  ) : (
    <View style={styles.card}>{children}</View>
  );

/** "Label: value" pair used across the query / slip / renewal rows. */
export const ToolkitMeta: React.FC<{ label: string; value: string; valueColor?: string }> = ({
  label,
  value,
  valueColor,
}) => (
  <View style={styles.metaRow}>
    <Text style={styles.metaLabel}>{label} </Text>
    <Text style={[styles.metaValue, valueColor ? { color: valueColor } : null]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  page: { gap: spacing.md },
  banner: { paddingBottom: spacing.xs },
  toolbar: { gap: spacing.sm },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  searchFlex: { flex: 1 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  // Mirrors the SearchBar's field treatment so the two rows read as one control.
  dateField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  datePlaceholder: { flex: 1, fontFamily: typography.fontFamily, fontSize: 14, color: colors.textMuted },
  dateValue: { flex: 1, fontFamily: typography.fontFamily, fontSize: 14, color: colors.textHeading },
  dateClear: {
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
  },
  sectionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  sectionTitle: {
    fontFamily: fontFamilyForWeight('500'),
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '500',
    color: colors.textBody,
  },
  list: { gap: spacing.md, paddingBottom: spacing.sm },

  // --- card -----------------------------------------------------------------
  card: {
    gap: spacing.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  cardPressed: { backgroundColor: colors.surfaceSubtle },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  metaLabel: { fontFamily: typography.fontFamily, fontSize: 12, color: colors.textMuted },
  metaValue: { fontFamily: typography.fontFamily, fontSize: 12, color: colors.textHeading },

  // --- empty state ----------------------------------------------------------
  emptyWrap: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xxl },
  emptyOuter: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFBEB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { fontFamily: typography.fontFamily, fontSize: 16, color: colors.textHeading },
  emptyText: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    color: colors.textBody,
    textAlign: 'center',
    maxWidth: 280,
  },
});
