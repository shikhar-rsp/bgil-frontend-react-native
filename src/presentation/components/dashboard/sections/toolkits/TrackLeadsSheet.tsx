import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Eye, ShareFat, Target, UserCircle } from 'phosphor-react-native';
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
  LEAD_BADGE,
  LEAD_STATUSES,
  LEAD_TEMPERATURES,
  LEAD_TEMPERATURE_BADGE,
  LEAD_TEMPERATURE_LABEL,
  LOBS,
  TRACKED_LEADS,
  formatDashMonthDate,
  inDateRange,
} from './toolkitData';

const FILTER_GROUPS: FilterGroup[] = [
  { key: 'lob', label: 'Policy Type', options: LOBS.map((l) => ({ value: l, label: l })) },
  {
    key: 'leadType',
    label: 'Lead Type',
    options: LEAD_TEMPERATURES.map((t) => ({ value: t, label: LEAD_TEMPERATURE_LABEL[t] })),
  },
  { key: 'status', label: 'Status', options: LEAD_STATUSES.map((s) => ({ value: s, label: s })) },
];

interface TrackLeadsSheetProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * Track Leads — leads in flight, with where each one has reached.
 *
 * Ported from the web's `sidedrawer-trackLeads`. The Forward action keeps the
 * web's rule of only appearing once a quote has actually been shared.
 */
export const TrackLeadsSheet: React.FC<TrackLeadsSheetProps> = ({ visible, onClose }) => {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [start, setStart] = useState<Date | null>(null);
  const [end, setEnd] = useState<Date | null>(null);
  const [toast, setToast] = useState<{ title: string; message?: string } | null>(null);

  const statuses = filters.status ?? [];
  const lobs = filters.lob ?? [];
  const leadTypes = filters.leadType ?? [];

  const visibleLeads = useMemo(() => {
    const term = search.trim().toLowerCase();
    return TRACKED_LEADS.filter(
      (l) =>
        (!term || l.holderName.toLowerCase().includes(term)) &&
        (statuses.length === 0 || statuses.includes(l.status)) &&
        (lobs.length === 0 || lobs.includes(l.type)) &&
        (leadTypes.length === 0 || leadTypes.includes(l.leadType)) &&
        inDateRange(l.createdDate, start, end),
    );
  }, [search, statuses, lobs, leadTypes, start, end]);

  return (
    <ToolkitSheet
      visible={visible}
      onClose={onClose}
      title="Track Leads"
      icon={<Target size={20} color={colors.brand} />}
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
      sectionTitle="Your Recent Track Leads"
      sectionHint="You can see your recent leads for the past 2 days. Select a specific time period to fetch results."
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
        label: 'Share with Customer',
        onPress: () =>
          setToast({ title: 'Share with customer', message: 'This flow is coming soon.' }),
      }}
      secondaryAction={{
        label: 'Share Lead Form',
        onPress: () => setToast({ title: 'Share lead form', message: 'This flow is coming soon.' }),
      }}
    >
      {visibleLeads.length === 0 ? (
        <ToolkitEmptyState />
      ) : (
        visibleLeads.map((l) => (
          <ToolkitCard key={l.id}>
            <View style={styles.titleRow}>
              <Text style={styles.title} numberOfLines={1}>
                {l.holderName}
              </Text>
              <Badge label={l.status} variant="light" size="sm" color={LEAD_BADGE[l.status]} />
            </View>

            <ToolkitMeta label="Created On:" value={formatDashMonthDate(l.createdDate)} />
            <ToolkitMeta label="Follow up:" value={formatDashMonthDate(l.followupDate)} />

            {/* Solid rather than light, as on the web — the temperature is the
                one thing on the card that should outrank the status pill. */}
            <View style={styles.typeRow}>
              <ToolkitMeta label="Policy Type:" value={l.type} />
              <Badge
                label={LEAD_TEMPERATURE_LABEL[l.leadType]}
                variant="solid"
                size="sm"
                color={LEAD_TEMPERATURE_BADGE[l.leadType]}
              />
            </View>

            <View style={styles.actions}>
              <Pressable
                style={styles.actionBtn}
                hitSlop={4}
                accessibilityRole="button"
                accessibilityLabel={`View lead ${l.id}`}
                onPress={() => setToast({ title: 'Opening lead', message: `Lead ID: ${l.id}` })}
              >
                <Eye size={16} color={colors.textBody} />
              </Pressable>
              <Pressable
                style={styles.actionBtn}
                hitSlop={4}
                accessibilityRole="button"
                accessibilityLabel={`Customer details for ${l.holderName}`}
                onPress={() => setToast({ title: 'Customer details', message: l.holderName })}
              >
                <UserCircle size={16} color={colors.textBody} />
              </Pressable>
              {/* Nothing to forward before a quote has gone out. */}
              {l.status === 'Quota Shared' ? (
                <Pressable
                  style={styles.actionBtn}
                  hitSlop={4}
                  accessibilityRole="button"
                  accessibilityLabel={`Forward quote for lead ${l.id}`}
                  onPress={() =>
                    setToast({ title: 'Forward quote', message: 'This flow is coming soon.' })
                  }
                >
                  <ShareFat size={16} color={colors.textBody} />
                </Pressable>
              ) : null}
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
  typeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
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
