import React, { useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { PencilSimple } from 'phosphor-react-native';
import { SearchBar, Tabs, colors, spacing, radius, typography, shadow } from '@atlas-ds/react-native';
import { DRAFTS, PROPOSALS, type Draft } from './businessData';

interface DraftsPageProps {
  onEditDraft: (draft: Draft) => void;
}

export const DraftsPage: React.FC<DraftsPageProps> = ({ onEditDraft }) => {
  const [subTab, setSubTab] = useState<'quotes' | 'proposals'>('quotes');
  const [search, setSearch] = useState('');

  const term = search.trim().toLowerCase();
  const drafts = DRAFTS.filter(
    (d) => !term || d.customer.toLowerCase().includes(term) || d.quoteId.toLowerCase().includes(term),
  );

  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Drafts</Text>

      <Tabs
        value={subTab}
        onChange={(v) => setSubTab(v as 'quotes' | 'proposals')}
        size="sm"
        variant="secondary"
        tabs={[
          { value: 'quotes', label: 'Quote Drafts', badge: DRAFTS.length },
          { value: 'proposals', label: 'Proposal Drafts', badge: PROPOSALS.length },
        ]}
      />

      <View style={styles.searchWrap}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search customer" />
      </View>

      {subTab === 'quotes' ? (
        <FlatList
          data={drafts}
          keyExtractor={(d) => String(d.id)}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={styles.main}>
                <Text style={styles.title}>{item.customer}</Text>
                <Text style={styles.subtitle} numberOfLines={1}>
                  {item.quoteId} · {item.product}
                </Text>
                <Text style={styles.meta}>
                  {item.premium} · Last opened {item.lastOpened}
                </Text>
              </View>
              <Pressable
                onPress={() => onEditDraft(item)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Edit draft"
                style={styles.editBtn}
              >
                <PencilSimple size={18} color={colors.brand} />
              </Pressable>
            </View>
          )}
        />
      ) : (
        <FlatList
          data={PROPOSALS}
          keyExtractor={(p) => String(p.id)}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={styles.main}>
                <Text style={styles.title}>{item.customer}</Text>
                <Text style={styles.subtitle} numberOfLines={1}>
                  {item.proposalId} · {item.product}
                </Text>
                <Text style={styles.meta}>{item.premium}</Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadow.lg,
  },
  heading: { fontFamily: typography.fontFamily, fontSize: 20, fontWeight: '500', color: colors.textHeading },
  searchWrap: { marginTop: spacing.xs },
  sep: { height: 1, backgroundColor: colors.surfaceMuted },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, gap: spacing.md },
  main: { flex: 1, gap: spacing.xxs },
  title: { fontFamily: typography.fontFamily, fontSize: 15, fontWeight: '500', color: colors.textHeading },
  subtitle: { fontFamily: typography.fontFamily, fontSize: 13, color: colors.textBody },
  meta: { fontFamily: typography.fontFamily, fontSize: 12, color: colors.textMuted },
  editBtn: { padding: spacing.sm, borderRadius: radius.md, backgroundColor: colors.brandSubtle },
});
