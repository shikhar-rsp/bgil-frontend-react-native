import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Info } from 'phosphor-react-native';
import { Badge, SegmentedControl, colors, spacing, radius, typography, shadow } from '@atlas-ds/react-native';

type Range = 'weekly' | 'monthly' | 'yearly';

const INSIGHTS = [
  { label: 'Premium Generated', value: '₹ 88,000', trend: '↑ 32% from last week' },
  { label: 'Quotes Shared', value: '102', sub: 'Expiring Quotes: 32' },
  { label: 'Policies Sold', value: '60', sub: 'Expiring Policies: 24' },
  { label: 'Renewals Done', value: '32', sub: 'Renewals Due: 12' },
];

export const BusinessInsights: React.FC = () => {
  const [range, setRange] = useState<Range>('weekly');

  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Business Insights</Text>

      <SegmentedControl
        size="sm"
        value={range}
        onChange={(v) => setRange(v as Range)}
        options={[
          { value: 'weekly', label: 'Weekly' },
          { value: 'monthly', label: 'Monthly' },
          { value: 'yearly', label: 'Yearly' },
        ]}
      />

      <View style={styles.grid}>
        {INSIGHTS.map((item) => (
          <View key={item.label} style={styles.statCard}>
            <View style={styles.statLabelRow}>
              <Text style={styles.statLabel}>{item.label}</Text>
              <Info size={14} color={colors.textMuted} />
            </View>
            <Text style={styles.statValue}>{item.value}</Text>
            {item.trend ? (
              <Badge variant="light" size="sm" color="lime" label={item.trend} />
            ) : (
              <Text style={styles.statSub}>{item.sub}</Text>
            )}
          </View>
        ))}
      </View>
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
  heading: { fontFamily: typography.fontFamily, fontSize: 22, fontWeight: '500', color: colors.textHeading },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  statCard: {
    width: '47%',
    flexGrow: 1,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.xs,
  },
  statLabelRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  statLabel: { fontFamily: typography.fontFamily, fontSize: 13, color: colors.textBody },
  statValue: { fontFamily: typography.fontFamily, fontSize: 24, fontWeight: '700', color: colors.textHeading },
  statSub: { fontFamily: typography.fontFamily, fontSize: 12, color: colors.textBody },
});
