import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ArrowUpRight, Clock, DownloadSimple, GraduationCap } from 'phosphor-react-native';
import {
  Badge,
  Button,
  ProgressBar,
  Toast,
  colors,
  fontFamilyForWeight,
  radius,
  spacing,
  typography,
  type FilterGroup,
} from '@atlas-ds/react-native';
import { ToolkitCard, ToolkitEmptyState, ToolkitSheet } from './ToolkitSheet';
import { COURSES, COURSE_BADGE, inDateRange } from './toolkitData';

/** The web labels the `Upcoming` status "New" in the filter list. */
const FILTER_GROUPS: FilterGroup[] = [
  {
    key: 'status',
    label: 'Status',
    options: [
      { value: 'Upcoming', label: 'New' },
      { value: 'Active', label: 'Active' },
      { value: 'Completed', label: 'Completed' },
    ],
  },
];

interface LearningSheetProps {
  visible: boolean;
  onClose: () => void;
}

/** Learning — course list with progress and a per-status call to action. */
export const LearningSheet: React.FC<LearningSheetProps> = ({ visible, onClose }) => {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [start, setStart] = useState<Date | null>(null);
  const [end, setEnd] = useState<Date | null>(null);
  const [toast, setToast] = useState<{ title: string; message?: string } | null>(null);

  const statuses = filters.status ?? [];

  const courses = useMemo(() => {
    const term = search.trim().toLowerCase();
    return COURSES.filter(
      (c) =>
        (!term || c.title.toLowerCase().includes(term)) &&
        (statuses.length === 0 || statuses.includes(c.status)) &&
        inDateRange(c.createdDate, start, end),
    );
  }, [search, statuses, start, end]);

  return (
    <ToolkitSheet
      visible={visible}
      onClose={onClose}
      title="Learning"
      icon={<GraduationCap size={20} color={colors.brand} />}
      search={search}
      onSearchChange={setSearch}
      filterGroups={FILTER_GROUPS}
      filterValues={filters}
      onFilterChange={setFilters}
      rangeStart={start}
      rangeEnd={end}
      onDateRangeChange={(s, e) => {
        setStart(s);
        setEnd(e);
      }}
      sectionTitle="All Courses"
      sectionHint="Courses assigned to you, plus the ones you have already finished."
      banner={
        toast ? (
          <Toast
            variant="success"
            title={toast.title}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        ) : null
      }
      primaryAction={{ label: 'Go to Learning Module', onPress: onClose }}
    >
      {courses.length === 0 ? (
        <ToolkitEmptyState />
      ) : (
        courses.map((course) => (
          <ToolkitCard key={course.id}>
            {/* The web shows a banner image; the RN app has no course artwork,
                so the card leads with a tinted cap instead. */}
            <View style={styles.header}>
              <View style={styles.thumb}>
                <GraduationCap size={22} color={colors.brand} />
              </View>
              <View style={styles.headerText}>
                <Text style={styles.title}>{course.title}</Text>
                <View style={styles.timeRow}>
                  <Clock size={14} color={colors.textBody} />
                  <Text style={styles.time} numberOfLines={1}>
                    {course.timeRequired}
                  </Text>
                </View>
              </View>
              <Badge
                label={course.status}
                variant="light"
                size="sm"
                color={COURSE_BADGE[course.status]}
              />
            </View>

            {course.status !== 'Upcoming' ? (
              <View style={styles.progress}>
                <View style={styles.progressRow}>
                  <Text style={styles.progressLabel}>Your Progress</Text>
                  <Text style={styles.progressLabel}>{course.progress}%</Text>
                </View>
                <ProgressBar value={course.progress} height={8} />
              </View>
            ) : null}

            <View style={styles.cta}>
              {course.status === 'Completed' ? (
                <Button
                  label="Download Certificate"
                  variant="secondaryGray"
                  size="sm"
                  leadingIcon={<DownloadSimple size={16} color={colors.textBody} />}
                  onPress={() =>
                    setToast({
                      title: 'Certificate downloaded',
                      message: `${course.title} is downloaded.`,
                    })
                  }
                />
              ) : course.status === 'Active' ? (
                <Button
                  label="Go to Course"
                  variant="secondaryGray"
                  size="sm"
                  leadingIcon={<ArrowUpRight size={16} color={colors.textBody} />}
                  onPress={() => setToast({ title: 'Opening course', message: course.title })}
                />
              ) : (
                <Button
                  label="Start Course"
                  variant="secondaryGray"
                  size="sm"
                  onPress={() => setToast({ title: 'Course started', message: course.title })}
                />
              )}
            </View>
          </ToolkitCard>
        ))
      )}
    </ToolkitSheet>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  thumb: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.brandSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1, gap: spacing.xs },
  title: {
    fontFamily: fontFamilyForWeight('500'),
    fontSize: 16,
    fontWeight: '500',
    color: colors.textHeading,
  },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  time: { flex: 1, fontFamily: typography.fontFamily, fontSize: 12, color: colors.textBody },
  progress: { gap: spacing.xs },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { fontFamily: typography.fontFamily, fontSize: 12, color: colors.textBody },
  cta: { flexDirection: 'row' },
});
