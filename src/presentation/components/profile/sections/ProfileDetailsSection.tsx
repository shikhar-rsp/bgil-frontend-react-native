import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors, spacing, radius, typography, fontFamilyForWeight } from '@atlas-ds/react-native';
import { SECTION_HEADING_GRADIENT } from '../constants';

interface ProfileDetailsSectionProps {
  title: string;
  children: React.ReactNode;
}

/** Gradient section banner — shared with the Edit Profile sheet. */
export const SectionHeading: React.FC<{ title: string }> = ({ title }) => (
  <View style={styles.heading}>
    <LinearGradient
      colors={SECTION_HEADING_GRADIENT}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={StyleSheet.absoluteFill}
    />
    <Text style={styles.headingText}>{title}</Text>
  </View>
);

export const ProfileDetailsSection: React.FC<ProfileDetailsSectionProps> = ({ title, children }) => (
  <View style={styles.section}>
    <SectionHeading title={title} />
    {/* The web lays fields out on a 2/3-column grid; on a phone two columns is
        the widest that keeps a value like "+91 98220 14785" on one line. */}
    <View style={styles.grid}>{children}</View>
  </View>
);

interface ProfileFieldProps {
  label: string;
  value: string;
  /** Address spans the full row in the design. */
  fullWidth?: boolean;
}

export const ProfileField: React.FC<ProfileFieldProps> = ({ label, value, fullWidth }) => (
  <View style={[styles.field, fullWidth && styles.fieldFull]}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <Text style={styles.fieldValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  section: { gap: spacing.md },
  // overflow:hidden keeps the gradient inside the rounded corners.
  heading: {
    justifyContent: 'center',
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    overflow: 'hidden',
  },
  headingText: {
    fontFamily: fontFamilyForWeight('500'),
    fontSize: 16,
    lineHeight: 24,
    color: colors.textHeading,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: spacing.md,
    columnGap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  // Two per row: half the grid minus half the column gap.
  field: { gap: spacing.xs, width: '48%' },
  fieldFull: { width: '100%' },
  fieldLabel: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textBody,
  },
  fieldValue: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textHeading,
  },
});
