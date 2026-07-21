import React, { useState } from 'react';
import { View, Text, Image, useWindowDimensions, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { Info, CaretRight, ArrowUpRight, MapPin, Clock, User } from 'phosphor-react-native';
import {
  Button,
  Badge,
  SegmentedControl,
  DatePicker,
  colors,
  spacing,
  radius,
  typography,
  shadow,
  fontFamilyForWeight,
} from '@atlas-ds/react-native';
import { dashboardImages } from '../images';

type Range = 'weekly' | 'monthly' | 'yearly';

/** Familjen Grotesk semibold for headline figures. */
const NUMERIC_FONT = 'FamiljenGrotesk-SemiBold';

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

// ---------------------------------------------------------------------------
// Shared bits
// ---------------------------------------------------------------------------

/** Green "↑ 32% from last month" delta chip. */
const DeltaPill: React.FC<{ text: string }> = ({ text }) => (
  <View style={styles.badgeRow}>
    <Badge label={`↑ ${text}`} variant="light" size="sm" color="lime" />
  </View>
);

/** Line chart with a labelled y-max and start/end x labels. */
const TrendChart: React.FC<{
  data: { value: number }[];
  color: string;
  topLabel: string;
  startLabel: string;
  endLabel: string;
}> = ({ data, color, topLabel, startLabel, endLabel }) => {
  const { width } = useWindowDimensions();
  const peak = Math.max(...data.map((d) => d.value));
  return (
    <View style={styles.chartBlock}>
      <View style={styles.chartRow}>
        <View style={styles.yAxis}>
          <Text style={styles.axisText}>{topLabel}</Text>
          <Text style={styles.axisText}>0</Text>
        </View>
        <View style={styles.chartWrap}>
          <LineChart
            data={data}
            height={70}
            width={Math.max(width - 150, 180)}
            color={color}
            thickness={2}
            hideDataPoints
            curved
            maxValue={peak * 1.2}
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
        <Text style={styles.axisText}>{startLabel}</Text>
        <Text style={styles.axisText}>{endLabel}</Text>
      </View>
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

// ---------------------------------------------------------------------------
// Goal sheet
// ---------------------------------------------------------------------------

type Meeting = {
  id: string;
  name: string;
  status: 'Completed' | 'Pending';
  place: string;
  time: string;
  code: string;
};

/** Empty this array to fall back to the "no meetings" state. */
const MEETINGS: Meeting[] = [
  { id: '1', name: 'Shankar Kapoor', status: 'Completed', place: 'Bajaj Office', time: '11:30 AM', code: 'IMD9738866' },
  { id: '2', name: 'Shankar Kapoor', status: 'Completed', place: 'Bajaj Office', time: '11:30 AM', code: 'IMD9738866' },
  { id: '3', name: 'Shankar Kapoor', status: 'Completed', place: 'Bajaj Office', time: '11:30 AM', code: 'IMD9738866' },
  { id: '4', name: 'Vaibhav Kapoor', status: 'Completed', place: 'Bajaj Office', time: '11:30 AM', code: 'IMD9738866' },
  { id: '5', name: 'Vishal Kumar', status: 'Pending', place: 'Bajaj Office', time: '11:30 AM', code: 'IMD9738866' },
  { id: '6', name: 'Nikhil Gadkar', status: 'Pending', place: 'Bajaj Office', time: '11:30 AM', code: 'IMD9738866' },
];

const MetaItem: React.FC<{ icon: React.ReactNode; text: string }> = ({ icon, text }) => (
  <View style={styles.metaItem}>
    {icon}
    <Text style={styles.metaText}>{text}</Text>
  </View>
);

const MeetingCard: React.FC<{ meeting: Meeting }> = ({ meeting }) => (
  <View style={styles.meetingCard}>
    <View style={styles.meetingTop}>
      <Text style={styles.meetingName} numberOfLines={1}>
        {meeting.name}
      </Text>
      <Badge
        label={meeting.status}
        variant="light"
        size="sm"
        color={meeting.status === 'Completed' ? 'lime' : 'red'}
      />
    </View>
    <View style={styles.meetingMetaRow}>
      <MetaItem icon={<MapPin size={15} color={colors.textMuted} />} text={meeting.place} />
      <MetaItem icon={<Clock size={15} color={colors.textMuted} />} text={meeting.time} />
    </View>
    <MetaItem icon={<User size={15} color={colors.textMuted} />} text={meeting.code} />
  </View>
);

/** Today's Tasks — meetings progress plus the day's meeting list. */
export const GoalsSheet: React.FC = () => {
  const done = MEETINGS.filter((m) => m.status === 'Completed').length;
  const remaining = MEETINGS.length - done;

  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Today's Tasks</Text>

      {MEETINGS.length === 0 ? (
        <View style={styles.empty}>
          <Image source={dashboardImages.calendar} style={styles.emptyImg} resizeMode="contain" />
          <Text style={styles.emptyText}>Yay! You have no meetings for today!</Text>
        </View>
      ) : (
        <>
          <View style={styles.headerRow}>
            <Text style={styles.meetingsLabel}>Meetings Done</Text>
            <Button
              label="View All Meetings"
              variant="link"
              size="sm"
              trailingIcon={<CaretRight size={14} color={colors.brand} />}
              onPress={() => undefined}
            />
          </View>

          <View style={styles.doneRow}>
            <Text style={styles.doneValue}>{`${done}/${MEETINGS.length}`}</Text>
            {remaining > 0 ? (
              <Badge label={`${remaining} remaining!`} variant="solid" size="sm" color="red" />
            ) : null}
          </View>

          <Text style={styles.completedLabel}>Completed Meetings</Text>

          <View style={styles.meetingList}>
            {MEETINGS.map((meeting) => (
              <MeetingCard key={meeting.id} meeting={meeting} />
            ))}
          </View>
        </>
      )}
    </View>
  );
};

// ---------------------------------------------------------------------------
// Consolidated premium
// ---------------------------------------------------------------------------

const premiumSeries = [28, 30, 29, 34, 33, 38, 42, 40, 46, 50, 48, 55].map((value) => ({ value }));

type PremiumStat = {
  label: string;
  value: string;
  /** Show the corner "open" arrow. */
  arrow?: boolean;
  /** Footer prefix, e.g. "Due this week:". */
  sub?: string;
  /** Highlighted footer number. */
  subValue?: string;
  /** Colour for `subValue` (e.g. success for due, danger for pending). */
  subColor?: string;
  /** Red "Alert!" chip instead of a footer. */
  alert?: boolean;
};

const PREMIUM_STATS: PremiumStat[] = [
  { label: 'Policies Sold', value: '102', arrow: true },
  { label: 'Renewals Done', value: '56', arrow: true },
  { label: 'Total Quotes Shared', value: '101', sub: 'Due this week:', subValue: '21', subColor: colors.success },
  { label: 'Lapsed Policies', value: '23', alert: true },
  { label: 'Total Renewals', value: '32', sub: 'Pending:', subValue: '21', subColor: colors.danger },
  { label: 'No. of claims', value: '45' },
];

const PremiumStatCard: React.FC<{ stat: PremiumStat }> = ({ stat }) => (
  <View style={styles.gridStat}>
    <Text style={styles.miniLabel}>{stat.label}</Text>
    <View style={styles.gridValueRow}>
      <Text style={styles.miniValue}>{stat.value}</Text>
      {stat.arrow ? <ArrowUpRight size={16} color={colors.textBody} /> : null}
    </View>
    {stat.alert ? (
      <Badge label="Alert!" variant="solid" size="sm" color="red" />
    ) : stat.sub ? (
      <Text style={styles.miniSub}>
        {`${stat.sub} `}
        <Text style={[styles.subHighlight, stat.subColor ? { color: stat.subColor } : null]}>
          {stat.subValue}
        </Text>
      </Text>
    ) : null}
  </View>
);

/** Consolidated Premium — premium total, trend chart and six stat cards. */
export const ConsolidatedPremium: React.FC = () => {
  const [range, setRange] = useState<Range>('weekly');
  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Consolidated premium</Text>
      <RangeControl value={range} onChange={setRange} />

      <View style={styles.premiumBlock}>
        <View style={styles.premiumLabelRow}>
          <Text style={styles.premiumLabel}>Premium Generated</Text>
          <Info size={14} color={colors.textMuted} />
        </View>
        <Text style={styles.premiumValue}>₹ 3,45,10,000</Text>
        <DeltaPill text="32% from last month" />
      </View>

      <TrendChart
        data={premiumSeries}
        color={colors.brandBlue400}
        topLabel="100x"
        startLabel="Jan"
        endLabel="Dec"
      />

      <View style={styles.statsGrid}>
        {PREMIUM_STATS.map((stat) => (
          <PremiumStatCard key={stat.label} stat={stat} />
        ))}
      </View>
    </View>
  );
};

// ---------------------------------------------------------------------------
// Focus LOBs
// ---------------------------------------------------------------------------

const healthSeries = [20, 24, 22, 28, 27, 32, 36, 34, 40, 44].map((value) => ({ value }));
const motorSeries = [16, 19, 18, 23, 21, 26, 29, 28, 33, 36].map((value) => ({ value }));

const LobCard: React.FC<{
  title: string;
  value: string;
  target: string;
  data: { value: number }[];
  color: string;
}> = ({ title, value, target, data, color }) => (
  <View style={styles.lobCard}>
    <View style={styles.row}>
      <Text style={styles.lobTitle}>{title}</Text>
      <Info size={14} color={colors.textMuted} />
    </View>
    <Text style={styles.lobValue}>{value}</Text>
    <Text style={styles.lobTarget}>
      {'Target: '}
      <Text style={styles.lobTargetValue}>{target}</Text>
    </Text>
    <TrendChart data={data} color={color} topLabel="100" startLabel="9am" endLabel="10pm" />
  </View>
);

/** Focus LOBs — date-scoped LOB premium cards, stacked one per row. */
export const FocusLOBs: React.FC = () => {
  const [date, setDate] = useState<Date | null>(new Date(2026, 6, 20));
  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Focus LOBs</Text>
      <DatePicker value={date} onChange={setDate} placeholder="Select date" />
      <View style={styles.lobColumn}>
        <LobCard
          title="Fresh Health Premium"
          value="₹ 4.5Cr"
          target="Rs. 6,50,00,000"
          data={healthSeries}
          color={colors.brandBlue400}
        />
        <LobCard
          title="Private Car Premium"
          value="₹ 4.5Cr"
          target="Rs. 6,50,00,000"
          data={motorSeries}
          color="#F97316"
        />
      </View>
    </View>
  );
};

