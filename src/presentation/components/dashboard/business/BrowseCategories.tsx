import React from 'react';
import { View, Text, Image, Pressable, ScrollView, StyleSheet } from 'react-native';
import { colors, spacing, radius, typography, fontFamilyForWeight } from '@atlas-ds/react-native';
import { dashboardImages } from '../images';

type Item = { label: string; icon: keyof typeof dashboardImages };

const CATEGORIES: { title: string; items: Item[] }[] = [
  {
    title: 'Health Insurance',
    items: [
      { label: 'My Health Care', icon: 'health' },
      { label: 'Apke Liye', icon: 'health' },
      { label: 'Health Guard', icon: 'health' },
      { label: 'Global Health', icon: 'health' },
      { label: 'Criti Care', icon: 'health' },
      { label: 'Arogya Sanjeevni', icon: 'health' },
    ],
  },
  {
    title: 'Motor Insurance',
    items: [
      { label: 'Private Car', icon: 'motor' },
      { label: 'Two Wheeler', icon: 'motor' },
      { label: 'Pay as you Consume', icon: 'motor' },
      { label: 'Commercial Vehicle', icon: 'motor' },
    ],
  },
];

interface BrowseCategoriesProps {
  onSelectProduct: (label: string) => void;
}

export const BrowseCategories: React.FC<BrowseCategoriesProps> = ({ onSelectProduct }) => (
  <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    {/* Everything lives in one "Create a quote" card, agent art top-right. */}
    <View style={styles.card}>
      <Image source={dashboardImages.agent3} style={styles.headerArt} resizeMode="contain" />
      <Text style={styles.headerTitle}>Create a quote</Text>

      {CATEGORIES.map((cat) => (
        <View key={cat.title} style={styles.block}>
          <Text style={styles.sectionTitle}>{cat.title}</Text>
          <View style={styles.grid}>
            {cat.items.map((item) => (
              <ProductTile key={`${cat.title}-${item.label}`} item={item} onPress={() => onSelectProduct(item.label)} />
            ))}
          </View>
        </View>
      ))}
    </View>
  </ScrollView>
);

const ProductTile: React.FC<{ item: Item; onPress: () => void }> = ({ item, onPress }) => (
  <Pressable style={styles.tile} onPress={onPress} accessibilityRole="button">
    <Image source={dashboardImages[item.icon]} style={styles.tileIcon} resizeMode="contain" />
    <Text style={styles.tileLabel} numberOfLines={2}>
      {item.label}
    </Text>
  </Pressable>
);

const styles = StyleSheet.create({
  content: { padding: spacing.lg },
  // Single card holding the title, agent art (top-right), and both grids.
  card: {
    position: 'relative',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.xl,
    overflow: 'hidden',
  },
  headerTitle: { fontFamily: fontFamilyForWeight('500'), fontSize: 22, fontWeight: '500', color: colors.textHeading, paddingRight: 120 },
  headerArt: { position: 'absolute', right: 0, top: 0, width: 120, height: 96 },
  block: { gap: spacing.md },
  sectionTitle: { fontFamily: typography.fontFamily, fontSize: 16, fontWeight: '600', color: colors.textHeading },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  // Two per row.
  tile: {
    width: '47%',
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  tileIcon: { width: 44, height: 44 },
  tileLabel: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textHeading, textAlign: 'center' },
});
