import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Check, CheckCircle, Shield, ShieldStar, SketchLogo } from 'phosphor-react-native';
import {
  Accordion,
  Checkbox,
  Dropdown,
  DatePicker,
  Radio,
  SegmentedControl,
  Slider,
  Textfield,
  Badge,
  Button,
  colors,
  spacing,
  radius,
  typography,
  shadow,
  fontFamilyForWeight,
} from '@atlas-ds/react-native';
import { Suggestions } from '../motor/Suggestions';
import { PolicyTenurePremium } from './PolicyTenurePremium';
import { RequiredField } from './RequiredField';
import {
  PLAN_OPTIONS,
  COUNT_OPTIONS,
  SUB_PLANS,
  SUM_INSURED_MIN,
  SUM_INSURED_MAX,
  formatIndianCurrency,
  numericOnly,
  type Member,
  type MemberDatum,
  type SubPlan,
} from './healthData';

interface PlanDetailsStepProps {
  selectedPlan: string;
  setSelectedPlan: (val: string) => void;
  planType: string;
  setPlanType: (val: string) => void;
  adults: string;
  setAdults: (val: string) => void;
  seniorCitizens: string;
  setSeniorCitizens: (val: string) => void;
  childrenCount: string;
  setChildrenCount: (val: string) => void;
  startDate: Date | null;
  setStartDate: (date: Date | null) => void;
  endDate: Date | null;
  setEndDate: (date: Date | null) => void;
  subPlan: string;
  setSubPlan: (val: string) => void;
  sumInsured: string;
  setSumInsured: (val: string) => void;
  members: Member[];
  memberData: Record<string, MemberDatum>;
  updateMember: (id: string, field: keyof MemberDatum, value: MemberDatum[keyof MemberDatum]) => void;
  keepSumInsuredSame: boolean;
  toggleKeepSumInsuredSame: () => void;
}

/**
 * Per-tier gradient for the sub-plan header block. Locations mirror the Figma
 * percentages; the final stop (>100% in the design) is clamped to 1 since
 * LinearGradient requires locations within [0, 1].
 */
const SUB_PLAN_GRADIENTS: Record<
  SubPlan['id'],
  { colors: string[]; locations: number[]; angle: number }
> = {
  gold: { colors: ['#FFFFFF', '#FFFBEB', '#FED7AA', '#FEF3C7'], locations: [0, 0.2816, 0.6073, 1], angle: 104.17 },
  silver: { colors: ['#FFFFFF', '#E2E8F0', '#F8FAFC', '#F1F5F9'], locations: [0, 0.3468, 0.6493, 1], angle: 102.54 },
  platinum: { colors: ['#FFFFFF', '#EFF6FF', '#E0E7FF', '#EFF6FF'], locations: [0, 0.2816, 0.6073, 1], angle: 104.17 },
};

const SubPlanIcon: React.FC<{ id: string }> = ({ id }) => {
  if (id === 'silver') {
    return <Shield size={20} color="#FFFFFF" />;
  }
  if (id === 'gold') {
    return <ShieldStar size={20} color="#FFFFFF" />;
  }
  return <SketchLogo size={20} color="#FFFFFF" />;
};

