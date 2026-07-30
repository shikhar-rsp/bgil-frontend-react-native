import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Badge, colors, fontFamilyForWeight, spacing, typography, type AccentColor } from '@atlas-ds/react-native';

export interface RecordCardProps {
  title: string;
  subtitle: string;
  /** Secondary line under the subtitle — e.g. a duplicate's "Copy of …". */
  note?: string;
  amount: string;
  meta?: string;
  status?: string;
  statusColor?: AccentColor;
  /** Extra pill shown above the status, used by Renewals' "Expiring Within". */
  tag?: string;
  tagColor?: AccentColor;
  /** Row-actions control — pass a `<RowActionMenu>`; it owns its own trigger. */
  menu?: React.ReactNode;
  onPress?: () => void;
}

/**
 * One row in a business list. The web renders these tabs as multi-column
 * tables; on a phone each record collapses to a card with the same fields
 * stacked, per the RN list conventions in AGENTS.md.
 */
export const RecordCard: React.FC<RecordCardProps> = ({
  title,
  subtitle,
  note,
  amount,
  meta,
  status,
  statusColor,
  tag,
  tagColor,
  menu,
  onPress,
}) => (
  <Pressable
    style={styles.record}
    onPress={onPress}
    disabled={!onPress}
    accessibilityRole={onPress ? 'button' : undefined}
  >
    <View style={styles.main}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle} numberOfLines={1}>
        {subtitle}
      </Text>
      {note ? (
        <Text style={styles.note} numberOfLines={1}>
          {note}
        </Text>
      ) : null}
      <View style={styles.metaRow}>
        <Text style={styles.amount}>{amount}</Text>
        {meta ? <Text style={styles.meta}>· {meta}</Text> : null}
      </View>
    </View>

    <View style={styles.right}>
      {tag ? <Badge variant="light" size="sm" color={tagColor ?? 'neutral'} label={tag} /> : null}
      {status ? <Badge variant="light" size="sm" color={statusColor ?? 'neutral'} label={status} /> : null}
      {menu}
    </View>
  </Pressable>
);

const styles = StyleSheet.create({
  record: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, gap: spacing.md },
  main: { flex: 1, gap: spacing.xxs },
  // Sizes come from the type scale (body1/2/3) rather than ad-hoc values, and
  // weights 500+ reference the bundled Rubik face by name — Android can't
  // synthesise Medium from `fontFamily: 'Rubik'` and silently renders Regular.
  title: { fontFamily: fontFamilyForWeight('500'), ...typography.body1, fontWeight: '500', color: colors.textHeading },
  subtitle: { fontFamily: typography.fontFamily, ...typography.body2, color: colors.textBody },
  note: { fontFamily: typography.fontFamily, ...typography.body3, color: colors.textMuted },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  amount: { fontFamily: fontFamilyForWeight('500'), ...typography.body2, fontWeight: '500', color: colors.textHeading },
  meta: { fontFamily: typography.fontFamily, ...typography.body3, color: colors.textMuted },
  right: { alignItems: 'flex-end', gap: spacing.sm },
});
