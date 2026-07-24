import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { DotsThreeVertical, Info, Copy, Trash, PencilSimple, FileText } from 'phosphor-react-native';
import {
  Badge,
  Button,
  SearchBar,
  Tabs,
  MoreMenu,
  Filter,
  FilterButton,
  DatePicker,
  BottomSheet,
  colors,
  spacing,
  radius,
  typography,
  shadow,
  type FilterGroup,
} from '@atlas-ds/react-native';
import {
  QUOTES,
  PROPOSALS,
  POLICIES,
  statusColor,
  type Quote,
  type Policy,
} from './businessData';

type TabKey = 'quotes' | 'proposals' | 'policies' | 'renewals';

/** Flip to `false` to restore the populated lists and tab counts. */
const SHOW_EMPTY_STATE = true;

const FILTER_GROUPS: FilterGroup[] = [
  {
    key: 'status',
    label: 'Status',
    options: [
      { value: 'Accepted', label: 'Accepted' },
      { value: 'Rejected', label: 'Rejected' },
      { value: 'Awaiting', label: 'Awaiting' },
    ],
  },
  {
    key: 'planType',
    label: 'Plan type',
    options: [
      { value: 'individual', label: 'Individual' },
      { value: 'float', label: 'Floater' },
    ],
  },
];

/** Quote dates are `DD/MM/YY` — parse for range comparison. */
const parseQuoteDate = (s: string): Date | null => {
  const [d, m, y] = s.split('/').map(Number);
  if (!d || !m || !y) {
    return null;
  }
  return new Date(2000 + y, m - 1, d);
};

export interface SharedQuotesProps {
  onEditQuote: (q: Quote) => void;
  onConvertToProposal: (q: Quote) => void;
  onViewPolicy: (p: Policy) => void;
  /** Opens the Create-a-quote browser from the empty state. */
  onCreateQuote?: () => void;
}

export const SharedQuotes: React.FC<SharedQuotesProps> = ({
  onEditQuote,
  onConvertToProposal,
  onViewPolicy,
  onCreateQuote,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('quotes');
  const [search, setSearch] = useState('');
  const [menuQuote, setMenuQuote] = useState<Quote | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterValues, setFilterValues] = useState<Record<string, string[]>>({});
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);

  const appliedCount = Object.values(filterValues).reduce((n, v) => n + v.length, 0);

  const term = search.trim().toLowerCase();
  const filteredQuotes = useMemo(() => {
    const statuses = filterValues.status ?? [];
    const planTypes = filterValues.planType ?? [];
    return QUOTES.filter((q) => {
      if (
        term &&
        !q.customer.toLowerCase().includes(term) &&
        !q.quoteId.toLowerCase().includes(term) &&
        !q.product.toLowerCase().includes(term)
      ) {
        return false;
      }
      if (statuses.length > 0 && !statuses.includes(q.status)) {
        return false;
      }
      if (planTypes.length > 0 && !planTypes.includes(q.planType)) {
        return false;
      }
      const d = parseQuoteDate(q.date);
      if (d && fromDate && d < fromDate) {
        return false;
      }
      if (d && toDate && d > toDate) {
        return false;
      }
      return true;
    });
  }, [term, filterValues, fromDate, toDate]);

  return (
    <View style={styles.card}>
      <Tabs
        value={activeTab}
        onChange={(v) => setActiveTab(v as TabKey)}
        size="sm"
        variant="secondary"
        tabs={[
          { value: 'quotes', label: 'Quotes', badge: SHOW_EMPTY_STATE ? undefined : 50 },
          { value: 'proposals', label: 'Proposals', badge: SHOW_EMPTY_STATE ? undefined : 25 },
          { value: 'policies', label: 'Policies', badge: SHOW_EMPTY_STATE ? undefined : 15 },
          { value: 'renewals', label: 'Renewals', badge: SHOW_EMPTY_STATE ? undefined : 10 },
        ]}
      />

      {activeTab !== 'renewals' ? (
        <View style={styles.searchWrap}>
          <View style={styles.toolbar}>
            <View style={styles.searchFlex}>
              <SearchBar value={search} onChangeText={setSearch} placeholder="Search" />
            </View>
            <FilterButton onPress={() => setFilterOpen(true)} count={appliedCount || undefined} />
          </View>

          <DatePicker
            mode="range"
            startDate={fromDate}
            endDate={toDate}
            onRangeChange={(s, e) => {
              setFromDate(s);
              setToDate(e);
            }}
            sheetTitle="Select date range"
          />
        </View>
      ) : null}

      {activeTab === 'quotes' ? (
        <FlatList
          data={SHOW_EMPTY_STATE ? [] : filteredQuotes}
          keyExtractor={(q) => String(q.id)}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          ListEmptyComponent={<EmptyState onCreateQuote={onCreateQuote} />}
          renderItem={({ item }) => (
            <RecordCard
              title={item.customer}
              subtitle={`${item.quoteId} · ${item.product}`}
              amount={`₹ ${item.premium.toLocaleString('en-IN')}`}
              meta={item.date}
              status={item.status}
              onMenu={() => setMenuQuote(item)}
            />
          )}
        />
      ) : activeTab === 'proposals' ? (
        <FlatList
          data={SHOW_EMPTY_STATE ? [] : PROPOSALS}
          keyExtractor={(p) => String(p.id)}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          ListEmptyComponent={<EmptyState onCreateQuote={onCreateQuote} />}
          renderItem={({ item }) => (
            <RecordCard
              title={item.customer}
              subtitle={`${item.proposalId} · ${item.product}`}
              amount={item.premium}
              meta={item.businessType === 'new' ? 'New' : 'Portability'}
              status={item.underwriting ? 'Underwriting' : undefined}
            />
          )}
        />
      ) : activeTab === 'policies' ? (
        <FlatList
          data={SHOW_EMPTY_STATE ? [] : POLICIES}
          keyExtractor={(p) => String(p.id)}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          ListEmptyComponent={<EmptyState onCreateQuote={onCreateQuote} />}
          renderItem={({ item }) => (
            <RecordCard
              title={item.customer}
              subtitle={`${item.policyId} · ${item.product}`}
              amount={`₹ ${item.premium.toLocaleString('en-IN')}`}
              meta={item.type}
              status={item.status}
              onPress={() => onViewPolicy(item)}
            />
          )}
        />
      ) : (
        <View style={styles.renewalsEmpty}>
          <Info size={20} color={colors.brand} />
          <Text style={styles.renewalsText}>Renewals coming soon</Text>
        </View>
      )}

      <BottomSheet
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filter"
        subtitle="Narrow down the list"
        contentMinHeight={0}
        primaryAction={{ label: 'Apply', onPress: () => setFilterOpen(false) }}
        secondaryAction={{ label: 'Clear all', onPress: () => setFilterValues({}) }}
      >
        <Filter groups={FILTER_GROUPS} values={filterValues} onChange={setFilterValues} />
      </BottomSheet>

      <MoreMenu
        visible={menuQuote !== null}
        onClose={() => setMenuQuote(null)}
        columns={2}
        items={[
          { key: 'duplicate', label: 'Duplicate', color: '#64748B', icon: <Copy size={26} color="#FFFFFF" />, onPress: () => setMenuQuote(null) },
          { key: 'delete', label: 'Delete', color: '#DC2626', icon: <Trash size={26} color="#FFFFFF" />, onPress: () => setMenuQuote(null) },
          {
            key: 'edit',
            label: 'Edit Quote',
            color: '#005DAC',
            icon: <PencilSimple size={26} color="#FFFFFF" />,
            onPress: () => {
              const q = menuQuote;
              setMenuQuote(null);
              if (q) {
                onEditQuote(q);
              }
            },
          },
          {
            key: 'convert',
            label: 'Convert to Proposal',
            color: '#0D9488',
            icon: <FileText size={26} color="#FFFFFF" />,
            onPress: () => {
              const q = menuQuote;
              setMenuQuote(null);
              if (q) {
                onConvertToProposal(q);
              }
            },
          },
        ]}
      />
    </View>
  );
};

