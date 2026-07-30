import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Badge, Dropdown, DatePicker, Radio, colors, spacing, radius, typography, shadow, fontFamilyForWeight } from '@atlas-ds/react-native';
import { RequiredLabel } from '../RequiredField';
import { CurrentPolicyCard } from './CurrentPolicyCard';
import { SubPlanCard } from './SubPlanCard';
import { EligibleAddOnPoliciesCard } from './EligibleAddOnPoliciesCard';
import type { Renewal } from '../businessData';
import {
  POLICY_PLAN_OPTIONS,
  PLAN_TYPE_OPTIONS,
  TENURE_OPTIONS,
  type RenewalPlanType,
  type SubPlanValue,
} from './renewalData';

interface PolicyDetailsStepProps {
  record?: Renewal;
  /** Hidden in the renewal "Edit Entire Policy" flow, which keeps dates only. */
  showPolicyPlan: boolean;
  /** Only shown for the `entire-policy` and `plan-type` edit options. */
  showPlanType: boolean;
  policyPlan: string;
  onChangePolicyPlan: (value: string) => void;
  planType: RenewalPlanType;
  onChangePlanType: (value: RenewalPlanType) => void;
  startDate: Date | null;
  onChangeStartDate: (d: Date | null) => void;
  endDate: Date | null;
  onChangeEndDate: (d: Date | null) => void;
  tenure: string;
  onChangeTenure: (value: string) => void;
  subPlan: SubPlanValue | null;
  onSelectSubPlan: (value: SubPlanValue) => void;
  selectedEligible: string[];
  onToggleEligible: (id: string) => void;
  onDownloadPolicy: () => void;
}

/** Policy details — plan, plan type, policy dates, tenure, sub plan, cross-sell. */
export const PolicyDetailsStep: React.FC<PolicyDetailsStepProps> = ({
  record,
  showPolicyPlan,
  showPlanType,
  policyPlan,
  onChangePolicyPlan,
  planType,
  onChangePlanType,
  startDate,
  onChangeStartDate,
  endDate,
  onChangeEndDate,
  tenure,
  onChangeTenure,
  subPlan,
  onSelectSubPlan,
  selectedEligible,
  onToggleEligible,
  onDownloadPolicy,
}) => (
  <View style={styles.wrap}>
    <CurrentPolicyCard record={record} editable onDownload={onDownloadPolicy} />

    <View style={styles.card}>
      <Text style={styles.heading}>Policy details</Text>

      {showPolicyPlan ? (
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Select Policy Plan</Text>
          <Dropdown
            placeholder="Select plan"
            value={policyPlan || null}
            options={POLICY_PLAN_OPTIONS}
            onChange={onChangePolicyPlan}
          />
        </View>
      ) : null}

      {showPlanType ? (
        <View style={styles.field}>
          <RequiredLabel text="Select plan type" />
          <View style={styles.planTypeRow}>
            {PLAN_TYPE_OPTIONS.map((opt) => {
              const selected = planType === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => onChangePlanType(opt.value)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  accessibilityLabel={opt.label}
                  style={[styles.planTypeOption, selected && styles.planTypeSelected]}
                >
                  <Radio selected={selected} onPress={() => onChangePlanType(opt.value)} />
                  <Text style={styles.planTypeLabel}>{opt.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}

      <View style={styles.field}>
        <RequiredLabel text="Policy start date" />
        <DatePicker placeholder="dd/mm/yyyy" value={startDate} onChange={onChangeStartDate} />
      </View>
      <View style={styles.field}>
        <RequiredLabel text="Policy end date" />
        <DatePicker placeholder="dd/mm/yyyy" value={endDate} onChange={onChangeEndDate} />
      </View>

      <View style={styles.field}>
        <RequiredLabel text="Choose policy tenure" />
        {TENURE_OPTIONS.map((opt) => {
          const selected = tenure === opt.value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => onChangeTenure(opt.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={`${opt.label} — ${opt.price}`}
              style={[styles.tenure, selected && styles.tenureSelected]}
            >
              <View style={styles.tenureTop}>
                <View style={styles.tenureTitleRow}>
                  <Text style={styles.tenureLabel}>{opt.label}</Text>
                  {opt.badge ? <Badge label={opt.badge} variant="solid" size="sm" color="emerald" /> : null}
                </View>
                <Radio selected={selected} onPress={() => onChangeTenure(opt.value)} />
              </View>
              <Text style={styles.tenurePrice}>{opt.price}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>

    <SubPlanCard subPlan={subPlan} onSelect={onSelectSubPlan} />

    <EligibleAddOnPoliciesCard selectedEligible={selectedEligible} onToggle={onToggleEligible} />
  </View>
);

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, gap: spacing.md, ...shadow.lg },
  heading: { fontFamily: fontFamilyForWeight('500'), fontSize: 20, fontWeight: '500', color: colors.textHeading },
  field: { gap: spacing.sm, alignSelf: 'stretch' },
  fieldLabel: { fontFamily: typography.fontFamily, fontSize: 14, lineHeight: 20, color: colors.textBody },
  planTypeRow: { flexDirection: 'row', gap: spacing.sm },
  planTypeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  planTypeSelected: { borderColor: '#3B82F6', backgroundColor: '#EFF6FF' },
  planTypeLabel: { fontFamily: typography.fontFamily, fontSize: 15, color: colors.textHeading, flexShrink: 1 },
  tenure: {
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.xs,
    backgroundColor: colors.surface,
  },
  tenureSelected: { borderColor: '#3B82F6', backgroundColor: '#EFF6FF' },
  tenureTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  tenureTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexShrink: 1 },
  tenureLabel: { fontFamily: typography.fontFamily, fontSize: 16, color: colors.textHeading },
  tenurePrice: { fontFamily: fontFamilyForWeight('500'), fontSize: 20, fontWeight: '500', color: colors.textHeading },
});
