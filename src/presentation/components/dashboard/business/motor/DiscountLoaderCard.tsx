import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Slider, colors, spacing, radius, typography, fontFamilyForWeight, shadow } from '@atlas-ds/react-native';

interface DiscountLoaderCardProps {
  /** Signed percentage: negative is a discount, positive a loader, 0 neither. */
  value: number;
  setValue: (value: number) => void;
}

/**
 * Discount / loader percentage.
 *
 * A single thumb resting at the centre: drag left for a discount, right for a
 * loader. It was previously a dual-thumb `range` slider, which models a span —
 * so it carried two thumbs and a tap moved whichever was nearer, making the
 * control appear to move from both ends. Discount and loader are mutually
 * exclusive, so one signed value is the right model.
 */
export const DiscountLoaderCard: React.FC<DiscountLoaderCardProps> = ({ value, setValue }) => {
  const pctColor = value < 0 ? colors.success : value > 0 ? colors.dangerText : colors.textMuted;
  const pctText = value < 0 ? `-${Math.abs(value)}%` : value > 0 ? `+${value}%` : '0%';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.heading}>Select Discount or Loader</Text>
        <Text style={[styles.pct, { color: pctColor }]}>{pctText}</Text>
      </View>
      <Slider
        label="Discount"
        rightLabel="Loader"
        min={-50}
        max={50}
        value={value}
        onChange={(val) => setValue(typeof val === 'number' ? val : val[0])}
        valueLabels={['-50%', '0%', '+50%']}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.xl, padding: spacing.lg, gap: spacing.lg, ...shadow.lg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heading: { fontFamily: fontFamilyForWeight('500'), fontSize: 20, fontWeight: '500', color: colors.textHeading },
  pct: { fontFamily: typography.fontFamily, fontSize: 20, fontWeight: '500' },
});
