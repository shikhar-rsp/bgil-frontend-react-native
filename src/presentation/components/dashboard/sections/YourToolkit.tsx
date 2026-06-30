import React, { useState } from 'react';
import { View, Text, Image, Pressable, Modal, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, Sliders, X } from 'phosphor-react-native';
import { Button, colors, spacing, radius, typography, shadow } from '@atlas-ds/react-native';
import { dashboardImages } from '../images';
import { CustomizeModal, type CustomizeOption } from './CustomizeModal';

const TOOL_DATA: Record<string, { label: string; icon: keyof typeof dashboardImages }> = {
  'Pay-in-Slips': { label: 'Pay-in-Slips', icon: 'payslip' },
  'Renewal Calendar': { label: 'Renewal Calendar', icon: 'renewalCalendar' },
  Brochures: { label: 'Brochures', icon: 'brochures' },
  Calculators: { label: 'Calculators', icon: 'calculator' },
  Learning: { label: 'Learning', icon: 'learning' },
  Campaigns: { label: 'Campaigns', icon: 'campaigns' },
  'Query Tracker': { label: 'Query Tracker', icon: 'queryTracker' },
};

const TOOLKIT_OPTIONS: CustomizeOption[] = Object.entries(TOOL_DATA).map(([value, info]) => ({
  value,
  label: info.label,
}));

/**
 * Your Toolkit — a customisable grid of tool shortcuts. The web opened a full
 * side-drawer per tool (~14 of them); those are out of scope for this vertical,
 * so tapping a tool opens a "coming soon" bottom sheet (mirroring the web's own
 * fallback drawer for unimplemented tools).
 */
export const YourToolkit: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [activeTools, setActiveTools] = useState<string[]>([
    'Brochures',
    'Calculators',
    'Learning',
    'Campaigns',
    'Query Tracker',
  ]);

  const visibleTools = activeTools.filter((val) => val && TOOL_DATA[val]);

  return (
    <View style={styles.card}>
      <View style={styles.headerText}>
        <Text style={styles.heading}>Your toolkit</Text>
        <Text style={styles.subtitle}>All your frequently used tools at one place.</Text>
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
        <Button label="View All Tools" variant="secondary" size="sm" style={styles.actionBtn} />
      </View>

      <View style={styles.grid}>
        {visibleTools.map((value) => {
          const item = TOOL_DATA[value];
          return (
            <Pressable
              key={value}
              style={styles.tile}
              accessibilityRole="button"
              onPress={() => setActiveTool(item.label)}
            >
              <Image source={dashboardImages[item.icon]} style={styles.tileIcon} resizeMode="contain" />
              <Text style={styles.tileLabel} numberOfLines={1}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}

        {visibleTools.length < 6 ? (
          <Pressable style={styles.tile} accessibilityRole="button" onPress={() => setIsCustomizeOpen(true)}>
            <View style={styles.addIcon}>
              <Plus size={26} color={colors.textBody} />
            </View>
            <Text style={styles.manageLabel} numberOfLines={1}>
              Manage Tool
            </Text>
          </Pressable>
        ) : null}
      </View>

      <CustomizeModal
        isOpen={isCustomizeOpen}
        onClose={() => setIsCustomizeOpen(false)}
        initialSelections={activeTools}
        onUpdate={setActiveTools}
        title="Customise Toolkit"
        description="Select the tools to show on your dashboard"
        options={TOOLKIT_OPTIONS}
        maxSelections={6}
      />

      <Modal
        visible={activeTool !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setActiveTool(null)}
      >
        <Pressable style={styles.sheetScrim} onPress={() => setActiveTool(null)}>
          <Pressable style={[styles.sheet, { paddingBottom: insets.bottom + spacing.xl }]}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{activeTool}</Text>
              <Pressable onPress={() => setActiveTool(null)} hitSlop={8} accessibilityLabel="Close">
                <X size={20} color={colors.textMuted} />
              </Pressable>
            </View>
            <Text style={styles.sheetBody}>Content for {activeTool} is coming soon.</Text>
          </Pressable>
        </Pressable>
      </Modal>
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
  headerText: { gap: spacing.xs },
  heading: { fontFamily: typography.fontFamily, fontSize: 20, fontWeight: '500', color: colors.textHeading },
  subtitle: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textBody },
  actions: { flexDirection: 'row', gap: spacing.sm },
  actionBtn: { flex: 1 },
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
  },
  tileIcon: { width: 36, height: 36 },
  tileLabel: { fontFamily: typography.fontFamily, fontSize: 12, color: colors.textHeading, textAlign: 'center' },
  addIcon: { backgroundColor: colors.surfaceSubtle, padding: spacing.sm, borderRadius: radius.lg },
  manageLabel: { fontFamily: typography.fontFamily, fontSize: 12, color: colors.textBody, textAlign: 'center' },
  sheetScrim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    gap: spacing.lg,
  },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sheetTitle: { fontFamily: typography.fontFamily, fontSize: 18, fontWeight: '600', color: colors.textHeading },
  sheetBody: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textBody },
});
