import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import {
  Plus,
  FadersHorizontal,
  Files,
  Medal,
  Calculator,
  Question,
  GraduationCap,
  Receipt,
  CalendarCheck,
} from 'phosphor-react-native';
import { BottomSheet, Button, colors, spacing, radius, typography, shadow, fontFamilyForWeight } from '@atlas-ds/react-native';
import { CustomizeModal, type CustomizeOption } from './CustomizeModal';

/** Tile accent backgrounds. */
const TILE_BLUE = '#2563EB';
const TILE_ORANGE = '#EA580C';
const TILE_ICON_SIZE = 24;

type ToolInfo = { label: string; icon: React.ReactNode; bg: string };

const iconFor = (Icon: React.ElementType) => <Icon size={TILE_ICON_SIZE} color="#FFFFFF" weight="regular" />;

const TOOL_DATA: Record<string, ToolInfo> = {
  'Pay-in-Slips': { label: 'Pay-in-Slips', icon: iconFor(Receipt), bg: TILE_ORANGE },
  'Renewal Calendar': { label: 'Renewal Calendar', icon: iconFor(CalendarCheck), bg: TILE_ORANGE },
  Brochures: { label: 'Brochures', icon: iconFor(Files), bg: TILE_BLUE },
  Calculators: { label: 'Calculators', icon: iconFor(Calculator), bg: TILE_ORANGE },
  Learning: { label: 'Learning', icon: iconFor(GraduationCap), bg: TILE_BLUE },
  Campaigns: { label: 'Campaigns', icon: iconFor(Medal), bg: TILE_BLUE },
  'Query Tracker': { label: 'Query Tracker', icon: iconFor(Question), bg: TILE_ORANGE },
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
/** Default shortcuts shown on the agent / trainee dashboards. */
const DEFAULT_TOOLS = ['Brochures', 'Calculators', 'Learning', 'Campaigns', 'Query Tracker'];

interface YourToolkitProps {
  /** Shows the "Customise" button above the grid. */
  showCustomise?: boolean;
  /** Shows the trailing "Manage Tool" (+) tile in the grid. */
  showManageTile?: boolean;
  /** Override the shortcuts on show (e.g. the RM set, which drops Learning). */
  tools?: string[];
}

export const YourToolkit: React.FC<YourToolkitProps> = ({
  showCustomise = true,
  showManageTile = true,
  tools = DEFAULT_TOOLS,
}) => {
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [activeTools, setActiveTools] = useState<string[]>(tools);

  const visibleTools = activeTools.filter((val) => val && TOOL_DATA[val]);

  return (
    <View style={styles.card}>
      <View style={styles.headerText}>
        <Text style={styles.heading}>Your toolkit</Text>
        <Text style={styles.subtitle}>All your frequently used tools at one place.</Text>
      </View>

      <View style={styles.actions}>
        {showCustomise ? (
          <Button
            label="Customise"
            variant="secondaryGray"
            size="sm"
            leadingIcon={<FadersHorizontal size={16} color={colors.textBody} />}
            onPress={() => setIsCustomizeOpen(true)}
            style={styles.actionBtn}
          />
        ) : null}
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
              <View style={[styles.tileIcon, { backgroundColor: item.bg }]}>{item.icon}</View>
              <Text style={styles.tileLabel} numberOfLines={1}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}

        {showManageTile && visibleTools.length < 6 ? (
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

      <BottomSheet
        visible={activeTool !== null}
        onClose={() => setActiveTool(null)}
        title={activeTool ?? ''}
        subtitle={`Content for ${activeTool} is coming soon.`}
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
  headerText: { gap: spacing.xs },
  heading: { fontFamily: fontFamilyForWeight('500'), fontSize: 20, fontWeight: '500', color: colors.textHeading },
  subtitle: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textBody },
  actions: { flexDirection: 'row', gap: spacing.sm },
  actionBtn: { flex: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  tile: {
    // Two per row — the pair grows to fill the leftover gap.
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
  // Coloured rounded square with an 8px inset around the glyph.
  tileIcon: {
    padding: spacing.sm,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileLabel: { fontFamily: typography.fontFamily, fontSize: 12, color: colors.textHeading, textAlign: 'center' },
  addIcon: { backgroundColor: colors.surfaceSubtle, padding: spacing.sm, borderRadius: radius.lg },
  manageLabel: { fontFamily: typography.fontFamily, fontSize: 12, color: colors.textBody, textAlign: 'center' },
});
