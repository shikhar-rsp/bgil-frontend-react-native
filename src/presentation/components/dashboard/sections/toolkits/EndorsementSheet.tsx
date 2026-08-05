import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Eye, NotePencil } from 'phosphor-react-native';
import {
  Toast,
  colors,
  fontFamilyForWeight,
  radius,
  spacing,
  type FilterGroup,
} from '@atlas-ds/react-native';
import { ToolkitCard, ToolkitEmptyState, ToolkitMeta, ToolkitSheet } from './ToolkitSheet';
import { ENDORSEMENTS, LOBS, formatDashDate, inDateRange } from './toolkitData';

const FILTER_GROUPS: FilterGroup[] = [
  { key: 'type', label: 'LOB Type', options: LOBS.map((l) => ({ value: l, label: l })) },
];

interface EndorsementSheetProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * Initiate Endorsement — recent endorsements, each openable for detail.
 *
 * Ported from the web's `sidedrawer-endorsement`. Its action strip only appears
 * on hover; a phone has none, so the actions sit inline under the meta lines.
 */
export const EndorsementSheet: React.FC<EndorsementSheetProps> = ({ visible, onClose }) => {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [start, setStart] = useState<Date | null>(null);
  const [end, setEnd] = useState<Date | null>(null);
  const [toast, setToast] = useState<{ title: string; message?: string } | null>(null);

  const types = filters.type ?? [];

  const visibleRecords = useMemo(() => {
    const term = search.trim().toLowerCase();
    return ENDORSEMENTS.filter(
      (e) =>
        (!term || e.holderName.toLowerCase().includes(term)) &&
        (types.length === 0 || types.includes(e.type)) &&
        inDateRange(e.createdDate, start, end),
    );
  }, [search, types, start, end]);

  return (
    <ToolkitSheet
      visible={visible}
      onClose={onClose}
      title="Endorsement"
      icon={<NotePencil size={20} color={colors.brand} />}
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
      sectionTitle="Your Recent Endorsement"
      sectionHint="You can see your recent endorsements for the past 2 days. Select a specific time period to fetch results."
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
        label: 'View All Endorsement',
        onPress: () => setToast({ title: 'All endorsements', message: 'This flow is coming soon.' }),
      }}
      secondaryAction={{
        label: 'Initiate Endorsement',
        onPress: () =>
          setToast({ title: 'Initiate endorsement', message: 'This flow is coming soon.' }),
      }}
    >
      {visibleRecords.length === 0 ? (
        <ToolkitEmptyState />
      ) : (
        visibleRecords.map((e) => (
          <ToolkitCard key={e.id}>
            <View style={styles.titleRow}>
              <Text style={styles.title} numberOfLines={1}>
                {e.holderName}
              </Text>
            </View>

            <ToolkitMeta label="Policy Type:" value={e.type} />
            <ToolkitMeta label="Policy No.:" value={e.policyNumber} />
            <ToolkitMeta label="Issued On:" value={formatDashDate(e.createdDate)} />

            <View style={styles.actions}>
              <Pressable
                style={styles.actionBtn}
                hitSlop={4}
                accessibilityRole="button"
                accessibilityLabel={`View endorsement details for ${e.policyNumber}`}
                onPress={() =>
                  setToast({ title: 'Opening endorsement', message: `Policy No.: ${e.policyNumber}` })
                }
              >
                <Eye size={16} color={colors.textBody} />
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
