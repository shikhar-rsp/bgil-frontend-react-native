import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CheckCircle } from 'phosphor-react-native';
import { colors, spacing, radius, typography, shadow, fontFamilyForWeight } from '@atlas-ds/react-native';
import type { Member } from './healthData';

interface PreviewStepProps {
  productName: string;
  planType: string;
  proposerName: string;
  proposerDOB: Date | null;
  members: Member[];
}

const pad = (n: number) => String(n).padStart(2, '0');

/** `12/09/1985` — the DOB format the Health Guard preview design uses. */
const fmt = (d: Date | null) => (d ? `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}` : 'N/A');

const Field: React.FC<{ label: string; value: string; big?: boolean; third?: boolean }> = ({ label, value, big, third }) => (
  <View style={[styles.field, third && styles.fieldThird]}>
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

export const PreviewStep: React.FC<PreviewStepProps> = ({
  productName,
  planType,
  proposerName,
  proposerDOB,
  members,
}) => (
  <View style={styles.card}>
    <View style={styles.banner}>
      <Text style={styles.bannerTitle}>{productName || 'Health Guard'} - {proposerName || 'Rakesh Kumar'}</Text>
    </View>

    <Section title="Premium Details" accent>
      <Field label="Base Premium:" value="Rs. 17,952" />
      <Field label="Total add ons:" value="6" />
      <Field label="Discount:" value="15%" />
      <Field label="Total Premium:" value="Rs. 28,383" big />
    </Section>

    <Section title="Quote Details">
      <Field label="Quotation number:" value="1836735653765" />
      <Field label="Issued on:" value="07/03/26" />
      <Field label="Valid until:" value="07/03/29" />
      <Field label="IMD:" value="Rajesh Chaurasia" />
      <Field label="Sub IMD:" value="NA" />
      <Field label="Zone:" value="A" />
      <Field label="State:" value="Gujarat" />
      <Field
        label="Issuing Office:"
        value="Ahmadabad branch, 4th floor, Elis bridge, Ahmadabad, Gujarat, 380006"
      />
    </Section>

    <Section title="Plan Details">
      <Field label="Policy type:" value={productName || 'Health Guard'} />
      <Field label="Plan Type:" value={planType === 'individual' ? 'Individual' : 'Floater'} />
      <Field label="Valid until:" value="06/03/29" />
      <Field label="Policy Start date:" value="07/03/26" />
      <Field label="Sum Insured:" value="Rs. 30,00,000" />
      <Field label="Policy Tenure:" value="3 years" />
      <Field label="Total members:" value={members.length ? String(members.length) : '4'} />
    </Section>

    <Section title="Proposer Details">
      <Field label="Proposer name:" value={proposerName || 'Rakesh Kumar'} />
      <Field label="DOB:" value={proposerDOB ? fmt(proposerDOB) : '12/09/1985'} />
      <Field label="Gender:" value="Male" />
      <Field label="Email ID:" value="rajesh@gmail.com" />
      <Field label="Contact no.:" value="+91 887764533" />
      <Field label="Customer ID:" value="1836735653765" />
    </Section>

    <Section title="Add ons">
      <View style={styles.addons}>
        {/* Wraps two-up, so the order below reads left, right, left, right —
            matching the design's two columns. */}
        {[
          'Hospitalization Cover',
          'Hospitalization Cover',
          'Nurse at home',
          'Nurse at home',
          'Pre-hospitalisation expenses',
          'Pre-hospitalisation expenses',
          'Pre-hospitalisation expenses',
        ].map((item, i) => (
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
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, gap: spacing.md, ...shadow.lg },
  banner: { backgroundColor: '#EFF6FF', borderRadius: radius.md, padding: spacing.md },
  bannerTitle: { fontFamily: fontFamilyForWeight('600'), fontSize: 20, fontWeight: '600', color: colors.textHeading,  },
  section: {  borderRadius: radius.md, overflow: 'hidden' },
  sectionHeader: { padding: spacing.md, borderRadius: radius.md, },
  sectionHeaderAccent: { backgroundColor: colors.success },
  sectionHeaderMuted: { backgroundColor: colors.surfaceMuted },
  sectionTitle: { fontFamily: fontFamilyForWeight('500'), fontSize: 16, fontWeight: '500', color: colors.textHeading },
  sectionTitleAccent: { color: colors.textOnBrand },
  sectionBody: { flexDirection: 'row', flexWrap: 'wrap', padding: spacing.md, rowGap: spacing.lg },
  field: { width: '50%', gap: 2 },
  fieldThird: { width: '33.33%' },
  fieldLabel: { fontFamily: typography.fontFamily, fontSize: 12, color: colors.textBody },
  fieldValue: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textHeading },
  fieldValueBig: { fontFamily: fontFamilyForWeight('600'), fontSize: 24, fontWeight: '600', color: colors.textHeading },
  addons: { flexDirection: 'row', flexWrap: 'wrap', rowGap: spacing.md },
  addonRow: { width: '50%', flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs },
  // RN defaults flexShrink to 0, so without this the label runs past the
  // column instead of wrapping ("Hospitalization Cover" → "Cover" on line 2).
  addonText: { flex: 1, fontFamily: typography.fontFamily, fontSize: 14, color: colors.textHeading },
});
