import React, { useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Eye, DownloadSimple, FileText, ArrowUpRight } from 'phosphor-react-native';
import { Button, SegmentedControl, colors, spacing, radius, typography, shadow } from '@atlas-ds/react-native';
import { dashboardImages } from '../images';

type Range = 'weekly' | 'monthly' | 'yearly';

const Card: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <View style={styles.card}>{children}</View>
);

/** Semi-circular gauge (web SVG arc) for premium progress. */
const Gauge: React.FC<{ value: number }> = ({ value }) => (
  <View style={styles.gauge}>
    <Svg viewBox="0 0 300 160" width="100%" height="100%">
      <Path d="M20 150 A130 130 0 0 1 280 150" stroke={colors.borderSubtle} strokeWidth={14} fill="none" strokeLinecap="round" />
    </Svg>
    <View style={styles.gaugeCenter}>
      <Text style={styles.gaugeLabel}>Premium generated</Text>
      <Text style={styles.gaugeValue}>{value === 0 ? '0' : `₹ ${value.toLocaleString('en-IN')}`}</Text>
    </View>
  </View>
);

export const TraineeInsights: React.FC = () => (
  <Card>
    <View>
      <Text style={styles.heading}>Your Insights</Text>
      <Text style={styles.subtitle}>Sell 10 policies or 15 meetings to become an agent!</Text>
    </View>
    <Gauge value={0} />
    <View style={styles.gaugeScale}>
      <Text style={styles.scaleText}>Trainee</Text>
      <Text style={styles.scaleText}>Novice</Text>
    </View>
    <View style={styles.goalRow}>
      <GoalStat label="Meetings done" value="0" remaining="15 more to go!" />
      <Text style={styles.orText}>OR</Text>
      <GoalStat label="Policies Sold" value="0" remaining="10 more to go!" />
    </View>
  </Card>
);

const GoalStat: React.FC<{ label: string; value: string; remaining: string }> = ({ label, value, remaining }) => (
  <View style={styles.goalStat}>
    <Text style={styles.goalLabel}>{label}</Text>
    <Text style={styles.goalValue}>{value}</Text>
    <View style={styles.goalPill}>
      <Text style={styles.goalPillText}>{remaining}</Text>
    </View>
  </View>
);

const WINNERS = [
  { rank: 2 as const, name: 'PXXX TXXXX', score: 98, medal: 'silver' as const },
  { rank: 1 as const, name: 'JXX DXXXXX', score: 98, medal: 'gold' as const },
  { rank: 3 as const, name: 'DXXX PXXXX', score: 98, medal: 'bronze' as const },
];
const ENTRIES = [
  { rank: 4, name: 'Rajesh Chaurasia', score: 94 },
  { rank: 5, name: 'VXXXX KXXXX', score: 91 },
  { rank: 6, name: 'SXXXX KXXXX', score: 88 },
  { rank: 7, name: 'RXXXX MXXXX', score: 85 },
];

export const Leaderboard: React.FC = () => (
  <Card>
    <View style={styles.headerRow}>
      <Text style={styles.heading}>Leaderboard</Text>
      <Button label="View All" variant="link" size="sm" onPress={() => undefined} />
    </View>
    <View style={styles.podium}>
      {WINNERS.map((w) => (
        <View key={w.rank} style={styles.podiumCard}>
          <Image source={dashboardImages[w.medal]} style={styles.medal} resizeMode="contain" />
          <Text style={styles.podiumName}>{w.name}</Text>
          <Text style={styles.podiumScore}>Score: {w.score}</Text>
        </View>
      ))}
    </View>
    <View style={styles.entryTable}>
      <View style={styles.entryHeader}>
        <Text style={[styles.entryHeaderText, styles.colRank]}>Rank</Text>
        <Text style={[styles.entryHeaderText, styles.colName]}>Name</Text>
        <Text style={[styles.entryHeaderText, styles.colScore]}>Score</Text>
      </View>
      {ENTRIES.map((e) => (
        <View key={e.rank} style={styles.entryRow}>
          <Text style={[styles.entryCell, styles.colRank]}>{e.rank}</Text>
          <Text style={[styles.entryCell, styles.colName]}>{e.name}</Text>
          <Text style={[styles.entryCell, styles.colScore]}>{e.score}</Text>
        </View>
      ))}
    </View>
  </Card>
);

export const TrainingSchedule: React.FC<{ onScheduleSession: () => void }> = ({ onScheduleSession }) => (
  <Card>
    <Text style={styles.heading}>Your Training Schedule</Text>
    <View style={styles.empty}>
      <Image source={dashboardImages.hat} style={styles.hat} resizeMode="contain" />
      <Text style={styles.emptyTitle}>You do not have any training sessions scheduled as of now.</Text>
      <Text style={styles.emptyBody}>Schedule a training session and grow as an insurance agent!</Text>
      <Button label="Schedule a Session" size="sm" onPress={onScheduleSession} />
    </View>
  </Card>
);

