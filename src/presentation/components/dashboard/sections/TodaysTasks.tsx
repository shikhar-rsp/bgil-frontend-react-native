import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CaretRight } from 'phosphor-react-native';
import {
  Badge,
  Card,
  Button,
  colors,
  spacing,
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

/** "Today's Tasks" — a list of task cards with a status badge on each. */
export const TodaysTasks: React.FC = () => (
  <View style={styles.wrap}>
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

    {TASKS.map((task) => (
      <Card key={task.id}>
        <View style={styles.taskContent}>
          <View style={styles.taskTop}>
            <Text style={styles.taskTitle} numberOfLines={1}>
              {task.title}
            </Text>
            <Badge label={task.tag} variant="light" size="sm" color={task.tagColor} />
          </View>
          <Text style={styles.taskDesc}>{task.description}</Text>
        </View>
      </Card>
    ))}
  </View>
);

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heading: { fontFamily: fontFamilyForWeight('600'), fontSize: 18, color: colors.textHeading },
  taskContent: { flex: 1, gap: spacing.xs },
  taskTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  taskTitle: {
    flex: 1,
    fontFamily: fontFamilyForWeight('600'),
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
