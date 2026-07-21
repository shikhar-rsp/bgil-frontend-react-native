import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Check } from 'phosphor-react-native';
import { Radio, colors, spacing, radius, typography, shadow } from '@atlas-ds/react-native';
import { ADD_ON_ITEMS } from './proposalData';

interface AddOnsStepProps {
  wantsAddOns: string;
  setWantsAddOns: (v: string) => void;
  selectedAddOns: string[];
  setSelectedAddOns: (v: string[]) => void;
}

export const AddOnsStep: React.FC<AddOnsStepProps> = ({ wantsAddOns, setWantsAddOns, selectedAddOns, setSelectedAddOns }) => {
  const toggle = (a: string) =>
    setSelectedAddOns(selectedAddOns.includes(a) ? selectedAddOns.filter((x) => x !== a) : [...selectedAddOns, a]);

  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Select Add-ons?</Text>
      <View style={styles.wantsRow}>
        {[{ value: 'yes', label: 'Yes, show options' }, { value: 'no', label: 'No, skip for now' }].map((opt) => (
          <Pressable key={opt.value} style={[styles.wants, wantsAddOns === opt.value && styles.wantsSel]} onPress={() => { setWantsAddOns(opt.value); if (opt.value === 'no') setSelectedAddOns([]); }} accessibilityRole="radio" accessibilityState={{ selected: wantsAddOns === opt.value }}>
            <Radio selected={wantsAddOns === opt.value} onPress={() => setWantsAddOns(opt.value)} />
            <Text style={styles.wantsLabel}>{opt.label}</Text>
          </Pressable>
        ))}
      </View>
      {wantsAddOns === 'yes' ? (
        <View style={styles.grid}>
          {ADD_ON_ITEMS.map((item) => {
            const sel = selectedAddOns.includes(item);
            return (
              <Pressable key={item} style={[styles.addon, sel && styles.addonSel]} onPress={() => toggle(item)} accessibilityRole="checkbox" accessibilityState={{ checked: sel }}>
                <View style={[styles.checkbox, sel && styles.checkboxSel]}>{sel ? <Check size={12} color="#FFFFFF" weight="bold" /> : null}</View>
                <Text style={styles.addonLabel}>{item}</Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, gap: spacing.md, ...shadow.lg },
  heading: { fontFamily: typography.fontFamily, fontSize: 20, fontWeight: '500', color: colors.textHeading },
  wantsRow: { flexDirection: 'row', gap: spacing.md },
  wants: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.lg, padding: spacing.md },
  wantsSel: { borderColor: '#3B82F6', backgroundColor: '#EFF6FF' },
  wantsLabel: { fontFamily: typography.fontFamily, fontSize: 13, color: colors.textHeading, flexShrink: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  addon: { width: '47%', flexGrow: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.lg, padding: spacing.md },
  addonSel: { borderColor: '#3B82F6', backgroundColor: '#EFF6FF' },
  addonLabel: { fontFamily: typography.fontFamily, fontSize: 13, color: colors.textHeading, flexShrink: 1 },
  checkbox: { width: 18, height: 18, borderRadius: radius.xs, borderWidth: 1, borderColor: '#D1D5DB', alignItems: 'center', justifyContent: 'center' },
  checkboxSel: { backgroundColor: colors.brand, borderColor: colors.brand },
});
