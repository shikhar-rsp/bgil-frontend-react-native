import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Eye, FirstAidKit } from 'phosphor-react-native';
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
import { CLAIMS, CLAIM_BADGE, CLAIM_STATUSES, LOBS, inDateRange } from './toolkitData';

const FILTER_GROUPS: FilterGroup[] = [
  { key: 'lob', label: 'Policy Type', options: LOBS.map((l) => ({ value: l, label: l })) },
  { key: 'status', label: 'Status', options: CLAIM_STATUSES.map((s) => ({ value: s, label: s })) },
];

interface InitiateClaimSheetProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * Initiate Claim — the claims already in flight, and the entry point for a new
 * one. The web titles this drawer "Claim Status" even though its tile reads
 * "Initiate Claim"; the title is kept as-is here.
 *
 * Ported from the web's `sidedrawer-initiate-claim`.
 */
export const InitiateClaimSheet: React.FC<InitiateClaimSheetProps> = ({ visible, onClose }) => {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [start, setStart] = useState<Date | null>(null);
  const [end, setEnd] = useState<Date | null>(null);
  const [toast, setToast] = useState<{ title: string; message?: string } | null>(null);

  const statuses = filters.status ?? [];
  const lobs = filters.lob ?? [];

  const visibleClaims = useMemo(() => {
    const term = search.trim().toLowerCase();
    return CLAIMS.filter(
      (c) =>
        (!term ||
          c.policyNumber.toLowerCase().includes(term) ||
          c.holderName.toLowerCase().includes(term)) &&
        (statuses.length === 0 || statuses.includes(c.status)) &&
        (lobs.length === 0 || lobs.includes(c.type)) &&
        inDateRange(c.createdDate, start, end),
    );
  }, [search, statuses, lobs, start, end]);

  return (
    <ToolkitSheet
      visible={visible}
      onClose={onClose}
      title="Claim Status"
      icon={<FirstAidKit size={20} color={colors.brand} />}
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
      sectionTitle="Your Recent Claims"
      sectionHint="You can see your recent claims for the past 2 days. Select a specific time period to fetch results."
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
        label: 'Initiate Claim',
        onPress: () => setToast({ title: 'Initiate claim', message: 'This flow is coming soon.' }),
      }}
      secondaryAction={{
        label: 'View All Claim',
        onPress: () => setToast({ title: 'All claims', message: 'This flow is coming soon.' }),
      }}
    >
      {visibleClaims.length === 0 ? (
        <ToolkitEmptyState />
      ) : (
        visibleClaims.map((c) => (
          <ToolkitCard key={c.id}>
            <View style={styles.titleRow}>
              <Text style={styles.title} numberOfLines={1}>
                {c.policyNumber}
              </Text>
              <Badge label={c.status} variant="light" size="sm" color={CLAIM_BADGE[c.status]} />
            </View>

            <ToolkitMeta label="Policy Type:" value={c.type} />
            <ToolkitMeta label="Claim ID:" value={String(c.claimId)} />
            <ToolkitMeta label="Holder:" value={c.holderName} />
            {/* The web prints the raw number; a currency reads better and
                matches how every other amount in the app is shown. */}
            <ToolkitMeta label="Amount:" value={`₹ ${c.amount.toLocaleString('en-IN')}`} />

            <View style={styles.actions}>
              <Pressable
                style={styles.actionBtn}
                hitSlop={4}
                accessibilityRole="button"
                accessibilityLabel={`View claim details for ${c.claimId}`}
                onPress={() =>
                  setToast({ title: 'Opening claim', message: `Claim ID: ${c.claimId}` })
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
