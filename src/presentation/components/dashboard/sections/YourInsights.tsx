import React, { useState } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { Info, ArrowUpRight } from 'phosphor-react-native';
import {
  Badge,
  SegmentedControl,
  colors,
  spacing,
  radius,
  typography,
  shadow,
  fontFamilyForWeight,
} from '@atlas-ds/react-native';

type Range = 'weekly' | 'monthly' | 'yearly';

/**
 * Familjen Grotesk (semibold) for the headline figures — the premium total and
 * the stat-card values. Referenced by face name so it resolves on Android
 * (asset filename) and iOS (PostScript name) alike.
 */
const NUMERIC_FONT = 'FamiljenGrotesk-SemiBold';

interface YourInsightsProps {
  /** Kept for the guided tour — the card shows live figures either way. */
  isWalkthroughActive?: boolean;
}

const premiumSeries = [
  520, 560, 540, 600, 590, 640, 620, 680, 660, 710, 700, 740, 730, 780, 760, 800,
  790, 830, 820, 860, 850, 890, 880, 920, 910, 950, 980,
].map((value) => ({ value }));

type InsightStat = {
  label: string;
  value: string;
  /** Footer prefix, e.g. "Due this week:". */
  sub?: string;
  /** Highlighted footer number. */
  subValue?: string;
  /** Colour for `subValue`. */
  subColor?: string;
  /** Red "Alert!" chip instead of a footer. */
  alert?: boolean;
};

const STATS: InsightStat[] = [
  { label: 'Policies Sold', value: '102' },
  { label: 'Renewals Done', value: '56' },
  { label: 'Total Quotes Shared', value: '101', sub: 'Due this week:', subValue: '21', subColor: colors.success },
  { label: 'Lapsed Policies', value: '23', alert: true },
  { label: 'Total Renewals', value: '32', sub: 'Pending:', subValue: '21', subColor: colors.danger },
  { label: 'No. of claims', value: '45' },
];

const StatCard: React.FC<{ stat: InsightStat }> = ({ stat }) => (
  <View style={styles.statCard}>
    <Text style={styles.statLabel}>{stat.label}</Text>
    <Text style={styles.statValue}>{stat.value}</Text>
    <View style={styles.statFooter}>
      {stat.alert ? (
        <Badge label="Alert!" variant="solid" size="sm" color="red" />
      ) : stat.sub ? (
        <Text style={styles.statSub}>
          {`${stat.sub} `}
          <Text style={[styles.statSubValue, stat.subColor ? { color: stat.subColor } : null]}>
            {stat.subValue}
          </Text>
        </Text>
      ) : (
        <View />
      )}
      <ArrowUpRight size={16} color={colors.brandBlue400} />
    </View>
  </View>
);

/** "Your Insights" — premium generated, trend chart and six stat cards. */
export const YourInsights: React.FC<YourInsightsProps> = () => {
  const [range, setRange] = useState<Range>('weekly');
  const { width } = useWindowDimensions();
  // Card padding (32) + screen gutters (32) + the y-axis label column.
  const chartWidth = Math.max(width - 130, 200);

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
        <View style={styles.premiumLabelRow}>
          <Text style={styles.premiumLabel}>Premium Generated</Text>
          <Info size={16} color={colors.textMuted} />
        </View>
        <Text style={styles.premiumValue}>₹ 88,000</Text>
        <Badge label="↑ 32% from last week" variant="light" size="sm" color="lime" style={styles.deltaBadge} />
      </View>

      <View style={styles.chartBlock}>
        <View style={styles.chartRow}>
          <View style={styles.yAxis}>
            <Text style={styles.axisText}>1,000</Text>
            <Text style={styles.axisText}>0</Text>
          </View>
          <View style={styles.chartWrap}>
            <LineChart
              data={premiumSeries}
              height={80}
              width={chartWidth}
              color={colors.brandBlue400}
              thickness={2}
              hideDataPoints
              curved
              maxValue={1000}
              noOfSections={2}
              hideYAxisText
              yAxisThickness={0}
              xAxisThickness={0}
              rulesColor={colors.borderSubtle}
              adjustToWidth
              disableScroll
              initialSpacing={0}
            />
          </View>
        </View>
        <View style={styles.axisRow}>
          <Text style={styles.axisText}>Jan</Text>
          <Text style={styles.axisText}>Dec</Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        {STATS.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
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
    gap: spacing.md,
    ...shadow.lg,
  },
  heading: { fontFamily: fontFamilyForWeight('500'), fontSize: 20, color: colors.textHeading },
  // Premium
  premiumBlock: { gap: spacing.xs },
  premiumLabelRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  premiumLabel: { fontFamily: typography.fontFamily, fontSize: 15, color: colors.textBody },
  premiumValue: { fontFamily: NUMERIC_FONT, fontSize: 30, color: colors.textHeading },
  deltaBadge: { alignSelf: 'flex-start' },
  // Chart
  chartBlock: { gap: spacing.xs },
  chartRow: { flexDirection: 'row', gap: spacing.xs },
  yAxis: { height: 80, justifyContent: 'space-between' },
  axisRow: { flexDirection: 'row', justifyContent: 'space-between', paddingLeft: 40 },
  axisText: { fontFamily: typography.fontFamily, fontSize: 11, color: colors.textMuted },
  chartWrap: { flex: 1, overflow: 'hidden' },
  // Stats
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  statCard: {
    width: '47%',
    flexGrow: 1,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.xxs,
    minHeight: 96,
  },
  statLabel: { fontFamily: typography.fontFamily, fontSize: 13, color: colors.textBody },
  statValue: { fontFamily: NUMERIC_FONT, fontSize: 26, color: colors.textHeading },
  statFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  statSub: { fontFamily: typography.fontFamily, fontSize: 12, color: colors.textBody },
  statSubValue: { fontFamily: fontFamilyForWeight('500') },
});
