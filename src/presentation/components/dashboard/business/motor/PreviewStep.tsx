import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CheckCircle } from 'phosphor-react-native';
import { colors, spacing, radius, typography, shadow, fontFamilyForWeight } from '@atlas-ds/react-native';
import { motorWheelerLabel } from './MotorHeader';

interface PreviewStepProps {
  proposerName: string;
  proposerDOB: Date | null;
  /** Selected product label, e.g. "Two Wheeler" / "Private Car". */
  productName?: string;
}

const formatDate = (date: Date | null) => {
  if (!date) {
    return 'N/A';
  }
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${d}-${m}-${date.getFullYear()}`;
};

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

const ADD_ONS = [
  'Consumable Expenses',
  'Personal baggage cover',
  'Accident shield',
  'Drive Assure Drive smart',
  'Drive Assure Drive smart',
  'Drive Assure Drive smart',
];

export const PreviewStep: React.FC<PreviewStepProps> = ({ proposerName, proposerDOB, productName }) => (
  <View style={styles.card}>
    <View style={styles.banner}>
      <Text style={styles.bannerTitle}>
        {motorWheelerLabel(productName)} Insurance - {proposerName || 'Rakesh Kumar'}
      </Text>
    </View>

    <Section title="Premium Details" accent>
      <Field label="Base Premium:" value="Rs. 31,000" />
      <Field label="Discount:" value="20%" />
      <Field label="Central GST:" value="Rs. 0" />
      <Field label="State GST:" value="Rs. 0" />
      <Field label="Total Premium:" value="Rs. 35,300" big />
    </Section>

    <Section title="Quote Details">
      <Field label="Quotation number:" value="1836735653765" />
      <Field label="Issued on:" value="01/03/2026" />
      <Field label="Valid until:" value="01/04/2026" />
      <Field label="IMD:" value="Rajesh Chaurasia" />
      <Field label="Zone:" value="A" />
      <Field label="State:" value="Gujrat" />
    </Section>

    <Section title="Plan Details">
      <Field label="Policy type:" value="Motor Insurance" />
      <Field label="Plan Type:" value="Own Damage" />
      <Field label="Sum Insured" value="Rs. 15,00,000" />
      <Field label="Policy Start date:" value="12/01/2026" />
      <Field label="Policy Tenure:" value="3 years" />
      <Field label="Type of Insured" value="Institution" />
    </Section>

    <Section title="Proposer Details">
      <Field label="Proposer name:" value={proposerName || 'N/A'} />
      <Field label="DOB:" value={formatDate(proposerDOB)} />
      <Field label="Gender:" value="Male" />
      <Field label="Email ID:" value="rajesh@gmail.com" />
      <Field label="Contact no:" value="+91 887764533" />
      <Field label="Customer ID:" value="1836735653765" />
    </Section>

    <Section title="Add ons">
      <View style={styles.addons}>
        {ADD_ONS.map((item, i) => (
          <View key={i} style={styles.addonRow}>
            <CheckCircle size={16} color="#3B82F6" />
            <Text style={styles.addonText}>{item}</Text>
          </View>
        ))}
      </View>
    </Section>
  </View>
);

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: '#BFDBFE', gap: spacing.md,},
  banner: { backgroundColor: '#EFF6FF', borderRadius: radius.sm, padding: spacing.md },
  bannerTitle: { fontFamily: fontFamilyForWeight('500'), fontSize: 20, fontWeight: '500', color: colors.textHeading },
  section: {  borderRadius: radius.sm, overflow: 'hidden',padding: spacing.lg },
  sectionHeader: { padding: spacing.md, borderRadius: radius.md },
  sectionHeaderAccent: { backgroundColor: colors.success },
  sectionHeaderMuted: { backgroundColor: colors.surfaceMuted },
  sectionTitle: { fontFamily: fontFamilyForWeight('500'), fontSize: 16, fontWeight: '500', color: colors.textHeading },
  sectionTitleAccent: { color: colors.textOnBrand },
  sectionBody: { flexDirection: 'row', flexWrap: 'wrap', padding: spacing.md, rowGap: spacing.lg },
  field: { width: '50%', gap: 2 },
  fieldLabel: { fontFamily: typography.fontFamily, fontSize: 12, color: colors.textBody },
  fieldValue: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textHeading },
  fieldValueBig: { fontFamily: fontFamilyForWeight('500'), fontSize: 24, fontWeight: '600', color: colors.textHeading },
  addons: { gap: spacing.md },
  addonRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  addonText: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textHeading },
});