export const PlanDetailsStep: React.FC<PlanDetailsStepProps> = ({
  selectedPlan,
  setSelectedPlan,
  planType,
  setPlanType,
  adults,
  setAdults,
  seniorCitizens,
  setSeniorCitizens,
  childrenCount,
  setChildrenCount,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  subPlan,
  setSubPlan,
  sumInsured,
  setSumInsured,
  members,
  memberData,
  updateMember,
  keepSumInsuredSame,
  toggleKeepSumInsuredSame,
}) => (
  <View style={styles.wrap}>
    <View style={styles.card}>
      <Text style={styles.heading}>Plan Details</Text>
      <Dropdown label="Select Policy Plan" options={PLAN_OPTIONS} value={selectedPlan} onChange={setSelectedPlan} />

      <View>
        <Text style={styles.label}>Select plan type <Text style={styles.asterisk}>*</Text></Text>
        <View style={styles.planTypeRow}>
          {(['individual', 'floater'] as const).map((v) => (
            <Pressable
              key={v}
              style={[styles.planType, planType === v && styles.planTypeSel]}
              onPress={() => setPlanType(v)}
              accessibilityRole="radio"
              accessibilityState={{ selected: planType === v }}
            >
              <Radio selected={planType === v} onPress={() => setPlanType(v)} />
              <Text style={styles.planTypeLabel}>{v === 'individual' ? 'Individual' : 'Floater'}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.dates}>
        <RequiredField label="Policy start date">
          <DatePicker placeholder="Select start date" value={startDate} onChange={setStartDate} />
        </RequiredField>
        <RequiredField label="Policy end date">
          <DatePicker placeholder="Select end date" value={endDate} onChange={setEndDate} />
        </RequiredField>
      </View>
    </View>

    {planType !== '' ? (
      <>
        {planType === 'floater' ? (
          <View style={styles.card}>
            <Text style={styles.heading}>Select sum insured</Text>
            <Text style={styles.sub}>The selected amount will be the same for all members of the policy.</Text>
            <Textfield
              value={formatIndianCurrency(sumInsured)}
              onChangeText={(t) => setSumInsured(numericOnly(t))}
              placeholder="Rs."
              keyboardType="number-pad"
            />
            <Slider
              min={SUM_INSURED_MIN}
              max={SUM_INSURED_MAX}
              value={Number(sumInsured) || SUM_INSURED_MIN}
              onChange={(val) => typeof val === 'number' && setSumInsured(String(val))}
            />
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.heading}>Member Details</Text>
          {planType === 'individual' && members.length > 0 ? (
            <Checkbox
              size="sm"
              checked={keepSumInsuredSame}
              onChange={toggleKeepSumInsuredSame}
              label="Keep Sum Insured same for all"
            />
          ) : null}
          <Text style={styles.label}>Select adults <Text style={styles.asterisk}>*</Text></Text>
          <SegmentedControl size="sm" value={adults} onChange={setAdults} options={COUNT_OPTIONS} />
          {planType === 'individual' ? (
            <>
              <Text style={styles.label}>Select senior citizens</Text>
              <SegmentedControl size="sm" value={seniorCitizens} onChange={setSeniorCitizens} options={COUNT_OPTIONS} />
            </>
          ) : null}
          <Text style={styles.label}>Select children</Text>
          <SegmentedControl size="sm" value={childrenCount} onChange={setChildrenCount} options={COUNT_OPTIONS} />

          {planType === 'individual' && members.length > 0 ? (
            <View style={styles.members}>
              {members.map((member, idx) => {
                const md = memberData[member.id] || { dob: null, sumInsured: '' };
                return (
                  <Accordion
                    key={member.id}
                    label={member.label}
                    defaultOpen={idx === 0}
                    style={styles.memberCard}
                  >
                    <View style={styles.memberFields}>
                      <RequiredField label="Date of Birth">
                        <DatePicker
                          placeholder="Select DOB"
                          value={md.dob}
                          onChange={(val) => updateMember(member.id, 'dob', val)}
                        />
                      </RequiredField>
                      <RequiredField label="Sum Insured">
                        <Textfield
                          value={formatIndianCurrency(md.sumInsured || '')}
                          onChangeText={(t) => updateMember(member.id, 'sumInsured', numericOnly(t))}
                          placeholder="Rs."
                          keyboardType="number-pad"
                        />
                      </RequiredField>
                    </View>
                  </Accordion>
                );
              })}
            </View>
          ) : null}
        </View>
      </>
    ) : null}

    <View style={styles.card}>
      <Text style={styles.heading}>Select a sub plan</Text>
      <View style={styles.subPlans}>
        {SUB_PLANS.map((sp) => {
          const selected = subPlan === sp.id;
          const g = SUB_PLAN_GRADIENTS[sp.id];
          return (
            <View key={sp.id} style={[styles.subPlan, { borderColor: sp.border }, selected && { backgroundColor: sp.tint }]}>
              <LinearGradient
                useAngle
                angle={g.angle}
                colors={g.colors}
                locations={g.locations}
                style={styles.subPlanHead}
              >
                <View style={[styles.subPlanIcon, { backgroundColor: sp.iconBg }]}>
                  <SubPlanIcon id={sp.id} />
                </View>
                <View style={styles.subPlanTitleRow}>
                  <Text style={styles.subPlanName}>{sp.name}</Text>
                  <Badge variant="solid" size="sm" color={sp.badgeColor} label={sp.badge} />
                </View>
                <Text style={styles.subPlanTagline}>Lorem ipsum dolor sit amet</Text>
              </LinearGradient>
              <Button
                label={selected ? 'Selected' : 'Select sub plan'}
                variant={selected ? 'primary' : 'secondaryGray'}
                onPress={() => setSubPlan(sp.id)}
                fullWidth
              />
              <View style={styles.benefits}>
                <Text style={styles.benefitsHeading}>What you get</Text>
                {sp.benefits.map((b, i) => (
                  <View key={i} style={styles.benefitRow}>
                    <CheckCircle size={13} color={colors.textBody} />
                    <Text style={styles.benefitText}>{b}</Text>
                  </View>
                ))}
              </View>
            </View>
          );
        })}
      </View>
    </View>

    <Suggestions />

    <PolicyTenurePremium />
  </View>
);

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, gap: spacing.md, ...shadow.lg },
  heading: { fontFamily: fontFamilyForWeight('500'), fontSize: 20, fontWeight: '500', color: colors.textHeading },
  sub: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textBody },
  label: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textBody },
  asterisk: { color: colors.dangerText },
  planTypeRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  planType: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.lg, padding: spacing.md },
  planTypeSel: { borderColor: '#3B82F6', backgroundColor: '#EFF6FF' },
  planTypeLabel: { fontFamily: typography.fontFamily, fontSize: 15, color: colors.textHeading },
  dates: { gap: spacing.md },
  members: { gap: spacing.md, marginTop: spacing.sm },
  memberCard: { borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.xl, overflow: 'hidden' },
  // Accordion's panel body ships no padding — supply the field spacing here.
  memberFields: { gap: spacing.md, paddingHorizontal: spacing.md, paddingBottom: spacing.md, paddingTop: spacing.xs },
  subPlans: { gap: spacing.md },
  subPlan: { borderWidth: 1, borderRadius: radius.lg, padding: spacing.md, gap: spacing.md },
  subPlanHead: { gap: spacing.xs, padding: spacing.md, borderRadius: radius.lg },
  subPlanIcon: { width: 32, height: 32, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  subPlanTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs },
  subPlanName: { fontFamily: typography.fontFamily, fontSize: 22, fontWeight: '500', color: colors.textHeading },
  subPlanTagline: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textBody },
  benefits: { gap: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.borderSubtle },
  benefitsHeading: { fontFamily: typography.fontFamily, fontSize: 14, fontWeight: '500', color: colors.textHeading },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  benefitText: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textBody },
});
