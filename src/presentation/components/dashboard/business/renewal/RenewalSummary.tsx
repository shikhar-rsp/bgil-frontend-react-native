import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { CheckCircle } from 'phosphor-react-native';
import { Badge, colors, spacing, radius, typography, shadow, fontFamilyForWeight } from '@atlas-ds/react-native';
import type { Renewal } from '../businessData';
import {
  CHANGED_SECTIONS_BY_EDIT,
  RELATIONSHIP_LABELS,
  formatDobLabel,
  type EditOption,
  type ProceedOption,
  type RenewalMemberEntry,
  type RenewalNomineeData,
  type RenewalPlanType,
} from './renewalData';

interface RenewalSummaryProps {
  record?: Renewal;
  planType: RenewalPlanType;
  proceedOption: ProceedOption | null;
  editOption: EditOption | null;
  /** Members still on the policy — drives the nominee rows. */
  members: RenewalMemberEntry[];
  nomineeData: Record<string, RenewalNomineeData>;
  /** Rendered above the summary card (the expiry / status toast in view mode). */
  topContent?: React.ReactNode;
  /** Overrides the derived "<plan> – <type> (<flow>)" heading. */
  titleOverride?: string;
  titleBadge?: React.ReactNode;
}

type SectionTone = 'success' | 'info' | 'muted';

const Field: React.FC<{ label: string; value?: string; big?: boolean; children?: React.ReactNode }> = ({
  label,
  value,
  big,
  children,
}) => (
  <View style={styles.field}>
    <Text style={styles.fieldLabel}>{label}</Text>
    {children ?? <Text style={big ? styles.fieldValueBig : styles.fieldValue}>{value}</Text>}
  </View>
);

const Section: React.FC<{
  title: string;
  tone?: SectionTone;
  badge?: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, tone = 'muted', badge, children }) => (
  <View style={styles.section}>
    <View
      style={[
        styles.sectionHeader,
        tone === 'success' ? styles.sectionHeaderSuccess : tone === 'info' ? styles.sectionHeaderInfo : styles.sectionHeaderMuted,
      ]}
    >
      <Text style={[styles.sectionTitle, tone !== 'muted' && styles.sectionTitleOnColor]}>{title}</Text>
      {/* Badge sets `alignSelf: 'flex-start'` so it doesn't stretch in a column;
          in this row that pins it to the top. A wrapper hugging its height makes
          the rule a no-op and lets `alignItems: 'center'` do its job. */}
      {badge ? <View>{badge}</View> : null}
    </View>
    <View>{children}</View>
  </View>
);

const CheckList: React.FC<{ label: string; items: string[] }> = ({ label, items }) => (
  <View style={styles.checkListBlock}>
    <Text style={styles.fieldLabel}>{label}</Text>
    {items.map((item) => (
      <View key={item} style={styles.checkRow}>
        <CheckCircle size={16} color={colors.brand} />
        <Text style={styles.checkText}>{item}</Text>
      </View>
    ))}
  </View>
);

/** Static member rows — the web summary shows fixture data here too. */
const SUMMARY_MEMBERS = [
  { name: 'Ritu M Sultania', gender: 'Female', dob: '23/05/1985' },
  { name: 'Kiran Sultania', gender: 'Male', dob: '23/05/1985' },
];

const MEMBER_COVERS = ['Accidental Hospitalization Expenses', 'Coma Due to Accidental Bodily Injury'];
const MEMBER_ADDONS = ['Hospitalization Cover', 'Nurse at home'];
const FLOATER_ADDONS_SELECTED = [
  'Accidental Hospitalization Expenses',
  'Coma Due to Accidental Bodily Injury',
  'Hospitalization Cover',
  'Nurse at home',
];

/**
 * The renewal summary — "Preview & Share" in the wizard, and the whole screen in
 * read-only view mode (entered from the Renewals list "View Policy" action).
 *
 * Sections carry an "Updated" badge only when the chosen edit option actually
 * changes them, which is what `CHANGED_SECTIONS_BY_EDIT` encodes.
 */
