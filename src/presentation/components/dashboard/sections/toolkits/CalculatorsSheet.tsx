import React, { useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { Calculator } from 'phosphor-react-native';
import { Toast, colors, radius, spacing, typography } from '@atlas-ds/react-native';
import { ToolkitSheet } from './ToolkitSheet';
import { dashboardImages } from '../../images';

const CALCULATORS = [
  { label: 'Health Insurance Premium', image: 'health' },
  { label: 'Motor TP Premium', image: 'motor' },
  { label: 'Marine (Specific)', image: 'commercial' },
  { label: 'Property (Fire)', image: 'fire' },
];

interface CalculatorsSheetProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * Calculators — a plain 2-up tile grid. No search / filter / date range here,
 * matching the web drawer, which is the one tool that is just a launcher.
 */
export const CalculatorsSheet: React.FC<CalculatorsSheetProps> = ({ visible, onClose }) => {
  const [toast, setToast] = useState<string | null>(null);

  return (
    <ToolkitSheet
      visible={visible}
      onClose={onClose}
      title="Calculators"
      icon={<Calculator size={20} color={colors.brand} />}
      banner={
        toast ? <Toast variant="info" title={toast} onClose={() => setToast(null)} /> : null
      }
    >
      <View style={styles.grid}>
        {CALCULATORS.map((c) => (
          <Pressable
            key={c.label}
            style={({ pressed }) => [styles.tile, pressed && styles.tilePressed]}
            accessibilityRole="button"
            onPress={() => setToast(`${c.label} calculator is coming soon`)}
          >
            <Image source={dashboardImages[c.image]} style={styles.icon} resizeMode="contain" />
            <Text style={styles.label} numberOfLines={2}>
              {c.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </ToolkitSheet>
  );
};

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  // Two per row; the pair grows into whatever the gap leaves over.
  tile: {
    width: '47%',
    flexGrow: 1,
    height: 136,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  tilePressed: { backgroundColor: colors.surfaceSubtle },
  icon: { width: 54, height: 54 },
  label: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    color: colors.textHeading,
    textAlign: 'center',
  },
});