// ---------------------------------------------------------------------------
// Agent's data
// ---------------------------------------------------------------------------

type AgentRange = 'today' | 'monthly' | 'yearly';

type AgentStatEntry = { label: string; value: string; delta?: string };

/** Empty this array to fall back to the zero-state cards. */
const AGENT_STATS: AgentStatEntry[] = [
  { label: 'Recruited agents', value: '102', delta: '32% from last month' },
  { label: 'Active agents', value: '102', delta: '32% from last month' },
];

const AgentStatCard: React.FC<{ stat: AgentStatEntry }> = ({ stat }) => (
  <View style={styles.miniStat}>
    <Text style={styles.miniLabel}>{stat.label}</Text>
    <Text style={styles.miniValue}>{stat.value}</Text>
    {stat.delta ? <DeltaPill text={stat.delta} /> : null}
  </View>
);

/** Agent's Data — recruited/active agents, with a zero-state fallback. */
export const AgentsData: React.FC = () => {
  const [range, setRange] = useState<AgentRange>('today');
  const hasData = AGENT_STATS.length > 0;
  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Agent's Data</Text>
      <SegmentedControl
        size="sm"
        value={range}
        onChange={(v) => setRange(v as AgentRange)}
        options={[
          { value: 'today', label: 'Today' },
          { value: 'monthly', label: 'Monthly' },
          { value: 'yearly', label: 'Yearly' },
        ]}
      />
      <View style={styles.colStats}>
        {hasData ? (
          AGENT_STATS.map((stat) => <AgentStatCard key={stat.label} stat={stat} />)
        ) : (
          <>
            <MiniStat label="Recruited Agents" value="0" />
            <MiniStat label="Active Agents" value="0" />
          </>
        )}
      </View>
    </View>
  );
};

