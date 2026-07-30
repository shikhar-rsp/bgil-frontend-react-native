import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Eye, Info } from 'phosphor-react-native';
import {
  BottomSheet,
  Button,
  DatePicker,
  Filter,
  FilterButton,
  Modal,
  SearchBar,
  Toast,
  colors,
  spacing,
  radius,
  typography,
  shadow,
  fontFamilyForWeight,
} from '@atlas-ds/react-native';
import { ListEmptyState, resolveSearchStatus } from '../lists/ListEmptyState';
import {
  ENDORSEMENTS,
  ENDORSEMENT_FILTER_GROUPS,
  RECENT_WINDOW_DAYS,
  formatIssuedOn,
  isRecent,
  type Endorsement,
} from './endorsementData';

interface EndorsementsPageProps {
  /** Pre-fills the search box — set when opened from a policy's row action. */
  initialSearch?: string;
}

const Separator: React.FC = () => <View style={styles.sep} />;

const EndorsementCard: React.FC<{ item: Endorsement; onView: () => void }> = ({ item, onView }) => (
  <View style={styles.record}>
    <View style={styles.recordMain}>
      <Text style={styles.holder} numberOfLines={1}>
        {item.holderName}
      </Text>
      <View style={styles.metaGrid}>
        <Text style={styles.metaLabel}>
          Policy Type: <Text style={styles.metaValue}>{item.type}</Text>
        </Text>
        <Text style={styles.metaLabel}>
          Policy No.: <Text style={styles.metaValue}>{item.policyNumber}</Text>
        </Text>
        <Text style={styles.metaLabel}>
          Issued On: <Text style={styles.metaValue}>{formatIssuedOn(item.createdDate)}</Text>
        </Text>
      </View>
    </View>
    <Button
      iconOnly
      variant="secondaryGray"
      size="sm"
      label={`View endorsement for ${item.policyNumber}`}
      leadingIcon={<Eye size={16} color={colors.textBody} />}
      onPress={onView}
    />
  </View>
);

/**
 * Endorsements — search, date-range and LOB filtering over the agent's
 * endorsements, ported from the web's endorsement side drawer.
 *
 * Web renders this as a side drawer that its own CSS turns into a 90%-height
 * bottom sheet under 768px. It's a full screen here instead: the drawer's
 * controls include a date-range picker and a filter panel, both of which open
 * their own overlays in this design system, and stacking those inside a sheet
 * means nesting native modals. The content and behaviour are otherwise the same.
 */
