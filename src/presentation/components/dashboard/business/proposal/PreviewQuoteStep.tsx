import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, radius, typography, shadow } from '@atlas-ds/react-native';
import type { PlanType } from './proposalData';

interface PreviewQuoteStepProps {
  customerName: string;
  planType: PlanType;
}

const Field: React.FC<{ label: string; value: string; big?: boolean }> = ({ label, value, big }) => (
  <View style={styles.field}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <Text style={big ? styles.fieldValueBig : styles.fieldValue}>{value}</Text>
  </View>
);

const Section: React.FC<{ title: string; accent?: boolean; children: React.ReactNode }> = ({ title, accent, children }) => (
  <View style={styles.section}>
    <View style={[styles.sectionHeader, accent ? styles.sectionHeaderAccent : styles.sectionHeaderMuted]}>
      <Text style={[styles.sectionTitle, accent && styles.sectionTitleAccent]}>{title}</Text>
    </View>
    <View style={styles.sectionBody}>{children}</View>
  </View>
);

export const PreviewQuoteStep: React.FC<PreviewQuoteStepProps> = ({ customerName, planType }) => (
  <View style={styles.card}>
    <View style={styles.banner}>
      <Text style={styles.bannerTitle}>Quote Preview - {customerName || 'Rajesh Chaurasia'}</Text>
    </View>
    <Section title="Premium Details" accent>
      <Field label="Base Premium:" value="Rs. 31,000" />
      <Field label="Total add ons:" value="Rs. 1,200" />
      <Field label="Discount:" value="20%" />
      <Field label="GST:" value="Rs. 0" />
      <Field label="Total Premium:" value="Rs. 35,300" big />
    </Section>
    <Section title="Quote Details">
      <Field label="Quotation number:" value="28686-8728387" />
      <Field label="Plan Type:" value={planType === 'individual' ? 'Individual' : 'Floater'} />
      <Field label="Issued on:" value="01/03/2026" />
      <Field label="Valid until:" value="01/04/2026" />
    </Section>
  </View>
);

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, gap: spacing.md, ...shadow.lg },
  banner: { backgroundColor: '#EFF6FF', borderRadius: radius.sm, padding: spacing.md },
  bannerTitle: { fontFamily: typography.fontFamily, fontSize: 20, fontWeight: '600', color: colors.textHeading },
  section: { borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.sm, overflow: 'hidden' },
  sectionHeader: { padding: spacing.md },
  sectionHeaderAccent: { backgroundColor: colors.success },
  sectionHeaderMuted: { backgroundColor: colors.surfaceMuted },
  sectionTitle: { fontFamily: typography.fontFamily, fontSize: 16, fontWeight: '500', color: colors.textHeading },
  sectionTitleAccent: { color: colors.textOnBrand },
  sectionBody: { flexDirection: 'row', flexWrap: 'wrap', padding: spacing.md, rowGap: spacing.lg },
  field: { width: '50%', gap: 2 },
  fieldLabel: { fontFamily: typography.fontFamily, fontSize: 12, color: colors.textBody },
  fieldValue: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textHeading },
  fieldValueBig: { fontFamily: typography.fontFamily, fontSize: 24, fontWeight: '600', color: colors.textHeading },
});
