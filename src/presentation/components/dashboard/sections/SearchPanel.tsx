import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Modal, Keyboard, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CaretLeft, MagnifyingGlass, X, ArrowsClockwise } from 'phosphor-react-native';
import {
  SearchPopup,
  Badge,
  Card,
  colors,
  spacing,
  typography,
  fontFamilyForWeight,
  type SearchPopupTab,
  type AccentColor,
} from '@atlas-ds/react-native';

type ResultCategory = 'policies' | 'customers' | 'claims' | 'quotes';

type ResultLine = { label?: string; value: string; valueColor?: string };

type SearchResult = {
  id: string;
  category: ResultCategory;
  title: string;
  badge: { label: string; color: AccentColor };
  /** Status badges (e.g. "Renewal pending") sit on their own line under the title. */
  badgeBelow?: boolean;
  lines: ResultLine[];
};

const TABS: SearchPopupTab[] = [
  { key: 'all', label: 'All' },
  { key: 'policies', label: 'Policies' },
  { key: 'customers', label: 'Customers' },
  { key: 'claims', label: 'Claims' },
  { key: 'quotes', label: 'Quotes' },
];

const RESULTS: SearchResult[] = [
  {
    id: '1',
    category: 'customers',
    title: 'Priti Sinha',
    badge: { label: 'Customer', color: 'blue' },
    lines: [
      { label: 'Policy no', value: 'BAGIC/HLT/2024/001234' },
      { label: 'Created on', value: '06-01-26, 12:30:00' },
    ],
  },
  {
    id: '2',
    category: 'claims',
    title: 'CLM91083674',
    badge: { label: 'Claim', color: 'emerald' },
    lines: [
      { label: 'Customer', value: 'Priti Sinha' },
      { label: 'Policy no', value: 'BAGIC/HLT/2024/001234' },
      { label: 'Created on', value: '06-01-26, 12:30:00' },
      { label: 'Stage', value: 'Surveyor Deployed', valueColor: colors.brand },
    ],
  },
  {
    id: '3',
    category: 'policies',
    title: 'BAGIC/HLT/2024/001234',
    badge: { label: 'Policy', color: 'indigo' },
    lines: [
      { label: 'Customer', value: 'Priti Sinha' },
      { label: 'Premium', value: 'Rs. 13,000' },
      { label: 'Created on', value: '06-01-26, 12:30:00' },
      { label: 'Stage', value: 'Active', valueColor: colors.success },
    ],
  },
  {
    id: '4',
    category: 'policies',
    title: 'BAGIC/HLT/2024/001234',
    badge: { label: 'Renewal pending', color: 'amber' },
    badgeBelow: true,
    lines: [
      { label: 'Customer', value: 'Priti Sinha' },
      { label: 'Created on', value: '06-01-26, 12:30:00' },
      { label: 'Stage', value: 'Expiring soon!', valueColor: colors.danger },
    ],
  },
  {
    id: '5',
    category: 'quotes',
    title: 'QT186876786287',
    badge: { label: 'Quote', color: 'violet' },
    lines: [{ label: 'Customer', value: 'Priti Sinha' }],
  },
];

/** Highlight every case-insensitive occurrence of the query inside `text`. */
const Highlighted: React.FC<{ text: string; query: string }> = ({ text, query }) => {
  const q = query.trim();
  if (!q) return <>{text}</>;
  const lower = text.toLowerCase();
  const ql = q.toLowerCase();
  const parts: React.ReactNode[] = [];
  let i = 0;
  let key = 0;
  while (i < text.length) {
    const idx = lower.indexOf(ql, i);
    if (idx < 0) {
      parts.push(text.slice(i));
      break;
    }
    if (idx > i) parts.push(text.slice(i, idx));
    parts.push(
      <Text key={`h${key++}`} style={styles.highlight}>
        {text.slice(idx, idx + q.length)}
      </Text>,
    );
    i = idx + q.length;
  }
  return <>{parts}</>;
};