export const ResourcesAndBrochures: React.FC = () => (
  <Card>
    <Text style={styles.heading}>Resources and brochures</Text>
    <View style={styles.resourceList}>
      {Array.from({ length: 5 }).map((_, i) => (
        <View key={i} style={styles.resourceRow}>
          <View style={styles.resourceLeft}>
            <View style={styles.resourceIcon}>
              <FileText size={18} color={colors.textBody} />
            </View>
            <Text style={styles.resourceTitle} numberOfLines={1}>
              Health Guard Policy...
            </Text>
          </View>
          <View style={styles.resourceActions}>
            <Pressable accessibilityRole="button" accessibilityLabel="Preview" hitSlop={8}>
              <Eye size={18} color={colors.textBody} />
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Download" hitSlop={8}>
              <DownloadSimple size={18} color={colors.textBody} />
            </Pressable>
          </View>
        </View>
      ))}
    </View>
  </Card>
);

const METRICS = [
  { label: 'Total Quotes Shared', value: '0', sub: 'Due this week: 0' },
  { label: 'Lapsed Policies', value: '0' },
  { label: 'Total Renewals', value: '0', sub: 'Pending: 0' },
  { label: 'No. of claims', value: '0' },
];

export const TraineeBusinessInsights: React.FC = () => {
  const [range, setRange] = useState<Range>('weekly');
  return (
    <Card>
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
      <View style={styles.metricsGrid}>
        {METRICS.map((m) => (
          <View key={m.label} style={styles.metricCard}>
            <Text style={styles.metricLabel}>{m.label}</Text>
            <Text style={styles.metricValue}>{m.value}</Text>
            <View style={styles.metricFooter}>
              <Text style={styles.metricSub}>{m.sub ?? ''}</Text>
              <ArrowUpRight size={16} color={colors.textMuted} />
            </View>
          </View>
        ))}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.lg,
    ...shadow.lg,
  },
  heading: { fontFamily: typography.fontFamily, fontSize: 20, fontWeight: '500', color: colors.textHeading },
  subtitle: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textBody, marginTop: spacing.xxs },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  gauge: { width: '100%', aspectRatio: 2, alignSelf: 'center', maxWidth: 320 },
  gaugeCenter: { position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: spacing.sm },
  gaugeLabel: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textBody },
  gaugeValue: { fontFamily: typography.fontFamily, fontSize: 28, fontWeight: '600', color: colors.textHeading },
  gaugeScale: { flexDirection: 'row', justifyContent: 'space-between', maxWidth: 320, alignSelf: 'center', width: '100%' },
  scaleText: { fontFamily: typography.fontFamily, fontSize: 13, color: colors.textMuted },
  goalRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  goalStat: { flex: 1, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.lg, padding: spacing.md, gap: spacing.xxs },
  goalLabel: { fontFamily: typography.fontFamily, fontSize: 13, color: colors.textBody },
  goalValue: { fontFamily: typography.fontFamily, fontSize: 26, fontWeight: '600', color: colors.textHeading },
  goalPill: { alignSelf: 'flex-start', backgroundColor: '#FFF7ED', borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  goalPillText: { fontFamily: typography.fontFamily, fontSize: 11, color: '#C2410C' },
  orText: { fontFamily: typography.fontFamily, fontSize: 13, fontWeight: '500', color: colors.textMuted },
  podium: { flexDirection: 'row', gap: spacing.sm },
  podiumCard: { flex: 1, alignItems: 'center', gap: spacing.xs, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.lg, padding: spacing.md, backgroundColor: colors.surfaceSubtle },
  medal: { width: 36, height: 36 },
  podiumName: { fontFamily: typography.fontFamily, fontSize: 13, fontWeight: '500', color: colors.textHeading },
  podiumScore: { fontFamily: typography.fontFamily, fontSize: 12, color: colors.textBody },
  entryTable: { borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.lg, overflow: 'hidden' },
  entryHeader: { flexDirection: 'row', backgroundColor: colors.surfaceMuted, paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  entryHeaderText: { fontFamily: typography.fontFamily, fontSize: 11, color: colors.textMuted, textTransform: 'uppercase' },
  entryRow: { flexDirection: 'row', paddingVertical: spacing.md, paddingHorizontal: spacing.md, borderTopWidth: 1, borderTopColor: colors.surfaceMuted },
  entryCell: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textHeading },
  colRank: { width: 50 },
  colName: { flex: 1 },
  colScore: { width: 50, textAlign: 'right' },
  empty: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xl },
  hat: { width: 64, height: 64 },
  emptyTitle: { fontFamily: typography.fontFamily, fontSize: 15, fontWeight: '600', color: colors.textHeading, textAlign: 'center' },
  emptyBody: { fontFamily: typography.fontFamily, fontSize: 13, color: colors.textMuted, textAlign: 'center' },
  resourceList: { borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.lg, overflow: 'hidden' },
  resourceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.surfaceMuted },
  resourceLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  resourceIcon: { width: 36, height: 36, borderRadius: radius.lg, backgroundColor: colors.surfaceSubtle, alignItems: 'center', justifyContent: 'center' },
  resourceTitle: { flex: 1, fontFamily: typography.fontFamily, fontSize: 15, color: colors.textHeading },
  resourceActions: { flexDirection: 'row', gap: spacing.lg },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  metricCard: { width: '47%', flexGrow: 1, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.lg, padding: spacing.md, gap: spacing.xs, minHeight: 110 },
  metricLabel: { fontFamily: typography.fontFamily, fontSize: 13, color: colors.textBody },
  metricValue: { fontFamily: typography.fontFamily, fontSize: 26, fontWeight: '600', color: colors.textHeading },
  metricFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' },
  metricSub: { fontFamily: typography.fontFamily, fontSize: 12, color: colors.textBody },
});