export const RenewalSummary: React.FC<RenewalSummaryProps> = ({
  record,
  planType,
  proceedOption,
  editOption,
  members,
  nomineeData,
  topContent,
  titleOverride,
  titleBadge,
}) => {
  const changed = editOption ? CHANGED_SECTIONS_BY_EDIT[editOption] : [];
  const planTypeLabel = planType === 'floater' ? 'Floater' : 'Individual';
  const flowLabel =
    proceedOption === 'migration' ? 'Migration' : proceedOption === 'quick' ? 'Quick Renewal' : 'Renewal';
  // The record's product carries its plan type ("Health Guard - Floater"); the
  // heading and the policy-name field want just the plan itself.
  const productName = record?.product?.split(' - ')[0] ?? 'My Health Care';

  const updatedBadge = <Badge label="Updated" variant="solid" size="sm" color="lime" />;
  const updatedBadgeLight = <Badge label="Updated" variant="light" size="sm" color="lime" />;

  const policyBadge =
    proceedOption === 'migration' ? (
      <Badge label="Policy plan updated" variant="light" size="sm" color="lime" />
    ) : changed.includes('policy') ? (
      updatedBadgeLight
    ) : null;

  return (
    <View style={styles.wrap}>
      {topContent}

      <View style={styles.card}>
        <View style={styles.outline}>
          {/* Background-only gradient — on iOS it paints over its own children. */}
          <View style={styles.titleBar}>
            <LinearGradient colors={['#FFFFFF', '#EFF6FF']} style={StyleSheet.absoluteFill} />
            <Text style={styles.title}>{titleOverride ?? `${productName} – ${planTypeLabel} (${flowLabel})`}</Text>
            {titleBadge}
          </View>

          <View style={styles.sections}>
            <Section title="Policy Details" tone="success" badge={policyBadge}>
              <View style={styles.grid}>
                {(
                  [
                    ['Policy Name:', productName],
                    ['Plan Type:', planTypeLabel],
                    ['Customer ID:', '248698623'],
                    ['Policy Number:', record?.renewalPolicyId ?? '12-8428-0000165845-09'],
                    ['Policy Period:', '3 Years'],
                    ['Policy Start date:', '16/05/2026'],
                    ['Policy End date:', '16/05/2029'],
                    ['IMD:', 'Rajesh Chaurasia'],
                    ['Sub IMD:', 'NA'],
                    ['State:', 'Gujarat'],
                  ] as const
                ).map(([label, value]) => (
                  <Field key={label} label={label} value={value} />
                ))}
                <View style={styles.fieldWide}>
                  <Text style={styles.fieldLabel}>Issuing Office:</Text>
                  <Text style={styles.fieldValue}>
                    Ahmedabad branch, 4th floor, Ellisbridge, Ahmedabad, Gujarat, 380006
                  </Text>
                </View>
              </View>
            </Section>

            <Section
              title="Renewal Premium Details"
              tone="info"
              badge={changed.includes('premium') ? updatedBadge : null}
            >
              <View style={styles.grid}>
                <Field label="Current Premium:" value="Rs. 30,000" />
                <Field label="Add on premium:" value="Rs. 1,600" />
                <Field label="Discount:" value="Rs. 0" />
                <Field label="Central GST:" value="Rs. 0" />
                <Field label="State GST:" value="Rs. 0" />
                <Field label="Receipt no.:" value="SYS-24-000003708236" />
                <Field label="Payment Status">
                  <Badge label="NA" variant="solid" size="sm" color="neutral" style={styles.inlineBadge} />
                </Field>
                <Field label="Renewal Premium:" value="Rs. 31,600" big />
              </View>
            </Section>

            <Section title="Proposer Details" badge={changed.includes('proposer') ? updatedBadge : null}>
              <View style={styles.grid}>
                {(
                  [
                    ['Proposer name:', record?.customer ?? 'Ritu M Sultania'],
                    ['DOB:', '11-02-1985'],
                    ['Gender:', 'Male'],
                    ['Email ID:', 'rajesh@gmail.com'],
                    ['Contact no:', '+91 887764533'],
                    ['Customer ID:', '1836735653765'],
                  ] as const
                ).map(([label, value]) => (
                  <Field key={label} label={label} value={value} />
                ))}
              </View>
            </Section>

            <Section title="Member details" badge={changed.includes('member') ? updatedBadge : null}>
              {SUMMARY_MEMBERS.map((member, index) => (
                <View key={member.name} style={[styles.grid, index > 0 && styles.gridDivided]}>
                  <Field label="Member name:" value={member.name} />
                  <Field label="Gender:" value={member.gender} />
                  <Field label="DOB:" value={member.dob} />
                  <Field label="Sum Insured:" value="Rs. 15,00,000" />
                  {/* Floater plans share add-ons, so they're listed once in their own
                      section below rather than per member. */}
                  {planType !== 'floater' ? (
                    <>
                      <CheckList label="Covers:" items={MEMBER_COVERS} />
                      <CheckList label="Add ons:" items={MEMBER_ADDONS} />
                    </>
                  ) : null}
                </View>
              ))}
            </Section>

            {planType === 'floater' ? (
              <Section title="Add-ons selected" badge={changed.includes('premium') ? updatedBadge : null}>
                <View style={styles.checkListPad}>
                  {FLOATER_ADDONS_SELECTED.map((item) => (
                    <View key={item} style={styles.checkRow}>
                      <CheckCircle size={16} color={colors.brand} />
                      <Text style={styles.checkText}>{item}</Text>
                    </View>
                  ))}
                </View>
              </Section>
            ) : null}

            <Section title="Nominee details" badge={changed.includes('nominee') ? updatedBadge : null}>
              {members.map((member, index) => {
                const nominee = nomineeData[member.id];
                return (
                  <View key={member.id} style={[styles.grid, index > 0 && styles.gridDivided]}>
                    <Field label="Nominee name:">
                      <View style={styles.nomineeName}>
                        <Text style={styles.fieldValue}>{nominee?.name ?? '—'}</Text>
                        <Badge label={member.label} variant="light" size="sm" color="blue" />
                      </View>
                    </Field>
                    <Field label="DOB:" value={formatDobLabel(nominee?.dob ?? null) || '—'} />
                    <Field
                      label="Relationship:"
                      value={RELATIONSHIP_LABELS[nominee?.relationship ?? ''] ?? nominee?.relationship ?? '—'}
                    />
                    <Field label="Allocation %:" value={`${nominee?.allocation ?? 0} %`} />
                  </View>
                );
              })}
            </Section>

            <Section title="Payment Details">
              <View style={styles.grid}>
                <Field label="Instrument Type:" value="Cheque" />
                <Field label="Instrument no:" value="32353" />
                <Field label="Date:" value="16/05/2026" />
                <Field label="Bank name:" value="State Bank of India" />
                <Field label="Branch:" value="Hennur" />
                <Field label="Amount:" value="Rs. 31,600" big />
              </View>
            </Section>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.md, ...shadow.lg },
  outline: { borderWidth: 1, borderColor: '#BFDBFE', borderRadius: radius.sm, overflow: 'hidden' },
  titleBar: { padding: spacing.lg, gap: spacing.sm },
  title: { fontFamily: fontFamilyForWeight('600'), fontSize: 18, lineHeight: 26, fontWeight: '600', color: colors.textHeading },
  sections: { padding: spacing.md, gap: spacing.md },
  section: { borderRadius: radius.sm, overflow: 'hidden' },
  sectionHeader: {
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.lg,
    flexWrap: 'wrap',
    // `flexWrap` makes alignContent (default flex-start) position the line, not
    // alignItems — without this the row hugs the top of the 48px minHeight.
    alignContent: 'center',
  },
  sectionHeaderSuccess: { backgroundColor: '#059669' },
  sectionHeaderInfo: { backgroundColor: '#2563EB' },
  sectionHeaderMuted: { backgroundColor: colors.surfaceMuted },
  sectionTitle: { fontFamily: fontFamilyForWeight('500'), fontSize: 16, lineHeight: 24, fontWeight: '500', color: colors.textHeading },
  sectionTitleOnColor: { color: colors.textOnBrand },
  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: spacing.lg, rowGap: spacing.lg },
  gridDivided: { borderTopWidth: 1, borderTopColor: colors.borderSubtle },
  field: { width: '50%', gap: 2, paddingRight: spacing.sm },
  fieldWide: { width: '100%', gap: 2 },
  fieldLabel: { fontFamily: typography.fontFamily, fontSize: 12, lineHeight: 16, color: colors.textBody },
  fieldValue: { fontFamily: typography.fontFamily, fontSize: 14, lineHeight: 20, color: colors.textHeading },
  fieldValueBig: { fontFamily: fontFamilyForWeight('600'), fontSize: 24, lineHeight: 30, fontWeight: '600', color: colors.textHeading },
  inlineBadge: { alignSelf: 'flex-start' },
  nomineeName: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.xs },
  checkListBlock: { width: '100%', gap: spacing.xs },
  checkListPad: { padding: spacing.lg, gap: spacing.sm },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  checkText: { fontFamily: typography.fontFamily, fontSize: 14, lineHeight: 20, color: colors.textHeading, flexShrink: 1 },
});
