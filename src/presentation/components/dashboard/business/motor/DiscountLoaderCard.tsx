import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Slider, colors, spacing, radius, typography, fontFamilyForWeight, shadow } from '@atlas-ds/react-native';

/** `[discount, loader]` as signed percentages: low ≤ 0 ≤ high. */
export type DiscountLoader = [number, number];

interface DiscountLoaderCardProps {
  value: DiscountLoader;
  setValue: (value: DiscountLoader) => void;
}

/** Discount lives left of 0, loader right of it. */
export const discountPctOf = ([low]: DiscountLoader) => (low < 0 ? Math.abs(low) : 0);
export const loaderPctOf = ([, high]: DiscountLoader) => (high > 0 ? high : 0);

/**
 * Hold each thumb in its own half of the track — the discount end can't cross
 * into positive territory, nor the loader end into negative. The slider is
 * controlled, so pinning the value at 0 is what stops the thumb there.
 */
const clampToHalves = ([low, high]: DiscountLoader): DiscountLoader => [
  Math.min(0, low),
  Math.max(0, high),
];

/**
 * Discount / loader percentages.
 *
 * Two thumbs on one -50…+50 track, with a standing tick at 0: drag the left
 * thumb into the negative half for a discount and the right thumb into the
 * positive half for a loader. They are independent, so a quote can carry both
 * at once — which a single signed value could not express.
 */
export const DiscountLoaderCard: React.FC<DiscountLoaderCardProps> = ({ value, setValue }) => {
  const discount = discountPctOf(value);
  const loader = loaderPctOf(value);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.heading}>Select Discount or Loader</Text>
        <View style={styles.pctGroup}>
          <Text style={[styles.pct, { color: discount > 0 ? colors.success : colors.textMuted }]}>
            {`-${discount}%`}
          </Text>
          <Text style={styles.pctSep}>/</Text>
          <Text style={[styles.pct, { color: loader > 0 ? colors.dangerText : colors.textMuted }]}>
            {`+${loader}%`}
          </Text>
        </View>
      </View>
      <Slider
        range
        label="Discount"
        rightLabel="Loader"
        min={-50}
        max={50}
        marker={0}
        value={value}
        onChange={(val) =>
          setValue(clampToHalves(typeof val === 'number' ? [val, val] : (val as DiscountLoader)))
        }
        valueLabels={['-50%', '0%', '+50%']}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.xl, padding: spacing.lg, gap: spacing.lg, ...shadow.lg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  heading: { flex: 1, fontFamily: fontFamilyForWeight('500'), fontSize: 20, fontWeight: '500', color: colors.textHeading },
  pctGroup: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  pct: { fontFamily: typography.fontFamily, fontSize: 18, fontWeight: '500' },
  pctSep: { fontFamily: typography.fontFamily, fontSize: 18, color: colors.borderSubtle },
});
