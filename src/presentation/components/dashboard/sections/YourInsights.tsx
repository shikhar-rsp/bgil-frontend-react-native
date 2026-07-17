import React, { useState } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { Info, ArrowUpRight } from 'phosphor-react-native';
import { Badge, SegmentedControl, colors, spacing, radius, typography, shadow, fontFamilyForWeight } from '@atlas-ds/react-native';

type Range = 'weekly' | 'monthly' | 'yearly';

interface YourInsightsProps {
  /** When the demo "tour" is active the cards show populated figures. */
  isWalkthroughActive?: boolean;
}

const flatSeries = Array.from({ length: 7 }, () => ({ value: 100 }));
const growthSeries = [
  650, 680, 670, 695, 685, 710, 700, 730, 720, 750, 740, 770, 760, 790, 780, 810,
  800, 830, 820, 850, 840, 870, 860, 890, 880, 920, 950,
].map((value) => ({ value }));

export const YourInsights: React.FC<YourInsightsProps> = ({ isWalkthroughActive = false }) => {
  const [range, setRange] = useState<Range>('weekly');
  const { width } = useWindowDimensions();
  const data = isWalkthroughActive ? growthSeries : flatSeries;
  // Card padding (40) + screen gutters (32) on a single-column mobile layout.
  const chartWidth = Math.max(width - 120, 200);

  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Your Insights</Text>

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

      <View style={styles.premiumBlock}>
        <View style={styles.row}>
          <Text style={styles.premiumLabel}>Premium Generated</Text>
          <Info size={16} color={colors.textMuted} />
        </View>
        <Text style={styles.premiumValue}>₹ {isWalkthroughActive ? '88,000' : '0'}</Text>
        <View style={styles.badgeRow}>
          <Badge
            variant="light"
            size="sm"
            color="lime"
            label={isWalkthroughActive ? '↑ 32% from last week' : '↑ -'}
          />
        </View>
      </View>

      <View style={styles.chartWrap}>
        <LineChart
          data={data}
          height={90}
          width={chartWidth}
          color={colors.brand}
          thickness={2}
          hideDataPoints
          curved
          maxValue={1000}
          noOfSections={2}
          hideYAxisText
          yAxisThickness={0}
          xAxisThickness={0}
          hideRules={false}
          rulesColor={colors.borderSubtle}
          adjustToWidth
          disableScroll
        />
      </View>

      <View style={styles.statRow}>
        <StatCard label="Policies Sold" value={isWalkthroughActive ? '102' : '0'} />
        <StatCard label="Renewals Done" value={isWalkthroughActive ? '56' : '0'} />
      </View>
    </View>
  );
};

const StatCard: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.statCard}>
    <View style={styles.statTextWrap}>
      <View style={styles.row}>
        <Text style={styles.statLabel}>{label}</Text>
        <Info size={14} color={colors.textMuted} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
    </View>
    <ArrowUpRight size={16} color={colors.textBody} />
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadow.lg,
  },
  heading: { fontFamily: fontFamilyForWeight('500'), fontSize: 20, color: colors.textHeading },
  premiumBlock: { gap: spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  premiumLabel: { fontFamily: typography.fontFamily, fontSize: 15, color: colors.textBody },
  premiumValue: { fontFamily: typography.fontFamily, fontSize: 30, fontWeight: '700', color: colors.textHeading },
  badgeRow: { flexDirection: 'row', marginTop: spacing.xs },
  chartWrap: { marginVertical: spacing.sm, overflow: 'hidden' },
  statRow: { flexDirection: 'row', gap: spacing.sm },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  statTextWrap: { gap: spacing.xs },
  statLabel: { fontFamily: typography.fontFamily, fontSize: 13, color: colors.textBody },
  statValue: { fontFamily: typography.fontFamily, fontSize: 26, fontWeight: '700', color: colors.textHeading },
});
