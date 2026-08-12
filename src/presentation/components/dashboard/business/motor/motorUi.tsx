import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, radius, shadow, typography, fontFamilyForWeight } from '@atlas-ds/react-native';

/**
 * Chrome shared by every card in the motor quote flow.
 *
 * The web build read these from CSS custom properties; RN cannot, so the ones
 * that aren't already in the design-system theme are mirrored here. Anything
 * that IS in the theme (`colors.brand`, `colors.borderSubtle`, …) is taken from
 * there rather than repeated, so a token change upstream still lands.
 */
export const motorColors = {
  /** Card gradient runs white → this. Same ramp for the plan and vehicle cards. */
  gradientBlue: '#EFF6FF',
  gradientOrange: '#FFF7ED',
  /** Selected card fill (--color-blue-50). */
  selectedFill: colors.brandSubtle,
  selectedBorder: '#3B82F6',
  orangeBorder: '#FED7AA',
  /** Total Premium bar / success. */
  total: '#059669',
  /** Discount is a saving (green); a loader costs more (red). */
  discount: '#4D7C0F',
  loader: colors.dangerText,
  alert: '#DC2626',
  alertFill: '#FEF2F2',
  warnBorder: '#F59E0B',
  warnIcon: '#B45309',
  warnFill: '#FFFBEB',
  infoFill: '#EFF6FF',
  infoIcon: '#2563EB',
  disabledFill: colors.surfaceMuted,
  tick: '#16A34A',
} as const;

/** The white 20px-padded card every section sits in. */
export const MotorCard: React.FC<{
  title?: string;
  /** Rendered on the title row, right-aligned (value readouts, checkboxes). */
  action?: React.ReactNode;
  children?: React.ReactNode;
  style?: object;
}> = ({ title, action, children, style }) => (
  <View style={[styles.card, style]}>
    {title ? (
      <View style={styles.titleRow}>
        <Text style={styles.heading}>{title}</Text>
        {action}
      </View>
    ) : null}
    {children}
  </View>
);

/** Grey summary strip — "No claim bonus discount", the IDV box in the breakup. */
export const SummaryRow: React.FC<{
  label: string;
  caption?: string;
  value: string;
}> = ({ label, caption, value }) => (
  <View style={styles.summary}>
    <View style={styles.summaryText}>
      <Text style={styles.summaryLabel}>{label}</Text>
      {caption ? <Text style={styles.summaryCaption}>{caption}</Text> : null}
    </View>
    <Text style={styles.summaryValue}>{value}</Text>
  </View>
);

export const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.lg,
    ...shadow.lg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  heading: {
    flexShrink: 1,
    fontFamily: fontFamilyForWeight('500'),
    fontSize: 20,
    fontWeight: '500',
    color: colors.textHeading,
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  summaryText: { flex: 1, gap: 2 },
  summaryLabel: {
    fontFamily: fontFamilyForWeight('500'),
    fontSize: 14,
    fontWeight: '500',
    color: colors.textHeading,
  },
  summaryCaption: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    lineHeight: 16,
    color: '#64748B',
  },
  summaryValue: {
    fontFamily: fontFamilyForWeight('600'),
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600',
    color: colors.textHeading,
  },
});
