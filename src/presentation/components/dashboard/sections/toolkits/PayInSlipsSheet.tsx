import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DownloadSimple, Receipt } from 'phosphor-react-native';
import {
  Badge,
  Button,
  Toast,
  colors,
  fontFamilyForWeight,
  spacing,
  type FilterGroup,
} from '@atlas-ds/react-native';
import { ToolkitCard, ToolkitEmptyState, ToolkitMeta, ToolkitSheet } from './ToolkitSheet';
import { PAY_IN_SLIPS, SLIP_BADGE, inDateRange } from './toolkitData';

const FILTER_GROUPS: FilterGroup[] = [
  {
    key: 'status',
    label: 'Status',
    options: [
      { value: 'Verified', label: 'Verified' },
      { value: 'Pending', label: 'Pending' },
      { value: 'Resolved', label: 'Resolved' },
    ],
  },
];

interface PayInSlipsSheetProps {
  visible: boolean;
  onClose: () => void;
}

/** Pay-in-Slips — recent slips with their policy, holder and premium. */
export const PayInSlipsSheet: React.FC<PayInSlipsSheetProps> = ({ visible, onClose }) => {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [start, setStart] = useState<Date | null>(null);
  const [end, setEnd] = useState<Date | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const statuses = filters.status ?? [];

  const slips = useMemo(() => {
    const term = search.trim().toLowerCase();
    return PAY_IN_SLIPS.filter(
      (s) =>
        (!term || s.slipNumber.toLowerCase().includes(term)) &&
        (statuses.length === 0 || statuses.includes(s.status)) &&
        inDateRange(s.createdDate, start, end),
    );
  }, [search, statuses, start, end]);

  return (
    <ToolkitSheet
      visible={visible}
      onClose={onClose}
      title="Pay-in-Slips"
      icon={<Receipt size={20} color={colors.brand} />}
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
      sectionTitle="Your Recent Payslips"
      sectionHint="You can see your recent payslips for the past 2 days. Select a specific time period to fetch results."
      banner={
        toast ? <Toast variant="success" title={toast} onClose={() => setToast(null)} /> : null
      }
      primaryAction={{ label: 'View All Payslips', onPress: onClose }}
    >
      {slips.length === 0 ? (
        <ToolkitEmptyState />
      ) : (
        slips.map((slip) => (
          <ToolkitCard key={slip.id}>
            <View style={styles.titleRow}>
              <Text style={styles.title} numberOfLines={1}>
                {slip.slipNumber}
              </Text>
              <Badge label={slip.status} variant="light" size="sm" color={SLIP_BADGE[slip.status]} />
            </View>

            <ToolkitMeta label="Policy No.:" value={slip.policyNumber} />
            <ToolkitMeta label="Holder:" value={slip.holderName} />
            <ToolkitMeta
              label="Premium:"
              value={`₹ ${slip.premiumAmount.toLocaleString('en-IN')}`}
            />

            <View style={styles.cta}>
              <Button
                label="Commission Slip"
                variant="link"
                size="sm"
                leadingIcon={<DownloadSimple size={14} color={colors.brand} />}
                onPress={() => setToast(`Commission slip for ${slip.slipNumber} downloaded`)}
              />
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
  cta: { flexDirection: 'row', marginTop: spacing.xxs },
});