export const EndorsementsPage: React.FC<EndorsementsPageProps> = ({ initialSearch = '' }) => {
  const [search, setSearch] = useState(initialSearch);
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterValues, setFilterValues] = useState<Record<string, string[]>>({});
  // Web's drawer shows a recent window with a "View All" button beside it.
  const [showAll, setShowAll] = useState(false);
  const [initiateOpen, setInitiateOpen] = useState(false);
  const [viewing, setViewing] = useState<Endorsement | null>(null);

  const appliedCount = Object.values(filterValues).reduce((n, v) => n + v.length, 0);
  const term = search.trim().toLowerCase();

  const filtered = useMemo(() => {
    const types = filterValues.type ?? [];
    return ENDORSEMENTS.filter((e) => {
      if (!showAll && !isRecent(e.createdDate)) {
        return false;
      }
      if (
        term &&
        !e.holderName.toLowerCase().includes(term) &&
        !e.policyNumber.toLowerCase().includes(term) &&
        !e.type.toLowerCase().includes(term)
      ) {
        return false;
      }
      if (types.length > 0 && !types.includes(e.type)) {
        return false;
      }
      const created = new Date(e.createdDate);
      if (fromDate && created < fromDate) {
        return false;
      }
      if (toDate && created > toDate) {
        return false;
      }
      return true;
    });
  }, [term, filterValues, fromDate, toDate, showAll]);

  return (
    <View style={styles.flex}>
      <View style={styles.body}>
        <View style={styles.toolbar}>
          <View style={styles.searchFlex}>
            <SearchBar
              value={search}
              onChangeText={setSearch}
              onClear={() => setSearch('')}
              placeholder="Search"
            />
          </View>
          <FilterButton onPress={() => setFilterOpen(true)} count={appliedCount || undefined} />
        </View>

        <DatePicker
          mode="range"
          startPlaceholder="From"
          endPlaceholder="To"
          startDate={fromDate}
          endDate={toDate}
          onRangeChange={(s, e) => {
            setFromDate(s);
            setToDate(e);
          }}
          sheetTitle="Select date range"
        />

        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>{showAll ? 'All Endorsements' : 'Your Recent Endorsements'}</Text>
          <Info size={16} color={colors.textMuted} />
        </View>
        <Text style={styles.listHint}>
          {showAll
            ? 'Showing every endorsement raised on your policies.'
            : `Showing endorsements from the last ${RECENT_WINDOW_DAYS} days. Select a time period, or view all, to fetch more.`}
        </Text>

        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={Separator}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <ListEmptyState status={resolveSearchStatus(search, filtered.length)} noun="endorsements" />
          }
          renderItem={({ item }) => <EndorsementCard item={item} onView={() => setViewing(item)} />}
        />
      </View>

      <View style={styles.footer}>
        <Button
          label="Initiate Endorsement"
          variant="secondary"
          onPress={() => setInitiateOpen(true)}
          style={styles.footerBtn}
        />
        <Button
          label={showAll ? 'Show Recent' : 'View All Endorsements'}
          onPress={() => setShowAll((v) => !v)}
          style={styles.footerBtn}
        />
      </View>

      <BottomSheet
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filter"
        subtitle="Narrow down the list"
        contentMinHeight={0}
        primaryAction={{ label: 'Apply', onPress: () => setFilterOpen(false) }}
        secondaryAction={{ label: 'Clear all', onPress: () => setFilterValues({}) }}
      >
        <Filter groups={ENDORSEMENT_FILTER_GROUPS} values={filterValues} onChange={setFilterValues} />
      </BottomSheet>

      <BottomSheet
        visible={viewing !== null}
        onClose={() => setViewing(null)}
        title="Endorsement details"
        subtitle={viewing ? `Policy ${viewing.policyNumber}` : undefined}
        contentMinHeight={0}
        primaryAction={{ label: 'Close', onPress: () => setViewing(null) }}
      >
        <View style={styles.details}>
          <Toast
            variant="info"
            title="Read-only"
            message="The full endorsement record opens on the portal; this is the summary held on device."
          />
          {viewing
            ? (
                [
                  ['Policy holder', viewing.holderName],
                  ['Policy type', viewing.type],
                  ['Policy number', viewing.policyNumber],
                  ['Issued on', formatIssuedOn(viewing.createdDate)],
                ] as const
              ).map(([label, value]) => (
                <View key={label} style={styles.detailRow}>
                  <Text style={styles.metaLabel}>{label}</Text>
                  <Text style={styles.detailValue}>{value}</Text>
                </View>
              ))
            : null}
        </View>
      </BottomSheet>

      <Modal
        visible={initiateOpen}
        onClose={() => setInitiateOpen(false)}
        title="Initiate Endorsement"
        subtitle="Raising a new endorsement isn't built yet — it has no journey in the web app either. You can review existing endorsements here in the meantime."
        primaryAction={{ label: 'Got it', onPress: () => setInitiateOpen(false) }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.surfaceSubtle },
  body: { flex: 1, padding: spacing.lg, gap: spacing.md },
  toolbar: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  searchFlex: { flex: 1 },
  listHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingTop: spacing.xs },
  listTitle: { fontFamily: fontFamilyForWeight('500'), fontSize: 16, lineHeight: 20, fontWeight: '500', color: colors.textBody },
  listHint: { fontFamily: typography.fontFamily, fontSize: 12, lineHeight: 16, color: colors.textMuted },
  listContent: { paddingBottom: spacing.lg },
  sep: { height: spacing.md },
  record: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  recordMain: { flex: 1, gap: spacing.sm },
  holder: { fontFamily: typography.fontFamily, fontSize: 16, color: colors.textHeading },
  metaGrid: { gap: 2 },
  metaLabel: { fontFamily: typography.fontFamily, fontSize: 13, lineHeight: 18, color: colors.textBody },
  metaValue: { color: colors.textHeading },
  // Full-bleed footer bar, matching the quote flows.
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    ...shadow.lg,
  },
  // `stretch` overrides Button's own `alignSelf: 'flex-start'`.
  footerBtn: { flex: 1, alignSelf: 'stretch' },
  details: { gap: spacing.md, alignSelf: 'stretch' },
  detailRow: { gap: 2 },
  detailValue: { fontFamily: fontFamilyForWeight('500'), fontSize: 14, fontWeight: '500', color: colors.textHeading },
});
