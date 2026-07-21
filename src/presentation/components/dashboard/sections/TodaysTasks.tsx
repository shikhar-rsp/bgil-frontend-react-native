import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CaretRight } from 'phosphor-react-native';
import {
  Badge,
  Button,
  colors,
  spacing,
  radius,
  shadow,
  typography,
  fontFamilyForWeight,
  type AccentColor,
} from '@atlas-ds/react-native';

type Task = {
  id: string;
  title: string;
  tag: string;
  tagColor: AccentColor;
  description: string;
};

/** Demo tasks for the agent "Tasks" tab (matches the Figma reference). */
const TASKS: Task[] = [
  {
    id: '1',
    title: 'QT-2024-1001',
    tag: 'Renewal',
    tagColor: 'orange',
    description: 'Health Policy due for renewal on 12th March 2026.',
  },
  {
    id: '2',
    title: 'QT-2024-1001',
    tag: 'Expiring Quote',
    tagColor: 'violet',
    description: 'Quote expiring today! Please follow up.',
  },
  {
    id: '3',
    title: 'Shalini Kumari',
    tag: 'Birthday',
    tagColor: 'pink',
    description: 'Continue your learning module to earn credits.',
  },
  {
    id: '4',
    title: 'Priya Sharma',
    tag: 'Meeting',
    tagColor: 'emerald',
    description: 'Meeting with a potential customer at 12pm today!',
  },
  {
    id: '5',
    title: 'Priya Sharma',
    tag: 'Meeting',
    tagColor: 'emerald',
    description: 'Meeting with a potential customer at 12pm today!',
  },
];

/** "Today's Tasks" — a shadowed card with a divider-separated list of tasks. */
export const TodaysTasks: React.FC = () => (
  <View style={styles.card}>
    <View style={styles.header}>
      <Text style={styles.heading}>Today's Tasks</Text>
      <Button
        label="View All"
        variant="link"
        size="sm"
        trailingIcon={<CaretRight size={16} color={colors.brand} weight="bold" />}
        onPress={() => undefined}
      />
    </View>
    <View style={styles.body}>
      {TASKS.map((task, i) => (
        <View key={task.id} style={[styles.item, i > 0 && styles.itemDivider]}>
          <View style={styles.itemTop}>
            <Text style={styles.taskTitle} numberOfLines={1}>
              {task.title}
            </Text>
            <Badge label={task.tag} variant="light" size="sm" color={task.tagColor} />
          </View>
          <Text style={styles.taskDesc}>{task.description}</Text>
        </View>
      ))}
    </View>

  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    ...shadow.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  heading: { fontFamily: fontFamilyForWeight('500'), fontSize: 18, color: colors.textHeading },
  body: { paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.lg },
  item: { paddingVertical: spacing.md, gap: spacing.xs, },
  itemDivider: { borderTopWidth: 1, borderTopColor: colors.borderSubtle },
  itemTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  taskTitle: {
    flex: 1,
    fontFamily: fontFamilyForWeight('500'),
    fontSize: 14,
    color: colors.textHeading,
  },
  taskDesc: {
    fontFamily: typography.fontFamily,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textBody,
  },
});
