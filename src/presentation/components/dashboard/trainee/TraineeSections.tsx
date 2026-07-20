import React, { useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Eye, DownloadSimple, FileText, ArrowUpRight, CalendarBlank, Clock, ArrowRight } from 'phosphor-react-native';
import { Button, Badge, SegmentedControl, colors, spacing, radius, typography, shadow } from '@atlas-ds/react-native';
import { dashboardImages } from '../images';

type Range = 'weekly' | 'monthly' | 'yearly';

const Card: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <View style={styles.card}>{children}</View>
);

/** Endpoint on the 130-radius gauge arc at `angleDeg` (180°=left, 0°=right). */
const gaugePoint = (angleDeg: number) => {
  const a = (angleDeg * Math.PI) / 180;
  return { x: 150 + 130 * Math.cos(a), y: 150 - 130 * Math.sin(a) };
};

/** Semi-circular gauge with a green progress arc for premium generated. */
const Gauge: React.FC<{ value: number; progress: number }> = ({ value, progress }) => {
  const clamped = Math.max(0, Math.min(1, progress));
  const end = gaugePoint(180 * (1 - clamped));
  const progressPath = `M20 150 A130 130 0 0 1 ${end.x.toFixed(1)} ${end.y.toFixed(1)}`;
  return (
    <View style={styles.gauge}>
      <Svg viewBox="0 0 300 160" width="100%" height="100%">
        <Path d="M20 150 A130 130 0 0 1 280 150" stroke={colors.borderSubtle} strokeWidth={14} fill="none" strokeLinecap="round" />
        {clamped > 0 ? (
          <Path d={progressPath} stroke="#65A30D" strokeWidth={14} fill="none" strokeLinecap="round" />
        ) : null}
      </Svg>
      <View style={styles.gaugeCenter}>
        <Text style={styles.gaugeLabel}>Premium generated</Text>
        <Text style={styles.gaugeValue}>{`₹${value.toLocaleString('en-IN')}`}</Text>
      </View>
    </View>
  );
};

type TraineeStat = {
  label: string;
  value: string;
  /** Colour of the leading status dot (goal stats only). */
  dot?: string;
  /** Green "N more to go!" pill (goal stats only). */
  pill?: string;
  /** Footer sub-text (metric stats). */
  sub?: string;
  /** Show the corner "open" arrow (metric stats). */
  arrow?: boolean;
};

const TRAINEE_STATS: TraineeStat[] = [
  { label: 'Meetings done', value: '10', dot: '#EA580C', pill: '5 more to go!' },
  { label: 'Policies Sold', value: '7', dot: '#2563EB', pill: '3 more to go!' },
  { label: 'Total Quotes Share', value: '0', sub: 'Due this week: 0', arrow: true },
  { label: 'Lapsed Policies', value: '0', arrow: true },
  { label: 'Total Renewals', value: '0', sub: 'Pending: 0', arrow: true },
  { label: 'No. of claims', value: '0', arrow: true },
];

const StatCard: React.FC<{ stat: TraineeStat }> = ({ stat }) => (
  <View style={styles.statCard}>
    <View style={styles.statLabelRow}>
      {stat.dot ? <View style={[styles.statDot, { backgroundColor: stat.dot }]} /> : null}
      <Text style={styles.statLabel}>{stat.label}</Text>
    </View>
    {stat.pill ? (
      <View style={styles.statValueRow}>
        <Text style={styles.statValue}>{stat.value}</Text>
        <View style={styles.statPill}>
          <Text style={styles.statPillText}>{stat.pill}</Text>
        </View>
      </View>
    ) : (
      <>
        <Text style={styles.statValue}>{stat.value}</Text>
        <View style={styles.statFooter}>
          <Text style={styles.statSub}>{stat.sub ?? ''}</Text>
          {stat.arrow ? <ArrowUpRight size={16} color={colors.textMuted} /> : null}
        </View>
      </>
    )}
  </View>
);

export const TraineeInsights: React.FC = () => {
  const [range, setRange] = useState<Range>('weekly');
  return (
    <Card>
      <View>
        <Text style={styles.heading}>Your Insights</Text>
        <Text style={styles.subtitle}>Sell 10 policies or 15 meetings to become an agent!</Text>
      </View>
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
      <Gauge value={25000} progress={0.6} />
      <View style={styles.gaugeScale}>
        <Text style={styles.scaleText}>Trainee</Text>
        <Text style={styles.scaleText}>Novice</Text>
      </View>
      <View style={styles.statsGrid}>
        {TRAINEE_STATS.map((s) => (
          <StatCard key={s.label} stat={s} />
        ))}
      </View>
    </Card>
  );
};

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

type TrainingSession = {
  id: string;
  title: string;
  mode: 'Virtual' | 'Physical';
  date: string;
  time: string;
  /** Highlights the card (orange border + "Attend Today!" pill + call buttons). */
  attendToday?: boolean;
};

