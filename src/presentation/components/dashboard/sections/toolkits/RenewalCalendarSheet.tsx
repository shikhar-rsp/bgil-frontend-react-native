import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { CalendarCheck, DownloadSimple, Eye } from 'phosphor-react-native';
import {
  Badge,
  Toast,
  colors,
  fontFamilyForWeight,
  radius,
  spacing,
  type FilterGroup,
} from '@atlas-ds/react-native';
import { ToolkitCard, ToolkitEmptyState, ToolkitMeta, ToolkitSheet } from './ToolkitSheet';
import {
  LOBS,
  RENEWAL_BADGE,
  RENEWAL_ENTRIES,
  RENEWAL_QUICK_FILTERS,
  formatExpiringIn,
  inDateRange,
  quickFilterMaxDays,
} from './toolkitData';

const FILTER_GROUPS: FilterGroup[] = [
  { key: 'lob', label: 'LOB Type', options: LOBS.map((l) => ({ value: l, label: l })) },
  {
    key: 'status',
    label: 'Status',
    options: [
      { value: 'Active', label: 'Active' },
      { value: 'In Progress', label: 'In Progress' },
      { value: 'Expired', label: 'Expired' },
    ],
  },
];

interface RenewalCalendarSheetProps {
  visible: boolean;
  onClose: () => void;
  /** Opens the Business tab's Renewals list. */
  onViewAllRenewals?: () => void;
}

/** Renewal Calendar — policies coming up for renewal, banded by expiry. */
export const RenewalCalendarSheet: React.FC<RenewalCalendarSheetProps> = ({
  visible,
  onClose,
  onViewAllRenewals,
}) => {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [start, setStart] = useState<Date | null>(null);
  const [end, setEnd] = useState<Date | null>(null);
  const [quickFilter, setQuickFilter] = useState('Today');
  const [toast, setToast] = useState<string | null>(null);

  const statuses = filters.status ?? [];
  const lobs = filters.lob ?? [];

  const renewals = useMemo(() => {
    const term = search.trim().toLowerCase();
    const hasRange = !!(start && end);
    return RENEWAL_ENTRIES.filter((r) => {
      if (term && !r.policyNumber.toLowerCase().includes(term)) {
        return false;
      }
      if (statuses.length > 0 && !statuses.includes(r.status)) {
        return false;
      }
      if (lobs.length > 0 && !lobs.includes(r.type)) {
        return false;
      }
      // A picked range wins over the quick bands, as on the web.
      if (hasRange) {
        return inDateRange(r.createdDate, start, end);
      }
      if (quickFilter) {
        return r.expiringInDays <= quickFilterMaxDays(quickFilter);
      }
      return true;
    });
  }, [search, statuses, lobs, start, end, quickFilter]);

  const chips = (
    <View style={styles.chips}>
      {RENEWAL_QUICK_FILTERS.map((filter) => {
        const active = quickFilter === filter;
        return (
          <Pressable
            key={filter}
            onPress={() => {
              setQuickFilter((prev) => (prev === filter ? '' : filter));
              // Quick bands and a hand-picked range are alternatives, not a pair.
              setStart(null);
              setEnd(null);
            }}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
          >
            <Badge
              label={filter}
              size="lg"
              variant={active ? 'solid' : 'light'}
              color={active ? 'brand' : 'neutral'}
            />
          </Pressable>
        );
      })}
    </View>
  );

  return (
    <ToolkitSheet
      visible={visible}
      onClose={onClose}
      title="Renewal Calendar"
      icon={<CalendarCheck size={20} color={colors.brand} />}
      search={search}
      onSearchChange={setSearch}
      filterGroups={FILTER_GROUPS}
      filterValues={filters}
      onFilterChange={setFilters}
      rangeStart={start}
      rangeEnd={end}
      onDateRangeChange={(s, e) => {
        setStart(s);
        setEnd(e);
        if (s && e) {
          setQuickFilter('');
        }
      }}
      sectionTitle="Your Recent Renewals"
      sectionHint="You can see your recent renewals for the past 2 days. Select a specific time period to fetch results."
      toolbarExtra={chips}
      banner={
        toast ? <Toast variant="success" title={toast} onClose={() => setToast(null)} /> : null
      }
      primaryAction={{
        label: 'View All Renewals',
        onPress: () => {
          onViewAllRenewals?.();
          onClose();
        },
      }}
    >
      {renewals.length === 0 ? (
        <ToolkitEmptyState />
      ) : (
        renewals.map((r) => (
          <ToolkitCard key={r.id}>
            <View style={styles.titleRow}>
              <Text style={styles.title} numberOfLines={1}>
                {r.policyNumber}
              </Text>
              <Badge label={r.status} variant="light" size="sm" color={RENEWAL_BADGE[r.status]} />
            </View>

            <ToolkitMeta label="Policy Type:" value={r.type} />
            <ToolkitMeta label="Customer:" value={r.customerName} />
            <ToolkitMeta
              label="Expiring in:"
              value={formatExpiringIn(r.expiringInDays)}
              valueColor="#B45309"
            />

            <View style={styles.actions}>
              <Pressable
                style={styles.actionBtn}
                hitSlop={4}
                accessibilityRole="button"
                accessibilityLabel={`View policy ${r.policyNumber}`}
                onPress={() => {
                  onViewAllRenewals?.();
                  onClose();
                }}
              >
                <Eye size={16} color={colors.textBody} />
              </Pressable>
              <Pressable
                style={styles.actionBtn}
                hitSlop={4}
                accessibilityRole="button"
                accessibilityLabel={`Download renewal proposal for ${r.policyNumber}`}
                onPress={() => setToast(`Renewal proposal for ${r.policyNumber} downloaded`)}
              >
                <DownloadSimple size={16} color={colors.textBody} />
              </Pressable>
            </View>
          </ToolkitCard>
        ))
      )}
    </ToolkitSheet>
  );
};

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: {
    flexShrink: 1,
    fontFamily: fontFamilyForWeight('500'),
    fontSize: 14,
    fontWeight: '500',
    color: colors.textHeading,
  },
  actions: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
    padding: 2,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
  },
  actionBtn: { padding: spacing.xs, borderRadius: radius.md },
});
