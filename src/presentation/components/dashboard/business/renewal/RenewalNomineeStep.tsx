import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  Accordion,
  Checkbox,
  DatePicker,
  Dropdown,
  Slider,
  Textfield,
  colors,
  spacing,
  radius,
  typography,
  shadow,
  fontFamilyForWeight,
} from '@atlas-ds/react-native';
import { RequiredField, RequiredLabel } from '../RequiredField';
import { CurrentPolicyCard } from './CurrentPolicyCard';
import { EligibleAddOnPoliciesCard } from './EligibleAddOnPoliciesCard';
import type { Renewal } from '../businessData';
import { NOMINEE_RELATIONSHIP_OPTIONS, type RenewalMemberEntry, type RenewalNomineeData } from './renewalData';

const ALLOCATION_MIN = 15;

interface RenewalNomineeStepProps {
  record?: Renewal;
  /** One nominee row per member still on the policy. */
  members: RenewalMemberEntry[];
  nomineeData: Record<string, RenewalNomineeData>;
  updateNomineeData: (
    memberId: string,
    field: keyof RenewalNomineeData,
    value: RenewalNomineeData[keyof RenewalNomineeData],
  ) => void;
  keepSameForAll: boolean;
  onToggleKeepSameForAll: (value: boolean) => void;
  /** Renewal flows cross-sell eligible policies below the nominees. */
  showEligible?: boolean;
  selectedEligible: string[];
  onToggleEligible: (id: string) => void;
  banner?: React.ReactNode;
  onDownloadPolicy: () => void;
}

/** Nominee details — one nominee per insured member, mirroring the live member list. */
export const RenewalNomineeStep: React.FC<RenewalNomineeStepProps> = ({
  record,
  members,
  nomineeData,
  updateNomineeData,
  keepSameForAll,
  onToggleKeepSameForAll,
  showEligible,
  selectedEligible,
  onToggleEligible,
  banner,
  onDownloadPolicy,
}) => (
  <View style={styles.wrap}>
    <CurrentPolicyCard record={record} editable onDownload={onDownloadPolicy} />

    {banner}

    <View style={styles.card}>
      <Text style={styles.heading}>Nominee details</Text>
      <Checkbox
        size="sm"
        checked={keepSameForAll}
        onChange={onToggleKeepSameForAll}
        label="Keep nominee details same for all members"
      />

      {members.map((member, index) => {
        const nominee = nomineeData[member.id];
        const complete = Boolean(nominee?.name?.trim() && nominee?.relationship && nominee?.dob);
        const allocation = nominee?.allocation ?? ALLOCATION_MIN;
        return (
          <Accordion
            key={member.id}
            label={member.label}
            defaultOpen={index === 0}
            badgeText={complete ? 'Nominee added' : 'Nominee not added'}
            badgeColor={complete ? 'emerald' : 'red'}
            badgeVariant="light"
            style={styles.memberCard}
          >
            <View style={styles.body}>
              <RequiredField label="Nominee name">
                <Textfield
                  value={nominee?.name ?? ''}
                  onChangeText={(t) => updateNomineeData(member.id, 'name', t)}
                  placeholder="Enter full name"
                />
              </RequiredField>
              <RequiredField label="Relationship with insured">
                <Dropdown
                  placeholder="Select relationship"
                  value={nominee?.relationship || null}
                  options={NOMINEE_RELATIONSHIP_OPTIONS}
                  onChange={(v) => updateNomineeData(member.id, 'relationship', v)}
                />
              </RequiredField>
              <RequiredField label="Date of Birth">
                <DatePicker
                  placeholder="dd/mm/yyyy"
                  value={nominee?.dob ?? null}
                  onChange={(d) => updateNomineeData(member.id, 'dob', d)}
                />
              </RequiredField>

              <View style={styles.allocBlock}>
                <View style={styles.allocHeader}>
                  <RequiredLabel text="Allocation Percentage" />
                  <Text style={styles.allocValue}>{allocation}%</Text>
                </View>
                <Slider
                  min={ALLOCATION_MIN}
                  max={100}
                  value={allocation}
                  onChange={(v) =>
                    updateNomineeData(member.id, 'allocation', typeof v === 'number' ? v : v[0])
                  }
                  showDataRange={false}
                />
                <View style={styles.allocRange}>
                  <Text style={styles.allocRangeText}>{ALLOCATION_MIN}%</Text>
                  <Text style={styles.allocRangeText}>100%</Text>
                </View>
              </View>
            </View>
          </Accordion>
        );
      })}
    </View>

    {showEligible ? (
      <EligibleAddOnPoliciesCard selectedEligible={selectedEligible} onToggle={onToggleEligible} />
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, gap: spacing.md, ...shadow.lg },
  heading: { fontFamily: fontFamilyForWeight('500'), fontSize: 20, fontWeight: '500', color: colors.textHeading },
  memberCard: { borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.lg, overflow: 'hidden' },
  // Accordion's panel body ships no padding — supply it here.
  body: { gap: spacing.md, paddingHorizontal: spacing.md, paddingBottom: spacing.md, paddingTop: spacing.xs },
  allocBlock: { gap: spacing.xs },
  allocHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  allocValue: { fontFamily: fontFamilyForWeight('500'), fontSize: 14, fontWeight: '500', color: colors.textHeading },
  allocRange: { flexDirection: 'row', justifyContent: 'space-between' },
  allocRangeText: { fontFamily: typography.fontFamily, fontSize: 12, color: colors.textMuted },
});
