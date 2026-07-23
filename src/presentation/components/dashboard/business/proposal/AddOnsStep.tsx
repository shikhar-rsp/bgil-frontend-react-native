import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button, Card, Checkbox, Radio, colors, spacing, radius, typography, shadow, fontFamilyForWeight } from '@atlas-ds/react-native';
import { SkipAddOnsModal } from '../health/SkipAddOnsModal';
import { ADD_ON_ITEMS } from './proposalData';

interface AddOnsStepProps {
  wantsAddOns: string;
  setWantsAddOns: (v: string) => void;
  selectedAddOns: string[];
  setSelectedAddOns: (v: string[]) => void;
  /** Advances to the next step when the user confirms skipping add-ons. */
  onSkipAndProceed?: () => void;
}

export const AddOnsStep: React.FC<AddOnsStepProps> = ({ wantsAddOns, setWantsAddOns, selectedAddOns, setSelectedAddOns, onSkipAndProceed }) => {
  const [showSkip, setShowSkip] = useState(false);

  const toggle = (a: string) =>
    setSelectedAddOns(selectedAddOns.includes(a) ? selectedAddOns.filter((x) => x !== a) : [...selectedAddOns, a]);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.heading}>Select Add-ons?</Text>
          <Text style={styles.sub}>The selected Add-ons will be the same for all members of the policy.</Text>
        </View>
        <Button label="Skip Add-ons" variant="secondaryGray" size="sm" onPress={() => setShowSkip(true)} />
      </View>
      <View style={styles.wantsRow}>
        {[{ value: 'yes', label: 'Yes, show options' }, { value: 'no', label: 'No, skip for now' }].map((opt) => (
          <Card
            key={opt.value}
            selected={wantsAddOns === opt.value}
            onPress={() => {
              setWantsAddOns(opt.value);
              if (opt.value === 'no') {
                setSelectedAddOns([]);
              }
            }}
            style={styles.wantsCard}
          >
            <View style={styles.wantsInner}>
              <Radio selected={wantsAddOns === opt.value} onPress={() => setWantsAddOns(opt.value)} />
              <Text style={styles.wantsLabel}>{opt.label}</Text>
            </View>
          </Card>
        ))}
      </View>
      {wantsAddOns === 'yes' ? (
        <View style={styles.grid}>
          {ADD_ON_ITEMS.map((item) => {
            const sel = selectedAddOns.includes(item);
            return (
              <Card key={item} selected={sel} style={styles.gridItem}>
                <Checkbox size="sm" checked={sel} onChange={() => toggle(item)} label={item} />
              </Card>
            );
          })}
        </View>
      ) : null}

      <SkipAddOnsModal
        isOpen={showSkip}
        onClose={() => setShowSkip(false)}
        onSkipAndProceed={() => {
          setWantsAddOns('no');
          setSelectedAddOns([]);
          onSkipAndProceed?.();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, gap: spacing.md, ...shadow.lg },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.md },
  headerText: { flex: 1, gap: spacing.xs },
  heading: { fontFamily: fontFamilyForWeight('500'), fontSize: 20, fontWeight: '500', color: colors.textHeading },
  sub: { fontFamily: typography.fontFamily, fontSize: 12, lineHeight: 18, color: colors.textBody },
  wantsRow: { flexDirection: 'row', gap: spacing.md },
  wantsCard: { flex: 1 },
  wantsInner: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexShrink: 1 },
  wantsLabel: { fontFamily: typography.fontFamily, fontSize: 13, color: colors.textHeading, flexShrink: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: spacing.md, columnGap: spacing.sm },
  // Card supplies border / radius / padding / selected styling; just size it.
  gridItem: { width: '47%', flexGrow: 1 },
});
