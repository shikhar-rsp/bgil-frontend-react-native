import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Slider, colors, spacing, radius, typography } from '@atlas-ds/react-native';

interface DiscountLoaderCardProps {
  value: [number, number];
  setValue: React.Dispatch<React.SetStateAction<[number, number]>>;
}

export const DiscountLoaderCard: React.FC<DiscountLoaderCardProps> = ({ value, setValue }) => {
  const pctColor = value[0] < 0 ? colors.success : value[1] > 0 ? colors.dangerText : colors.textMuted;
  const pctText = value[0] < 0 ? `-${Math.abs(value[0])}%` : value[1] > 0 ? `+${value[1]}%` : '0%';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.heading}>Select Discount or Loader</Text>
        <Text style={[styles.pct, { color: pctColor }]}>{pctText}</Text>
      </View>
      <Slider
        range
        label="Discount"
        rightLabel="Loader"
        min={-50}
        max={50}
        value={value}
        onChange={(val) => Array.isArray(val) && setValue(val as [number, number])}
        valueLabels={['-50%', '0%', '+50%']}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.xl, padding: spacing.lg, gap: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heading: { fontFamily: typography.fontFamily, fontSize: 20, fontWeight: '500', color: colors.textHeading },
  pct: { fontFamily: typography.fontFamily, fontSize: 20, fontWeight: '500' },
});
