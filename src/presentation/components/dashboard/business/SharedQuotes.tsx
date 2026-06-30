import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { DotsThreeVertical, Info, Copy, Trash, PencilSimple, FileText } from 'phosphor-react-native';
import {
  Badge,
  SearchBar,
  Tabs,
  MoreMenu,
  colors,
  spacing,
  radius,
  typography,
  shadow,
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

export interface SharedQuotesProps {
  onEditQuote: (q: Quote) => void;
  onConvertToProposal: (q: Quote) => void;
  onViewPolicy: (p: Policy) => void;
}

export const SharedQuotes: React.FC<SharedQuotesProps> = ({
  onEditQuote,
  onConvertToProposal,
  onViewPolicy,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('quotes');
  const [search, setSearch] = useState('');
  const [menuQuote, setMenuQuote] = useState<Quote | null>(null);

  const term = search.trim().toLowerCase();
  const filteredQuotes = useMemo(
    () =>
      QUOTES.filter(
        (q) =>
          !term ||
          q.customer.toLowerCase().includes(term) ||
          q.quoteId.toLowerCase().includes(term) ||
          q.product.toLowerCase().includes(term),
      ),
    [term],
  );

  return (
    <View style={styles.card}>
      <Tabs
        value={activeTab}
        onChange={(v) => setActiveTab(v as TabKey)}
        size="sm"
        variant="secondary"
        tabs={[
          { value: 'quotes', label: 'Quotes', badge: 50 },
          { value: 'proposals', label: 'Proposals', badge: 25 },
          { value: 'policies', label: 'Policies', badge: 15 },
          { value: 'renewals', label: 'Renewals', badge: 10 },
        ]}
      />

      {activeTab !== 'renewals' ? (
        <View style={styles.searchWrap}>
          <SearchBar value={search} onChangeText={setSearch} placeholder="Search customer" />
        </View>
      ) : null}

      {activeTab === 'quotes' ? (
        <FlatList
          data={filteredQuotes}
          keyExtractor={(q) => String(q.id)}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          ListEmptyComponent={<EmptyState />}
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
          data={PROPOSALS}
          keyExtractor={(p) => String(p.id)}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
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
          data={POLICIES}
          keyExtractor={(p) => String(p.id)}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
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

const EmptyState: React.FC = () => (
  <View style={styles.empty}>
    <Info size={22} color={colors.brand} />
    <Text style={styles.emptyText}>No data! Start creating quotes to view all information.</Text>
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
  searchWrap: { marginTop: spacing.xs },
  sep: { height: 1, backgroundColor: colors.surfaceMuted },
  record: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, gap: spacing.md },
  recordMain: { flex: 1, gap: spacing.xxs },
  recordTitle: { fontFamily: typography.fontFamily, fontSize: 15, fontWeight: '500', color: colors.textHeading },
  recordSubtitle: { fontFamily: typography.fontFamily, fontSize: 13, color: colors.textBody },
  recordMetaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  recordAmount: { fontFamily: typography.fontFamily, fontSize: 14, fontWeight: '600', color: colors.textHeading },
  recordMeta: { fontFamily: typography.fontFamily, fontSize: 12, color: colors.textMuted },
  recordRight: { alignItems: 'flex-end', gap: spacing.sm },
  empty: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xxl },
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
