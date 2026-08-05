import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Eye, MagnifyingGlassPlus, UploadSimple } from 'phosphor-react-native';
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
  INSPECTION_BADGE,
  INSPECTION_STATUSES,
  INSPECTION_TYPES,
  LOBS,
  PRE_INSPECTIONS,
  formatDashMonthDate,
  inDateRange,
} from './toolkitData';

const FILTER_GROUPS: FilterGroup[] = [
  { key: 'lob', label: 'Policy Type', options: LOBS.map((l) => ({ value: l, label: l })) },
  {
    key: 'inspectionType',
    label: 'Inspection Type',
    options: INSPECTION_TYPES.map((t) => ({ value: t, label: t })),
  },
  {
    key: 'status',
    label: 'Status',
    options: INSPECTION_STATUSES.map((s) => ({ value: s, label: s })),
  },
];

interface PreInspectionSheetProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * Pre-Inspection — inspections owed against policies, and what state each is in.
 *
 * Ported from the web's `sidedrawer-pre-inspection`, including its two
 * search-dependent behaviours: the amber warning whenever anything is still
 * awaiting an upload, and the card swapping to policy/expiry fields while a
 * search is running.
 */
export const PreInspectionSheet: React.FC<PreInspectionSheetProps> = ({ visible, onClose }) => {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [start, setStart] = useState<Date | null>(null);
  const [end, setEnd] = useState<Date | null>(null);
  const [toast, setToast] = useState<{ title: string; message?: string } | null>(null);

  const statuses = filters.status ?? [];
  const lobs = filters.lob ?? [];
  const inspectionTypes = filters.inspectionType ?? [];

  const visibleInspections = useMemo(() => {
    const term = search.trim().toLowerCase();
    return PRE_INSPECTIONS.filter(
      (p) =>
        (!term ||
          p.reference.toLowerCase().includes(term) ||
          p.holderName.toLowerCase().includes(term) ||
          String(p.policyNumber).includes(term)) &&
        (statuses.length === 0 || statuses.includes(p.status)) &&
        (lobs.length === 0 || lobs.includes(p.type)) &&
        (inspectionTypes.length === 0 || inspectionTypes.includes(p.inspectionType)) &&
        inDateRange(p.createdDate, start, end),
    );
  }, [search, statuses, lobs, inspectionTypes, start, end]);

  const searching = search.trim().length > 0;
  const hasPendingUpload = visibleInspections.some((p) => p.status === 'Pending Upload');

  return (
    <ToolkitSheet
      visible={visible}
      onClose={onClose}
      title="Pre-Inspection"
      icon={<MagnifyingGlassPlus size={20} color={colors.brand} />}
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
      headerExtra={
        hasPendingUpload ? (
          <View style={styles.warning}>
            <Badge variant="light" size="sm" color="amber" label="Warning" />
            <Text style={styles.warningText}>
              Pre-inspection for this policy is not done. Send reminder to the party
            </Text>
          </View>
        ) : null
      }
      sectionTitle={
        searching ? `${visibleInspections.length} Results Found` : 'Your Recent Pre-Inspection'
      }
      sectionHint="You can see your recent pre-inspections for the past 2 days. Select a specific time period to fetch results."
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
        label: 'Initiate Pre-Inspection',
        onPress: () =>
          setToast({ title: 'Initiate pre-inspection', message: 'This flow is coming soon.' }),
      }}
    >
      {visibleInspections.length === 0 ? (
        <ToolkitEmptyState />
      ) : (
        visibleInspections.map((p) => (
          <ToolkitCard key={p.id}>
            <View style={styles.titleRow}>
              <Text style={styles.title} numberOfLines={1}>
                {p.reference}
              </Text>
              <Badge label={p.status} variant="light" size="sm" color={INSPECTION_BADGE[p.status]} />
            </View>

            {searching && p.status === 'Pending Upload' ? (
              <>
                <ToolkitMeta label="Policy No.:" value={String(p.policyNumber)} />
                <ToolkitMeta label="Policy type:" value={p.type} />
                <ToolkitMeta
                  label="Policy Expired:"
                  value={formatDashMonthDate(p.expiryDate)}
                  valueColor="#B91C1C"
                />
                <ToolkitMeta label="Holder:" value={p.holderName} />
              </>
            ) : (
              <>
                <ToolkitMeta label="Holder:" value={p.holderName} />
                <ToolkitMeta label="Policy Type:" value={p.type} />
                <ToolkitMeta label="Inspection Type:" value={p.inspectionType} />
              </>
            )}

            <View style={styles.actions}>
              <Pressable
                style={styles.actionBtn}
                hitSlop={4}
                accessibilityRole="button"
                accessibilityLabel={`View inspection ${p.reference}`}
                onPress={() =>
                  setToast({ title: 'Opening inspection', message: `Reference: ${p.reference}` })
                }
              >
                <Eye size={16} color={colors.textBody} />
              </Pressable>
              {/* Nothing to upload once the images are in. */}
              {p.status === 'Pending Upload' ? (
                <Pressable
                  style={styles.actionBtn}
                  hitSlop={4}
                  accessibilityRole="button"
                  accessibilityLabel={`Upload image for ${p.reference}`}
                  onPress={() =>
                    setToast({ title: 'Upload image', message: 'This flow is coming soon.' })
                  }
                >
                  <UploadSimple size={16} color={colors.textBody} />
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
  warning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: '#FEF3C7',
    borderRadius: radius.lg,
    backgroundColor: '#FFFBEB',
  },
  warningText: {
    flexShrink: 1,
    fontFamily: typography.fontFamily,
    fontSize: 13,
    lineHeight: 18,
    color: '#9A3412',
  },
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
