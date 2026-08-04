import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Toggle, colors, spacing, radius, typography, fontFamilyForWeight } from '@atlas-ds/react-native';
import type {
  NotificationPreference,
  NotificationPreferenceId,
} from '../../../../domain/entities/settings_entities';

interface NotificationPreferencesProps {
  preferences: NotificationPreference[];
  onToggle: (id: NotificationPreferenceId, enabled: boolean) => void;
}

/** Notification opt-in rows. Changes save immediately — the design has no save button. */
export const NotificationPreferences: React.FC<NotificationPreferencesProps> = ({
  preferences,
  onToggle,
}) => (
  <View style={styles.list}>
    {preferences.map((preference) => (
      <View key={preference.id} style={styles.row}>
        {/* The label lives in the row rather than on the Toggle: the description
            wraps to several lines and would push the switch out of alignment. */}
        <View style={styles.text}>
          <Text style={styles.title}>{preference.title}</Text>
          <Text style={styles.description}>{preference.description}</Text>
        </View>

        <Toggle
          value={preference.enabled}
          onValueChange={(enabled) => onToggle(preference.id, enabled)}
          size="sm"
        />
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  list: { gap: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  text: { flex: 1, minWidth: 0 },
  title: {
    fontFamily: fontFamilyForWeight('500'),
    fontSize: 14,
    lineHeight: 20,
    color: colors.textHeading,
  },
  description: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textBody,
  },
});