const RecordCard: React.FC<{
  title: string;
  subtitle: string;
  amount: string;
  meta: string;
  status?: string;
  onMenu?: () => void;
  onPress?: () => void;
}> = ({ title, subtitle, amount, meta, status, onMenu, onPress }) => (
  <Pressable
    style={styles.record}
    onPress={onPress}
    disabled={!onPress}
    accessibilityRole={onPress ? 'button' : undefined}
  >
    <View style={styles.recordMain}>
      <Text style={styles.recordTitle}>{title}</Text>
      <Text style={styles.recordSubtitle} numberOfLines={1}>
        {subtitle}
      </Text>
      <View style={styles.recordMetaRow}>
        <Text style={styles.recordAmount}>{amount}</Text>
        <Text style={styles.recordMeta}>· {meta}</Text>
      </View>
    </View>

    <View style={styles.recordRight}>
      {status ? <Badge variant="light" size="sm" color={statusColor(status)} label={status} /> : null}
      {onMenu ? (
        <Pressable onPress={onMenu} hitSlop={8} accessibilityRole="button" accessibilityLabel="Row actions">
          <DotsThreeVertical size={20} color={colors.textBody} weight="bold" />
        </Pressable>
      ) : null}
    </View>
  </Pressable>
);

const EmptyState: React.FC<{ onCreateQuote?: () => void }> = ({ onCreateQuote }) => (
  <View style={styles.empty}>
    <View style={styles.emptyIcon}>
      <Info size={22} color={colors.brand} />
    </View>
    <Text style={styles.emptyText}>No data! Start creating quotes to view all information.</Text>
    {onCreateQuote ? (
      <Button label="Create a Quote!" variant="secondaryGray" size="sm" onPress={onCreateQuote} style={styles.emptyBtn} />
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  searchWrap: { marginTop: spacing.xs, gap: spacing.md },
  toolbar: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  searchFlex: { flex: 1 },
  sep: { height: 1, backgroundColor: colors.surfaceMuted },
  record: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, gap: spacing.md },
  recordMain: { flex: 1, gap: spacing.xxs },
  recordTitle: { fontFamily: typography.fontFamily, fontSize: 15, fontWeight: '500', color: colors.textHeading },
  recordSubtitle: { fontFamily: typography.fontFamily, fontSize: 13, color: colors.textBody },
  recordMetaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  recordAmount: { fontFamily: typography.fontFamily, fontSize: 14, fontWeight: '600', color: colors.textHeading },
  recordMeta: { fontFamily: typography.fontFamily, fontSize: 12, color: colors.textMuted },
  recordRight: { alignItems: 'flex-end', gap: spacing.sm },
  empty: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xxl },
  emptyIcon: { padding: spacing.sm, borderRadius: radius.full, backgroundColor: colors.brandSubtle },
  // Button defaults to `alignSelf: 'flex-start'` — centre it in the empty state.
  emptyBtn: { alignSelf: 'center' },
  emptyText: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    color: colors.textBody,
    textAlign: 'center',
    maxWidth: 240,
  },
  renewalsEmpty: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xxl },
  renewalsText: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textBody },
});
