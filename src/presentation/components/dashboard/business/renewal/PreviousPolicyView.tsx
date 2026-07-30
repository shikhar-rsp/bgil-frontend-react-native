import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Accordion, colors, spacing, radius, typography, shadow, fontFamilyForWeight } from '@atlas-ds/react-native';
import { CurrentPolicyCard } from './CurrentPolicyCard';
import type { Renewal } from '../businessData';
import { PREVIOUS_POLICIES, type RenewalMemberEntry } from './renewalData';

interface PreviousPolicyViewProps {
  record?: Renewal;
  members: RenewalMemberEntry[];
  onDownloadPolicy: () => void;
}

/**
 * Read-only "Previous Policy details" — shown before the KYC step in the
 * entire-policy flows. Each member lists the policies they held before.
 */
export const PreviousPolicyView: React.FC<PreviousPolicyViewProps> = ({ record, members, onDownloadPolicy }) => (
  <View style={styles.wrap}>
    <CurrentPolicyCard record={record} editable onDownload={onDownloadPolicy} />

    <View style={styles.card}>
      <Text style={styles.heading}>Previous Policy details</Text>
      {members.map((member, index) => (
        <Accordion key={member.id} label={member.label} defaultOpen={index === 0} style={styles.memberCard}>
          <View style={styles.body}>
            {PREVIOUS_POLICIES.map((policy, i) => (
              <View key={policy.policyNumber} style={styles.policy}>
                <View style={styles.policyHeader}>
                  <Text style={styles.policyTitle}>Policy #{i + 1}</Text>
                </View>
                <View style={styles.grid}>
                  {(
                    [
                      ['Previous policy number', policy.policyNumber],
                      ['Previous Insurer name', policy.insurerName],
                      ['Sum insured', policy.sumInsured],
                      ['Start date', policy.startDate],
                      ['End date', policy.endDate],
                      ['Cumulative bonus', policy.cumulativeBonus],
                    ] as const
                  ).map(([label, value]) => (
                    <View key={label} style={styles.field}>
                      <Text style={styles.fieldLabel}>{label}</Text>
                      <Text style={styles.fieldValue}>{value}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </Accordion>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, gap: spacing.md, ...shadow.lg },
  heading: { fontFamily: fontFamilyForWeight('500'), fontSize: 20, fontWeight: '500', color: colors.textHeading },
  memberCard: { borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.lg, overflow: 'hidden' },
  // Accordion's panel body ships no padding — supply it here.
  body: { gap: spacing.lg, paddingHorizontal: spacing.md, paddingBottom: spacing.md, paddingTop: spacing.xs },
  policy: { gap: spacing.md },
  policyHeader: { backgroundColor: colors.surfaceSubtle, borderRadius: radius.lg, padding: spacing.md },
  policyTitle: { fontFamily: fontFamilyForWeight('500'), fontSize: 16, lineHeight: 24, fontWeight: '500', color: colors.textHeading },
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: spacing.md },
  field: { width: '50%', gap: 2, paddingRight: spacing.sm },
  fieldLabel: { fontFamily: typography.fontFamily, fontSize: 12, lineHeight: 16, color: colors.textBody },
  fieldValue: { fontFamily: typography.fontFamily, fontSize: 14, lineHeight: 20, color: colors.textHeading },
});
