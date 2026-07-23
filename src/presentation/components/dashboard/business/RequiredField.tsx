import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@atlas-ds/react-native';

/**
 * Wraps a design-system field (`Textfield`, `DatePicker`, `Dropdown`, `TextArea`)
 * with an externally rendered label so the required-field asterisk can be tinted
 * with the danger token (`colors.dangerText`, #B91C1C). Those components' `label`
 * prop only accepts a plain string, so they can't colour part of the label
 * themselves — pass the field as a child here (without its own `label`) instead.
 *
 * The label style and 8px label→field gap mirror the DS components' own, so the
 * field looks identical apart from the coloured `*`. Shared by the health and
 * proposal quote flows.
 */
export const RequiredField: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <View style={styles.wrap}>
    <RequiredLabel text={label} />
    {children}
  </View>
);

/** A standalone field label with a danger-tinted required asterisk. */
export const RequiredLabel: React.FC<{ text: string }> = ({ text }) => (
  <Text style={styles.label}>
    {text} <Text style={styles.asterisk}>*</Text>
  </Text>
);

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm, alignSelf: 'stretch' },
  label: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    color: colors.textBody,
  },
  asterisk: { color: colors.dangerText },
});
