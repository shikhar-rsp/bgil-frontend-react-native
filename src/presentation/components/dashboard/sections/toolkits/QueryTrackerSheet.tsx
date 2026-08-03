import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { ArrowClockwise, Eye, Question } from 'phosphor-react-native';
import {
  Badge,
  Toast,
  colors,
  fontFamilyForWeight,
  radius,
  spacing,
  typography,
  type FilterGroup,
} from '@atlas-ds/react-native';
import { ToolkitCard, ToolkitEmptyState, ToolkitMeta, ToolkitSheet } from './ToolkitSheet';
import {
  LOBS,
  QUERIES,
  QUERY_BADGE,
  QUERY_STATUSES,
  formatLongDate,
  inDateRange,
  type TrackedQuery,
} from './toolkitData';

const FILTER_GROUPS: FilterGroup[] = [
  { key: 'lob', label: 'LOB Type', options: LOBS.map((l) => ({ value: l, label: l })) },
  {
    key: 'status',
    label: 'Status',
    options: QUERY_STATUSES.map((s) => ({ value: s, label: s })),
  },
];

interface QueryTrackerSheetProps {
  visible: boolean;
  onClose: () => void;
}

/** Query Tracker — recent queries, each viewable or re-openable. */
export const QueryTrackerSheet: React.FC<QueryTrackerSheetProps> = ({ visible, onClose }) => {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [start, setStart] = useState<Date | null>(null);
  const [end, setEnd] = useState<Date | null>(null);
  const [toast, setToast] = useState<{ title: string; message?: string } | null>(null);
  // Re-opening flips a row's status, so the list is stateful here.
  const [queries, setQueries] = useState<TrackedQuery[]>(QUERIES);

  const statuses = filters.status ?? [];
  const lobs = filters.lob ?? [];

  const visibleQueries = useMemo(() => {
    const term = search.trim().toLowerCase();
    return queries.filter(
      (q) =>
        (!term || q.title.toLowerCase().includes(term)) &&
        (statuses.length === 0 || statuses.includes(q.status)) &&
        (lobs.length === 0 || lobs.includes(q.lob)) &&
        inDateRange(q.createdDate, start, end),
    );
  }, [queries, search, statuses, lobs, start, end]);

  const reopen = (q: TrackedQuery) => {
    setQueries((prev) => prev.map((x) => (x.id === q.id ? { ...x, status: 'Reopened' } : x)));
    setToast({ title: 'Query reopened', message: `Query ID: ${q.id} is reopened.` });
  };

  return (
    <ToolkitSheet
      visible={visible}
      onClose={onClose}
      title="Query Tracker"
      icon={<Question size={20} color={colors.brand} />}
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
      }}
      sectionTitle="Your Recent Queries"
      sectionHint="You can see your recent queries for the past 2 days. Select a specific time period to fetch results."
      banner={
        toast ? (
          <Toast
            variant="success"
            title={toast.title}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        ) : null
      }
      primaryAction={{
        label: 'Raise a Query',
        onPress: () => setToast({ title: 'Raise a query', message: 'This flow is coming soon.' }),
      }}
    >
      {visibleQueries.length === 0 ? (
        <ToolkitEmptyState />
      ) : (
        visibleQueries.map((q) => (
          <ToolkitCard key={q.id}>
            <View style={styles.titleRow}>
              <Text style={styles.title} numberOfLines={1}>
                {q.title}
              </Text>
              <Badge label={q.status} variant="light" size="sm" color={QUERY_BADGE[q.status]} />
            </View>

            <ToolkitMeta label="ID:" value={String(q.id)} />
            <ToolkitMeta label="Created on:" value={formatLongDate(q.createdDate)} />

            <View style={styles.actions}>
              <Pressable
                style={styles.actionBtn}
                hitSlop={4}
                accessibilityRole="button"
                accessibilityLabel={`View query ${q.id}`}
                onPress={() => setToast({ title: 'Opening query', message: `Query ID: ${q.id}` })}
              >
                <Eye size={16} color={colors.textBody} />
              </Pressable>
              <Pressable
                style={styles.actionBtn}
                hitSlop={4}
                accessibilityRole="button"
                accessibilityLabel={`Reopen query ${q.id}`}
                onPress={() => reopen(q)}
              >
                <ArrowClockwise size={16} color={colors.textBody} />
              </Pressable>
            </View>
          </ToolkitCard>
        ))
      )}
    </ToolkitSheet>
  );
};

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: {
    flexShrink: 1,
    fontFamily: fontFamilyForWeight('500'),
    fontSize: 15,
    fontWeight: '500',
    color: colors.textHeading,
  },
  // Web reveals these on hover in the card's top-right; on a phone they sit
  // under the meta lines where a thumb can reach them.
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
