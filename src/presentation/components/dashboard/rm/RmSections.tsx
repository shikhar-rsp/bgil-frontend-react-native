import React, { useState } from 'react';
import { View, Text, Image, useWindowDimensions, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { Info, CaretRight, ArrowUpRight } from 'phosphor-react-native';
import {
  Button,
  SegmentedControl,
  colors,
  spacing,
  radius,
  typography,
  shadow,
} from '@atlas-ds/react-native';
import { dashboardImages } from '../images';

type Range = 'weekly' | 'monthly' | 'yearly';

const RangeControl: React.FC<{ value: Range; onChange: (v: Range) => void }> = ({ value, onChange }) => (
  <SegmentedControl
    size="sm"
    value={value}
    onChange={(v) => onChange(v as Range)}
    options={[
      { value: 'weekly', label: 'Weekly' },
      { value: 'monthly', label: 'Monthly' },
      { value: 'yearly', label: 'Yearly' },
    ]}
  />
);

const zeroSeries = Array.from({ length: 7 }, () => ({ value: 0 }));

const ZeroChart: React.FC = () => {
  const { width } = useWindowDimensions();
  return (
    <View style={styles.chartWrap}>
      <LineChart
        data={zeroSeries}
        height={80}
        width={Math.max(width - 120, 200)}
        color={colors.brandBlue400}
        thickness={2}
        hideDataPoints
        maxValue={1000}
        noOfSections={2}
        hideYAxisText
        yAxisThickness={0}
        xAxisThickness={0}
        rulesColor={colors.borderSubtle}
        adjustToWidth
        disableScroll
      />
    </View>
  );
};

const MiniStat: React.FC<{ label: string; value: string; sub?: string }> = ({ label, value, sub }) => (
  <View style={styles.miniStat}>
    <View style={styles.row}>
      <Text style={styles.miniLabel}>{label}</Text>
      <Info size={14} color={colors.textMuted} />
    </View>
    <Text style={styles.miniValue}>{value}</Text>
    {sub ? <Text style={styles.miniSub}>{sub}</Text> : null}
  </View>
);

/** Today's Goal Sheets — empty meetings state. */
export const GoalsSheet: React.FC = () => (
  <View style={styles.card}>
    <View style={styles.headerRow}>
      <Text style={styles.heading}>Today's Goal Sheets</Text>
      <Button
        label="View All"
        variant="link"
        size="sm"
        trailingIcon={<CaretRight size={14} color={colors.brand} />}
        onPress={() => undefined}
      />
    </View>
    <View style={styles.empty}>
      <Image source={dashboardImages.calendar} style={styles.emptyImg} resizeMode="contain" />
      <Text style={styles.emptyText}>Yay! You have no meetings for today!</Text>
    </View>
  </View>
);

/** Consolidated Premium — segmented + premium + chart + 2 stats. */
export const ConsolidatedPremium: React.FC = () => {
  const [range, setRange] = useState<Range>('weekly');
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.heading}>Consolidated Premium</Text>
        <Info size={18} color={colors.textHeading} />
      </View>
      <RangeControl value={range} onChange={setRange} />
      <View>
        <View style={styles.row}>
          <Text style={styles.premiumLabel}>Premium Generated</Text>
          <Info size={14} color={colors.textMuted} />
        </View>
        <Text style={styles.premiumValue}>₹ 0</Text>
      </View>
      <ZeroChart />
      <View style={styles.statRow}>
        <MiniStat label="Policies Sold" value="0" />
        <MiniStat label="Renewals Done" value="0" />
      </View>
    </View>
  );
};

/** Focus LOBs — two LOB premium cards. */
export const FocusLOBs: React.FC = () => (
  <View style={styles.card}>
    <Text style={styles.heading}>Focus LOBs</Text>
    <View style={styles.lobRow}>
      <LobCard title="Fresh Health Premium" />
      <LobCard title="Private Car Premium" />
    </View>
  </View>
);

const LobCard: React.FC<{ title: string }> = ({ title }) => (
  <View style={styles.lobCard}>
    <View style={styles.row}>
      <Text style={styles.lobTitle}>{title}</Text>
      <Info size={14} color={colors.textMuted} />
    </View>
    <Text style={styles.lobValue}>0</Text>
    <Text style={styles.lobTarget}>Target: 0</Text>
    <ZeroChart />
  </View>
);

/** Agent's Data — recruited/active agents. */
export const AgentsData: React.FC = () => {
  const [range, setRange] = useState<Range>('weekly');
  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Agent's Data</Text>
      <RangeControl value={range} onChange={setRange} />
      <View style={styles.colStats}>
        <MiniStat label="Recruited Agents" value="0" />
        <MiniStat label="Active Agents" value="0" />
      </View>
    </View>
  );
};

/** Agent Insights — quotes/policies stats. */
export const AgentInsights: React.FC = () => {
  const [range, setRange] = useState<Range>('weekly');
  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Agent Insights</Text>
      <RangeControl value={range} onChange={setRange} />
      <View style={styles.colStats}>
        <View style={styles.miniStat}>
          <Text style={styles.miniLabel}>Total Quotes Shared</Text>
          <Text style={styles.miniValue}>0</Text>
          <View style={styles.row}>
            <Text style={styles.miniSub}>Due this week: 0</Text>
            <ArrowUpRight size={14} color={colors.textBody} />
          </View>
        </View>
        <View style={styles.miniStat}>
          <Text style={styles.miniLabel}>Lapsed Policies</Text>
          <Text style={styles.miniValue}>0</Text>
          <View style={styles.row}>
            <Text style={styles.miniSub}>Due this week: 0</Text>
            <ArrowUpRight size={14} color={colors.textBody} />
          </View>
        </View>
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
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  heading: { fontFamily: typography.fontFamily, fontSize: 20, fontWeight: '500', color: colors.textHeading },
  empty: { alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingVertical: spacing.xl },
  emptyImg: { width: 80, height: 80 },
  emptyText: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textBody },
  premiumLabel: { fontFamily: typography.fontFamily, fontSize: 15, color: colors.textBody },
  premiumValue: { fontFamily: typography.fontFamily, fontSize: 30, fontWeight: '700', color: colors.textHeading },
  chartWrap: { marginVertical: spacing.xs, overflow: 'hidden' },
  statRow: { flexDirection: 'row', gap: spacing.sm },
  colStats: { gap: spacing.sm },
  miniStat: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.xxs,
  },
  miniLabel: { fontFamily: typography.fontFamily, fontSize: 13, color: colors.textBody },
  miniValue: { fontFamily: typography.fontFamily, fontSize: 26, fontWeight: '700', color: colors.textHeading },
  miniSub: { fontFamily: typography.fontFamily, fontSize: 12, color: colors.textBody },
  lobRow: { flexDirection: 'row', gap: spacing.md, flexWrap: 'wrap' },
  lobCard: {
    flex: 1,
    minWidth: '45%',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.xxs,
  },
  lobTitle: { fontFamily: typography.fontFamily, fontSize: 13, color: colors.textBody },
  lobValue: { fontFamily: typography.fontFamily, fontSize: 26, fontWeight: '700', color: colors.textHeading },
  lobTarget: { fontFamily: typography.fontFamily, fontSize: 13, color: colors.textBody },
});
