import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { DownloadSimple, Files, LinkSimple } from 'phosphor-react-native';
import {
  Badge,
  Toast,
  accent,
  colors,
  fontFamilyForWeight,
  radius,
  spacing,
  typography,
  type FilterGroup,
} from '@atlas-ds/react-native';
import { ToolkitCard, ToolkitEmptyState, ToolkitSheet } from './ToolkitSheet';
import {
  BROCHURES,
  LOBS,
  LOB_COLOR,
  formatLongDate,
  inDateRange,
  isToday,
} from './toolkitData';

const FILTER_GROUPS: FilterGroup[] = [
  { key: 'category', label: 'Category', options: LOBS.map((l) => ({ value: l, label: l })) },
];

interface BrochuresSheetProps {
  visible: boolean;
  onClose: () => void;
}

/** Brochures — searchable document list with per-row download / copy-link. */
export const BrochuresSheet: React.FC<BrochuresSheetProps> = ({ visible, onClose }) => {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [start, setStart] = useState<Date | null>(null);
  const [end, setEnd] = useState<Date | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  // Rows the footer's bulk actions operate on.
  const [selected, setSelected] = useState<number[]>([]);

  const categories = filters.category ?? [];

  const brochures = useMemo(() => {
    const term = search.trim().toLowerCase();
    return BROCHURES.filter(
      (b) =>
        (!term || b.name.toLowerCase().includes(term)) &&
        (categories.length === 0 || categories.includes(b.category)) &&
        inDateRange(b.uploadedDate, start, end),
    );
  }, [search, categories, start, end]);

  const listTitle =
    categories.length === 0
      ? 'All Brochures'
      : categories.length === 1
        ? `${categories[0]} Brochures`
        : `${categories.length} Categories Selected`;

  const toggle = (id: number) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <ToolkitSheet
      visible={visible}
      onClose={onClose}
      title="Brochures"
      icon={<Files size={20} color={colors.brand} />}
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
      sectionTitle={listTitle}
      sectionHint="Tap a brochure to select it, then download or share the whole selection."
      banner={
        toast ? <Toast variant="success" title={toast} onClose={() => setToast(null)} /> : null
      }
      primaryAction={{
        label: 'Share Selected',
        disabled: selected.length === 0,
        onPress: () => setToast(`${selected.length} brochure(s) shared`),
      }}
      secondaryAction={{
        label: 'Download Selected',
        disabled: selected.length === 0,
        onPress: () => setToast(`${selected.length} brochure(s) downloaded`),
      }}
    >
      {brochures.length === 0 ? (
        <ToolkitEmptyState />
      ) : (
        brochures.map((b) => {
          const isSelected = selected.includes(b.id);
          return (
            <ToolkitCard key={b.id} onPress={() => toggle(b.id)}>
              <View style={styles.row}>
                <View style={[styles.thumb, { backgroundColor: accent[LOB_COLOR[b.category]].lightBg }]}>
                  <Files size={22} color={accent[LOB_COLOR[b.category]].solidBg} />
                </View>

                <View style={styles.body}>
                  <View style={styles.titleRow}>
                    <Text style={styles.title} numberOfLines={1}>
                      {b.name}
                    </Text>
                    {isToday(b.uploadedDate) ? (
                      <Badge label="New" variant="solid" size="sm" color="red" />
                    ) : null}
                  </View>
                  <Text style={styles.meta}>Uploaded on: {formatLongDate(b.uploadedDate)}</Text>
                </View>

                <View style={styles.actions}>
                  <Pressable
                    style={styles.actionBtn}
                    hitSlop={4}
                    accessibilityRole="button"
                    accessibilityLabel={`Download ${b.name}`}
                    onPress={() => setToast(`${b.name} downloaded`)}
                  >
                    <DownloadSimple size={16} color={colors.textBody} />
                  </Pressable>
                  <Pressable
                    style={styles.actionBtn}
                    hitSlop={4}
                    accessibilityRole="button"
                    accessibilityLabel={`Copy link to ${b.name}`}
                    onPress={() => setToast('Link copied')}
                  >
                    <LinkSimple size={16} color={colors.textBody} />
                  </Pressable>
                </View>
              </View>

              {isSelected ? <View style={styles.selectedBar} /> : null}
            </ToolkitCard>
          );
        })
      )}
    </ToolkitSheet>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  thumb: {
    width: 40,
    height: 52,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, gap: spacing.xxs },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: {
    flexShrink: 1,
    fontFamily: fontFamilyForWeight('500'),
    fontSize: 14,
    fontWeight: '500',
    color: colors.textHeading,
  },
  meta: { fontFamily: typography.fontFamily, fontSize: 12, color: colors.textMuted },
  // The web reveals these on hover; a phone has none, so they stay visible.
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: 2,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
  },
  actionBtn: { padding: spacing.xs, borderRadius: radius.md },
  // Selection marker for the footer's bulk actions.
  selectedBar: { height: 2, borderRadius: radius.full, backgroundColor: colors.brand },
});
