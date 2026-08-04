import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Accordion, colors, spacing, radius, typography, fontFamilyForWeight } from '@atlas-ds/react-native';
import { VIRTUAL_ID_BENEFITS } from '../constants';

/**
 * "How to use Virtual ID?" explainer. The web renders it as a permanent left
 * rail beside the form; a phone has no room for that, so it collapses into an
 * accordion above the form and stays out of the way until asked for.
 */
export const VirtualIdBenefitsPanel: React.FC = () => (
  <Accordion label="How to use Virtual ID?">
    <View style={styles.list}>
      {VIRTUAL_ID_BENEFITS.map((benefit) => (
        <View key={benefit.title} style={styles.item}>
          <Text style={styles.title}>{benefit.title}</Text>
          <Text style={styles.description}>{benefit.description}</Text>
        </View>
      ))}
    </View>
  </Accordion>
);

const styles = StyleSheet.create({
  list: { gap: spacing.sm },
  item: {
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  title: {
    fontFamily: fontFamilyForWeight('500'),
    fontSize: 14,
    lineHeight: 20,
    color: colors.textHeading,
  },
  description: {
    fontFamily: typography.fontFamily,
    fontSize: 13,
    lineHeight: 20,
    color: colors.textBody,
  },
});
