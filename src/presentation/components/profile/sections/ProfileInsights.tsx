import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors, spacing, radius, typography, fontFamilyForWeight } from '@atlas-ds/react-native';
import type { ProfileInsights as ProfileInsightsData } from '../../../../domain/entities/profile_entities';
import { TILE_GRADIENT } from '../constants';

interface ProfileInsightsProps {
  insights: ProfileInsightsData;
}

const InsightTile: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.tile}>
    <LinearGradient colors={TILE_GRADIENT} style={StyleSheet.absoluteFill} />
    <Text style={styles.tileLabel} numberOfLines={1}>
      {label}
    </Text>
    <Text style={styles.tileValue}>{value}</Text>
  </View>
);

/** 2×2 stat grid rendered at the bottom of the profile summary card. */
export const ProfileInsights: React.FC<ProfileInsightsProps> = ({ insights }) => (
  <View style={styles.wrap}>
    <Text style={styles.heading}>Your Insights</Text>

    <View style={styles.grid}>
      <View style={styles.row}>
        <InsightTile label="Customers" value={String(insights.customers)} />
        <InsightTile label="Policies Sold" value={String(insights.policiesSold)} />
      </View>
      <View style={styles.row}>
        <InsightTile label="Conversion Rate" value={`${insights.conversionRate}%`} />
        <InsightTile label="Renewal Rate" value={`${insights.renewalRate}%`} />
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  wrap: { gap: spacing.lg, paddingHorizontal: 20, paddingVertical: spacing.lg },
  heading: {
    fontFamily: fontFamilyForWeight('500'),
    fontSize: 16,
    lineHeight: 24,
    color: colors.textHeading,
  },
  grid: { gap: spacing.md },
  row: { flexDirection: 'row', gap: spacing.md, alignItems: 'stretch' },
  // overflow:hidden keeps the gradient inside the rounded border.
  tile: {
    flex: 1,
    minWidth: 0,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    padding: spacing.md,
    overflow: 'hidden',
  },
  tileLabel: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textBody,
  },
  tileValue: {
    fontFamily: fontFamilyForWeight('500'),
    fontSize: 24,
    lineHeight: 28,
    color: colors.textHeading,
  },
});