// ---------------------------------------------------------------------------
// Agent insights
// ---------------------------------------------------------------------------

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
  heading: { fontFamily: fontFamilyForWeight('500'), fontSize: 20, fontWeight: '500', color: colors.textHeading },
  empty: { alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingVertical: spacing.xl },
  emptyImg: { width: 80, height: 80 },
  emptyText: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textBody },
  // Today's Tasks — meetings
  meetingsLabel: { fontFamily: typography.fontFamily, fontSize: 15, color: colors.textBody },
  // Badge shares the line with the count, sitting on its bottom edge.
  doneRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.md },
  doneValue: { fontFamily: NUMERIC_FONT, fontSize: 30, color: colors.textHeading },
  completedLabel: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textBody },
  meetingList: { gap: spacing.md },
  meetingCard: {
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.xs,
  },
  // Status badge sits immediately after the name, not pushed to the far edge.
  meetingTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  meetingName: { flexShrink: 1, fontFamily: typography.fontFamily, fontSize: 15, color: colors.textHeading },
  meetingMetaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.lg },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  metaText: { fontFamily: typography.fontFamily, fontSize: 13, color: colors.textBody },
  // Premium block
  premiumBlock: { gap: spacing.xs },
  premiumLabelRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  premiumLabel: { fontFamily: typography.fontFamily, fontSize: 15, color: colors.textBody },
  premiumValue: { fontFamily: NUMERIC_FONT, fontSize: 32, color: colors.textHeading },
  // Row wrapper so badges hug their content instead of stretching.
  badgeRow: { flexDirection: 'row' },
  // Chart
  chartBlock: { gap: spacing.xs },
  chartRow: { flexDirection: 'row', gap: spacing.xs },
  yAxis: { height: 70, justifyContent: 'space-between' },
  axisRow: { flexDirection: 'row', justifyContent: 'space-between', paddingLeft: 28 },
  axisText: { fontFamily: typography.fontFamily, fontSize: 10, color: colors.textMuted },
  chartWrap: { flex: 1, overflow: 'hidden' },
  // Stat cards
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  gridStat: {
    width: '47%',
    flexGrow: 1,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.xxs,
    minHeight: 92,
  },
  gridValueRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  // Colour comes from the stat (success for due, danger for pending).
  subHighlight: { fontFamily: fontFamilyForWeight('500') },
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
  miniValue: { fontFamily: NUMERIC_FONT, fontSize: 28, color: colors.textHeading },
  miniSub: { fontFamily: typography.fontFamily, fontSize: 12, color: colors.textBody },
  // Focus LOBs — one card per row.
  lobColumn: { gap: spacing.md },
  lobCard: {
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.xxs,
  },
  lobTitle: { fontFamily: typography.fontFamily, fontSize: 13, color: colors.textBody },
  lobValue: { fontFamily: NUMERIC_FONT, fontSize: 30, color: colors.textHeading },
  // "Target:" stays regular; only the amount is Rubik 500.
  lobTarget: { fontFamily: typography.fontFamily, fontSize: 13, color: colors.textBody },
  lobTargetValue: { fontFamily: fontFamilyForWeight('500'), color: colors.textHeading },
});
