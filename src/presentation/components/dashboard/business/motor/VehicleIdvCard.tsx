import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Slider, colors, spacing, typography, fontFamilyForWeight } from '@atlas-ds/react-native';
import { MotorCard } from './motorUi';
import { formatRupees, IDV_MIN, IDV_MAX } from './motorQuoteData';

interface VehicleIdvCardProps {
  idv: number;
  setIdv: (val: number) => void;
}

export const VehicleIdvCard: React.FC<VehicleIdvCardProps> = ({ idv, setIdv }) => (
  <MotorCard
    title="Select Vehicle IDV"
    action={<Text style={styles.value}>Rs. {formatRupees(idv)}</Text>}
  >
    <View style={styles.track}>
      <Slider
        min={IDV_MIN}
        max={IDV_MAX}
        step={1000}
        value={idv}
        onChange={(val) => setIdv(typeof val === 'number' ? val : val[0])}
        valueLabels={[`Rs. ${formatRupees(IDV_MIN)}`, `Rs. ${formatRupees(IDV_MAX)}`]}
      />

      {/* What each end of the track means for the customer's payout. */}
      <View style={styles.captions}>
        <Text style={styles.caption}>Minimum (−15%)</Text>
        <Text style={styles.caption}>Recommended</Text>
        <Text style={styles.caption}>Minimum (+15%)</Text>
      </View>
    </View>
  </MotorCard>
);

const styles = StyleSheet.create({
  value: {
    fontFamily: fontFamilyForWeight('600'),
    fontSize: 20,
    fontWeight: '600',
    color: colors.textHeading,
  },
  track: { gap: spacing.xs },
  captions: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  caption: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textMuted,
  },
});