const ResultCard: React.FC<{ result: SearchResult; query: string }> = ({ result, query }) => (
  <Card>
    <View style={styles.cardContent}>
      <View style={styles.cardTop}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          <Highlighted text={result.title} query={query} />
        </Text>
        {!result.badgeBelow ? (
          <Badge label={result.badge.label} variant="light" size="sm" color={result.badge.color} />
        ) : null}
      </View>

      {result.badgeBelow ? (
        <View style={styles.badgeRow}>
          <Badge label={result.badge.label} variant="light" size="sm" color={result.badge.color} />
        </View>
      ) : null}

      {result.lines.map((line, i) => (
        <Text key={i} style={styles.line}>
          {line.label ? (
            <Text style={styles.lineLabel}>
              <Highlighted text={`${line.label}: `} query={query} />
            </Text>
          ) : null}
          <Text
            style={[
              styles.lineValue,
              line.valueColor ? [styles.lineStage, { color: line.valueColor }] : null,
            ]}
          >
            <Highlighted text={line.value} query={query} />
          </Text>
        </Text>
      ))}
    </View>
  </Card>
);

interface SearchPanelProps {
  visible: boolean;
  onClose: () => void;
}

/** Full-screen search experience opened from the dashboard search bar. */
export const SearchPanel: React.FC<SearchPanelProps> = ({ visible, onClose }) => {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [keyboardUp, setKeyboardUp] = useState(false);

  // Matches are only highlighted while the user is actively typing.
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardUp(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardUp(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const term = query.trim().toLowerCase();
  const hasQuery = term.length > 0;

  // Results are filtered by both the active tab and the search term.
  const results = RESULTS.filter((r) => {
    if (activeTab !== 'all' && r.category !== activeTab) return false;
    if (!term) return true;
    const haystack = [r.title, r.badge.label, ...r.lines.map((l) => `${l.label ?? ''} ${l.value}`)]
      .join(' ')
      .toLowerCase();
    return haystack.includes(term);
  });

  const handleClose = () => {
    setQuery('');
    setActiveTab('all');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <SearchPopup
          onBack={handleClose}
          backIcon={<CaretLeft size={22} color={colors.textBody} />}
          searchIcon={<MagnifyingGlass size={18} color={colors.textMuted} />}
          clearIcon={<X size={18} color={colors.textMuted} />}
          searchValue={query}
          onSearchChange={setQuery}
          searchPlaceholder="Search"
          tabs={TABS}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        >
          {hasQuery ? (
            <View style={styles.results}>
              <View style={styles.resultsHeader}>
                <Text style={styles.resultsCount}>{results.length} results found</Text>
                <Pressable
                  onPress={() => setQuery('')}
                  style={styles.clearRow}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="Clear history"
                >
                  <ArrowsClockwise size={16} color={colors.brand} />
                  <Text style={styles.clearText}>Clear History</Text>
                </Pressable>
              </View>
              {results.length === 0 ? (
                null
              ) : (
                results.map((result) => (
                  <ResultCard key={result.id} result={result} query={keyboardUp ? query : ''} />
                ))
              )}
            </View>
          ) : null}
        </SearchPopup>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  results: { gap: spacing.md },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resultsCount: {
    fontFamily: fontFamilyForWeight('500'),
    fontSize: 14,
    color: colors.textHeading,
  },
  clearRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  clearText: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    color: colors.brand,
  },
  cardContent: { flex: 1, gap: spacing.xs },
  // Type badge sits immediately after the title, not pushed to the far edge.
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cardTitle: {
    flexShrink: 1,
    fontFamily: fontFamilyForWeight('400'),
    fontSize: 14,
    color: colors.textHeading,
  },
  badgeRow: { flexDirection: 'row' },
  highlight: { backgroundColor: '#FBBF24', color: colors.textHeading },
  line: { fontFamily: typography.fontFamily, fontSize: 13, lineHeight: 19, color: colors.textBody },
  lineLabel: { color: colors.textBody },
  // Stage values render medium (500) in their status colour.
  lineStage: { fontFamily: fontFamilyForWeight('500') },
  emptyText: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    color: colors.textBody,
    paddingVertical: spacing.lg,
  },
  lineValue: { color: colors.textHeading },
});
