import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CheckCircle } from 'phosphor-react-native';
import { colors, spacing, radius, typography, shadow, fontFamilyForWeight } from '@atlas-ds/react-native';
import type { Member, MemberDatum } from './healthData';

interface PreviewStepProps {
  productName: string;
  planType: string;
  subPlan: string;
  proposerName: string;
  proposerDOB: Date | null;
  members: Member[];
  memberData: Record<string, MemberDatum>;
}

const fmt = (d: Date | null) => {
  if (!d) {
    return 'N/A';
  }
  return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
};

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
  subPlan,
  proposerName,
  proposerDOB,
  members,
  memberData,
}) => (
  <View style={styles.card}>
    <View style={styles.banner}>
      <Text style={styles.bannerTitle}>{productName || 'Health Guard'} - {proposerName || 'Rakesh Kumar'}</Text>
    </View>

    <Section title="Premium Details" accent>
      <Field label="Base Premium:" value="Rs. 31,000" />
      <Field label="Total add ons:" value="Rs. 1,200" />
      <Field label="Discount:" value="20%" />
      <Field label="GST:" value="Rs. 0" />
      <Field label="Total Premium:" value="Rs. 35,300" big />
    </Section>

    <Section title="Plan Details">
      <Field label="Policy type:" value={productName || 'Health Guard'} />
      <Field label="Plan Type:" value={planType === 'individual' ? 'Individual' : 'Floater'} />
      <Field label="Sub Plan:" value={subPlan ? subPlan[0].toUpperCase() + subPlan.slice(1) : '—'} />
      <Field label="Members:" value={String(members.length)} />
    </Section>

    <Section title="Proposer Details">
      <Field label="Proposer name:" value={proposerName || 'N/A'} />
      <Field label="DOB:" value={fmt(proposerDOB)} />
      <Field label="Gender:" value="Male" />
      <Field label="Email ID:" value="rajesh@gmail.com" />
    </Section>

    {members.map((m) => {
      const md = memberData[m.id];
      const addOns = md?.selectedAddOns ?? [];
      // The proposer member's label already ends with "Details" — don't double it.
      const title = m.label.endsWith('Details') ? m.label : `${m.label} Details`;
      return (
        <Section key={m.id} title={title}>
          <Field third label="Sum Insured" value={md?.sumInsured || 'N/A'} />
          <Field third label="DOB" value={fmt(md?.dob ?? null)} />
          <Field third label="Add ons selected:" value={addOns.length ? addOns.join(', ') : 'None'} />
        </Section>
      );
    })}

    <Section title="Add ons">
      <View style={styles.addons}>
        {['OPD Cover', 'Critical Illness', 'Hospital Cash', 'Personal Accident'].map((item, i) => (
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
  banner: { backgroundColor: '#EFF6FF', borderRadius: radius.sm, padding: spacing.md },
  bannerTitle: { fontFamily: fontFamilyForWeight('600'), fontSize: 20, fontWeight: '600', color: colors.textHeading },
  section: { borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.sm, overflow: 'hidden' },
  sectionHeader: { padding: spacing.md },
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
  addonRow: { width: '50%', flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  addonText: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textHeading },
});
