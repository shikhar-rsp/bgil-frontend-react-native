import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CaretRight, Clock, Gift, Medal } from 'phosphor-react-native';
import {
  Badge,
  Button,
  ProgressBar,
  colors,
  fontFamilyForWeight,
  radius,
  spacing,
  typography,
  type FilterGroup,
} from '@atlas-ds/react-native';
import { ToolkitCard, ToolkitEmptyState, ToolkitSheet } from './ToolkitSheet';
import { CAMPAIGNS, CAMPAIGN_BADGE, inDateRange, type Campaign } from './toolkitData';

const FILTER_GROUPS: FilterGroup[] = [
  {
    key: 'status',
    label: 'Status',
    options: [
      { value: 'New', label: 'New' },
      { value: 'Active', label: 'Active' },
      { value: 'Completed', label: 'Completed' },
    ],
  },
];

interface CampaignsSheetProps {
  visible: boolean;
  onClose: () => void;
}

const StatusBadge: React.FC<{ campaign: Campaign }> = ({ campaign }) =>
  campaign.status === 'New' ? (
    <Badge label="New!" variant="solid" size="sm" color="blue" />
  ) : (
    <Badge
      label={campaign.status}
      variant="light"
      size="sm"
      color={CAMPAIGN_BADGE[campaign.status]}
    />
  );

/**
 * Campaigns — list of running campaigns; tapping one pushes a detail step
 * (the web swapped the drawer's body for it in place).
 */
export const CampaignsSheet: React.FC<CampaignsSheetProps> = ({ visible, onClose }) => {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [start, setStart] = useState<Date | null>(null);
  const [end, setEnd] = useState<Date | null>(null);
  const [selected, setSelected] = useState<Campaign | null>(null);

  const statuses = filters.status ?? [];

  const campaigns = useMemo(() => {
    const term = search.trim().toLowerCase();
    return CAMPAIGNS.filter(
      (c) =>
        (!term || c.title.toLowerCase().includes(term)) &&
        (statuses.length === 0 || statuses.includes(c.status)) &&
        inDateRange(c.createdDate, start, end),
    );
  }, [search, statuses, start, end]);

  // The campaign's name is the sheet's heading on this step, so the body opens
  // with the status badge rather than repeating it.
  const detail = selected ? (
    <View style={styles.detail}>
      <View style={styles.detailHead}>
        <StatusBadge campaign={selected} />
      </View>

      <Text style={styles.detailBody}>{selected.description}</Text>

      <View style={styles.detailMeta}>
        <View style={styles.metaItem}>
          <Clock size={14} color={colors.textBody} />
          <Text style={styles.metaText}>{selected.timeRequired}</Text>
        </View>
        <View style={styles.metaItem}>
          <Gift size={14} color={colors.textBody} />
          <Text style={styles.metaText}>{selected.reward}</Text>
        </View>
      </View>

      <View style={styles.progress}>
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>Your Progress</Text>
          <Text style={styles.progressLabel}>{selected.progress}%</Text>
        </View>
        <ProgressBar value={selected.progress} height={8} />
      </View>

      {/* Stands in for the web's full-width campaign banner image. */}
      <View style={styles.banner}>
        <Medal size={40} color={colors.brand} />
        <Text style={styles.bannerText}>{selected.reward}</Text>
      </View>

      <View style={styles.detailCta}>
        <Button
          label="View Details"
          variant="link"
          size="sm"
          trailingIcon={<CaretRight size={16} color={colors.brand} />}
          onPress={() => setSelected(null)}
        />
      </View>
    </View>
  ) : null;

  return (
    <ToolkitSheet
      visible={visible}
      onClose={onClose}
      title="Campaigns"
      detailTitle={selected?.title}
      icon={<Medal size={20} color={colors.brand} />}
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
      sectionTitle="All Campaigns"
      sectionHint="Campaigns you are enrolled in, with your progress against each."
      detail={detail}
      onDetailBack={() => setSelected(null)}
      primaryAction={selected ? undefined : { label: 'Go to Campaigns', onPress: onClose }}
    >
      {campaigns.length === 0 ? (
        <ToolkitEmptyState />
      ) : (
        campaigns.map((campaign) => (
          <ToolkitCard key={campaign.id} onPress={() => setSelected(campaign)}>
            <View style={styles.titleRow}>
              <Text style={styles.title} numberOfLines={1}>
                {campaign.title}
              </Text>
              <StatusBadge campaign={campaign} />
            </View>

            <Text style={styles.description} numberOfLines={2}>
              {campaign.description}
            </Text>

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Clock size={12} color={colors.textBody} />
                <Text style={styles.metaSmall} numberOfLines={1}>
                  {campaign.timeRequired}
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Gift size={12} color={colors.textBody} />
                <Text style={styles.metaSmall} numberOfLines={1}>
                  {campaign.reward}
                </Text>
              </View>
            </View>

            <View style={styles.progress}>
              <View style={styles.progressRow}>
                <Text style={styles.progressLabel}>Your Progress</Text>
                <Text style={styles.progressLabel}>{campaign.progress}%</Text>
              </View>
              <ProgressBar value={campaign.progress} height={8} />
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
    fontSize: 16,
    fontWeight: '500',
    color: colors.textHeading,
  },
  description: { fontFamily: typography.fontFamily, fontSize: 12, color: colors.textBody },
  metaRow: { gap: spacing.xs },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  metaSmall: { flex: 1, fontFamily: typography.fontFamily, fontSize: 11, color: colors.textBody },
  metaText: { flex: 1, fontFamily: typography.fontFamily, fontSize: 12, color: colors.textBody },
  progress: { gap: spacing.xs },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { fontFamily: typography.fontFamily, fontSize: 12, color: colors.textBody },

  // --- detail step ----------------------------------------------------------
  detail: { gap: spacing.lg },
  detailHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  detailBody: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textBody,
  },
  detailMeta: { gap: spacing.xs },
  banner: {
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.xl,
    backgroundColor: colors.brandSubtle,
  },
  bannerText: {
    fontFamily: fontFamilyForWeight('500'),
    fontSize: 16,
    fontWeight: '500',
    color: colors.brandPressed,
  },
  detailCta: { alignItems: 'flex-end' },
});
