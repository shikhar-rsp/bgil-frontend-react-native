import React, { useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { Plus, Sliders } from 'phosphor-react-native';
import { Button, colors, spacing, radius, typography, shadow } from '@atlas-ds/react-native';
import { dashboardImages } from '../images';
import { CustomizeModal, type CustomizeOption } from './CustomizeModal';

const QUICK_QUOTE_DATA: Record<string, { label: string; icon: keyof typeof dashboardImages }> = {
  health: { label: 'Health Insurance', icon: 'health' },
  fire: { label: 'Fire Insurance', icon: 'fire' },
  motor: { label: 'Motor Insurance', icon: 'motor' },
  twmotorinsurance: { label: '2W Motor Insurance', icon: 'motor' },
  fourwheelerinsurance: { label: '4W Insurance', icon: 'motor' },
};

const QUICK_QUOTE_OPTIONS: CustomizeOption[] = Object.entries(QUICK_QUOTE_DATA).map(
  ([value, info]) => ({ value, label: info.label }),
);

interface QuickQuotesProps {
  onNavigateToQuote?: (tile: string) => void;
}

export const QuickQuotes: React.FC<QuickQuotesProps> = ({ onNavigateToQuote }) => {
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [activeQuotes, setActiveQuotes] = useState<string[]>(['health', 'fire', 'motor']);

  const visibleQuotes = activeQuotes.filter((val) => val && QUICK_QUOTE_DATA[val]);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <Text style={styles.heading}>Quick Quotes</Text>
          <Text style={styles.subtitle}>Set up your quick quotes here or create a new quote.</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Button
          label="Customise"
          variant="secondaryGray"
          size="sm"
          leadingIcon={<Sliders size={14} color={colors.textBody} />}
          onPress={() => setIsCustomizeOpen(true)}
          style={styles.actionBtn}
        />
        <Button label="View All Quotes" variant="secondary" size="sm" style={styles.actionBtn} />
      </View>

      <View style={styles.grid}>
        {visibleQuotes.map((value) => {
          const item = QUICK_QUOTE_DATA[value];
          return (
            <Pressable
              key={value}
              style={styles.tile}
              accessibilityRole="button"
              onPress={() => value === 'health' && onNavigateToQuote?.('Health Guard')}
            >
              <Image source={dashboardImages[item.icon]} style={styles.tileIcon} resizeMode="contain" />
              <Text style={styles.tileLabel} numberOfLines={1}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}

        {visibleQuotes.length < 4 ? (
          <Pressable
            style={styles.tile}
            accessibilityRole="button"
            onPress={() => setIsCustomizeOpen(true)}
          >
            <View style={styles.addIcon}>
              <Plus size={28} color={colors.textBody} />
            </View>
            <Text style={styles.manageLabel} numberOfLines={1}>
              Manage LOB
            </Text>
          </Pressable>
        ) : null}
      </View>

      <CustomizeModal
        isOpen={isCustomizeOpen}
        onClose={() => setIsCustomizeOpen(false)}
        initialSelections={activeQuotes}
        onUpdate={setActiveQuotes}
        title="Customise Quick Quotes"
        description="Select the quotes you want to see on your dashboard"
        options={QUICK_QUOTE_OPTIONS}
        maxSelections={4}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.lg,
    ...shadow.lg,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between' },
  headerText: { flex: 1, gap: spacing.xs },
  heading: { fontFamily: typography.fontFamily, fontSize: 20, fontWeight: '500', color: colors.textHeading },
  subtitle: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textBody },
  actions: { flexDirection: 'row', gap: spacing.sm },
  actionBtn: { flex: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  tile: {
    width: '47%',
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
  },
  tileIcon: { width: 40, height: 40 },
  tileLabel: { fontFamily: typography.fontFamily, fontSize: 14, fontWeight: '500', color: colors.textHeading },
  addIcon: { backgroundColor: colors.surfaceSubtle, padding: spacing.sm, borderRadius: radius.lg },
  manageLabel: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textBody },
});