const SESSIONS: TrainingSession[] = [
  { id: '1', title: 'Common questions about Health Insurance', mode: 'Virtual', date: "11th Jan '26", time: '11am - 12am', attendToday: true },
  { id: '2', title: 'Personal growth with Bajaj Visionaries', mode: 'Virtual', date: "12th Jan '26", time: '1:20pm - 2:00pm' },
  { id: '3', title: 'Common questions about Health Insurance', mode: 'Physical', date: "12th Jan '26", time: '1:20pm - 2:00pm' },
];

const ModeBadge: React.FC<{ mode: TrainingSession['mode'] }> = ({ mode }) => (
  <Badge label={mode} variant="light" size="sm" color={mode === 'Virtual' ? 'emerald' : 'violet'} />
);

const MetaItem: React.FC<{ icon: React.ReactNode; text: string }> = ({ icon, text }) => (
  <View style={styles.metaItem}>
    {icon}
    <Text style={styles.metaText}>{text}</Text>
  </View>
);

const SessionCard: React.FC<{ session: TrainingSession }> = ({ session }) => (
  <View style={[styles.sessionCard, session.attendToday && styles.sessionHighlight]}>
    {session.attendToday ? (
      <View style={styles.attendPill}>
        <Text style={styles.attendPillText}>Attend Today!</Text>
      </View>
    ) : null}

    <Text style={styles.sessionTitle}>{session.title}</Text>

    <View style={styles.metaRow}>
      {session.attendToday ? <ModeBadge mode={session.mode} /> : null}
      <MetaItem icon={<CalendarBlank size={15} color={colors.textMuted} />} text={session.date} />
      <MetaItem icon={<Clock size={15} color={colors.textMuted} />} text={session.time} />
    </View>

    {session.attendToday ? (
      <View style={styles.buttonRow}>
        <Button label="View Details" variant="secondaryGray" size="sm" style={styles.flexBtn} onPress={() => undefined} />
        <Button label="Join Call" variant="primary" size="sm" style={styles.flexBtn} onPress={() => undefined} />
      </View>
    ) : (
      <View style={styles.footerRow}>
        <Button
          label={session.mode === 'Virtual' ? 'Meeting Link' : 'View Location'}
          variant="secondary"
          size="sm"
          trailingIcon={<ArrowRight size={16} color={colors.brandPressed} />}
          onPress={() => undefined}
        />
        <ModeBadge mode={session.mode} />
      </View>
    )}
  </View>
);

export const TrainingSchedule: React.FC<{ onScheduleSession: () => void }> = ({ onScheduleSession }) => (
  <Card>
    <View style={styles.scheduleHeaderRow}>
      <Text style={[styles.heading, styles.flexBtn]}>Your Training Schedule</Text>
      {SESSIONS.length > 0 ? (
        <Button label="View Unscheduled" variant="link" size="sm" onPress={() => undefined} />
      ) : null}
    </View>

    {SESSIONS.length === 0 ? (
      <View style={styles.empty}>
        <Image source={dashboardImages.hat} style={styles.hat} resizeMode="contain" />
        <Text style={styles.emptyTitle}>You do not have any training sessions scheduled as of now.</Text>
        <Text style={styles.emptyBody}>Schedule a training session and grow as an insurance agent!</Text>
        <Button label="Schedule a Session" size="sm" onPress={onScheduleSession} />
      </View>
    ) : (
      SESSIONS.map((session) => <SessionCard key={session.id} session={session} />)
    )}
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
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  statCard: { width: '47%', flexGrow: 1, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.lg, padding: spacing.md, gap: spacing.xs, minHeight: 96 },
  statLabelRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  statDot: { width: 8, height: 8, borderRadius: 4 },
  statLabel: { fontFamily: typography.fontFamily, fontSize: 13, color: colors.textBody },
  statValue: { fontFamily: typography.fontFamily, fontSize: 26, fontWeight: '600', color: colors.textHeading },
  statValueRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  statPill: { backgroundColor: '#F0FDF4', borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 2, alignSelf: 'center' },
  statPillText: { fontFamily: typography.fontFamily, fontSize: 11, color: '#16A34A' },
  statFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' },
  statSub: { fontFamily: typography.fontFamily, fontSize: 12, color: colors.textBody },
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
  scheduleHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.sm },
  sessionCard: { borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm },
  sessionHighlight: { borderColor: '#FDBA74', borderWidth: 1.5 },
  attendPill: { alignSelf: 'flex-start', backgroundColor: '#F59E0B', borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: 3 },
  attendPillText: { fontFamily: typography.fontFamily, fontSize: 12, fontWeight: '600', color: '#FFFFFF' },
  sessionTitle: { fontFamily: typography.fontFamily, fontSize: 16, fontWeight: '600', color: colors.textHeading },
  metaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.md },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  metaText: { fontFamily: typography.fontFamily, fontSize: 13, color: colors.textBody },
  buttonRow: { flexDirection: 'row', gap: spacing.sm },
  flexBtn: { flex: 1 },
  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
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
