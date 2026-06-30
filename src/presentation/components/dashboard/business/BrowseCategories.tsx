import React, { useMemo, useState } from 'react';
import { View, Text, Image, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SearchBar, colors, spacing, radius, typography } from '@atlas-ds/react-native';
import { dashboardImages } from '../images';

type Item = { label: string; icon: keyof typeof dashboardImages };

const FEATURED: Item[] = [
  { label: 'Health Guard', icon: 'health' },
  { label: 'Criti Care', icon: 'health' },
  { label: 'Private Car', icon: 'motor' },
  { label: 'Two Wheeler', icon: 'motor' },
];

const CATEGORIES: { title: string; items: Item[] }[] = [
  {
    title: 'Health Insurance',
    items: [
      { label: 'My Health Care', icon: 'health' },
      { label: 'Apke Liye', icon: 'health' },
      { label: 'Health Guard', icon: 'health' },
      { label: 'Global Health', icon: 'health' },
    ],
  },
  {
    title: 'Motor Insurance',
    items: [
      { label: 'Private Car', icon: 'motor' },
      { label: 'Two Wheeler', icon: 'motor' },
      { label: 'Commercial Vehicle', icon: 'motor' },
    ],
  },
  {
    title: 'Fire Insurance',
    items: [
      { label: 'Standard Fire & Special Perils', icon: 'fire' },
      { label: 'Bharat Griha Raksha', icon: 'fire' },
    ],
  },
];

interface BrowseCategoriesProps {
  onSelectProduct: (label: string) => void;
}

export const BrowseCategories: React.FC<BrowseCategoriesProps> = ({ onSelectProduct }) => {
  const [search, setSearch] = useState('');
  const term = search.trim().toLowerCase();

  const categories = useMemo(
    () =>
      CATEGORIES.map((cat) => ({
        ...cat,
        items: cat.items.filter((it) => !term || it.label.toLowerCase().includes(term)),
      })).filter((cat) => cat.items.length > 0),
    [term],
  );

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <SearchBar value={search} onChangeText={setSearch} placeholder="Search products" />

      {!term ? (
        <View style={styles.block}>
          <Text style={styles.sectionTitle}>Frequently used</Text>
          <View style={styles.grid}>
            {FEATURED.map((item) => (
              <ProductTile key={item.label} item={item} onPress={() => onSelectProduct(item.label)} />
            ))}
          </View>
        </View>
      ) : null}

      {categories.map((cat) => (
        <View key={cat.title} style={styles.block}>
          <Text style={styles.sectionTitle}>{cat.title}</Text>
          <View style={styles.grid}>
            {cat.items.map((item) => (
              <ProductTile
                key={`${cat.title}-${item.label}`}
                item={item}
                onPress={() => onSelectProduct(item.label)}
              />
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const ProductTile: React.FC<{ item: Item; onPress: () => void }> = ({ item, onPress }) => (
  <Pressable style={styles.tile} onPress={onPress} accessibilityRole="button">
    <Image source={dashboardImages[item.icon]} style={styles.tileIcon} resizeMode="contain" />
    <Text style={styles.tileLabel} numberOfLines={2}>
      {item.label}
    </Text>
  </Pressable>
);

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.xl },
  block: { gap: spacing.md },
  sectionTitle: { fontFamily: typography.fontFamily, fontSize: 16, fontWeight: '600', color: colors.textHeading },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  tile: {
    width: '30%',
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  tileIcon: { width: 36, height: 36 },
  tileLabel: { fontFamily: typography.fontFamily, fontSize: 12, color: colors.textHeading, textAlign: 'center' },
});
