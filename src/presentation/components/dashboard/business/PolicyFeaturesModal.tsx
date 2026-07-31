import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Check } from 'phosphor-react-native';
import { BottomSheet, colors, spacing, radius, typography, fontFamilyForWeight } from '@atlas-ds/react-native';
import type { PolicyFeatures } from './policyFeaturesData';

interface PolicyFeaturesModalProps {
  isOpen: boolean;
  onClose: () => void;
  features: PolicyFeatures;
}

const FeatureCard: React.FC<{ title: string; items: string[] }> = ({ title, items }) => (
  <View style={styles.card}>
    {/* Background-only gradient (see DashboardTopBar): on iOS the native
        gradient view paints over its own children, which clipped the title. */}
    <View style={styles.cardHeader}>
      <LinearGradient
        colors={['#EFF6FF', '#DBEAFE']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <Text style={styles.cardTitle}>{title}</Text>
    </View>
    <View style={styles.cardBody}>
      {items.map((item) => (
        <View key={item} style={styles.row}>
          <Check size={16} color="#64748B" style={styles.check} />
          <Text style={styles.rowText}>{item}</Text>
        </View>
      ))}
    </View>
  </View>
);

/**
 * "View features" — the policy's key features and coverage highlights.
 *
 * The web modal gives each card its own fixed-height inner scroll area. Nesting
 * vertical scrolls inside a sheet fights the sheet's own gesture on a phone, so
 * both cards render in full inside one scroll view instead.
 */
export const PolicyFeaturesModal: React.FC<PolicyFeaturesModalProps> = ({ isOpen, onClose, features }) => (
  <BottomSheet
    visible={isOpen}
    onClose={onClose}
    title={features.title}
    subtitle="Read all the key features and coverage highlights under this policy."
    contentMinHeight={0}
    primaryAction={{ label: 'Close', onPress: onClose }}
  >
    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <FeatureCard title="Key Features" items={features.keyFeatures} />
      <FeatureCard title="Coverage Highlights" items={features.coverageHighlights} />
    </ScrollView>
  </BottomSheet>
);

const styles = StyleSheet.create({
  scroll: { alignSelf: 'stretch' },
  scrollContent: { gap: spacing.md, paddingBottom: spacing.sm },
  card: {
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  cardHeader: { padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: '#BFDBFE' },
  cardTitle: { fontFamily: fontFamilyForWeight('600'), fontSize: 16, lineHeight: 24, fontWeight: '600', color: colors.textHeading },
  cardBody: { padding: spacing.lg, gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  // Nudge the tick onto the first line of a wrapping label.
  check: { marginTop: 3 },
  rowText: { fontFamily: typography.fontFamily, fontSize: 14, lineHeight: 20, color: colors.textBody, flexShrink: 1 },
});
