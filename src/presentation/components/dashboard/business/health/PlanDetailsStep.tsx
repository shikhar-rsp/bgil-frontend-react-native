import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Check, CheckCircle, Shield, ShieldStar, SketchLogo } from 'phosphor-react-native';
import {
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
} from '@atlas-ds/react-native';
import { Suggestions } from '../motor/Suggestions';
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
}

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
}) => (
  <View style={styles.wrap}>
    <View style={styles.card}>
      <Text style={styles.heading}>Plan Details</Text>
      <Dropdown label="Select Policy Plan" options={PLAN_OPTIONS} value={selectedPlan} onChange={setSelectedPlan} />

      <View>
        <Text style={styles.label}>Select plan type *</Text>
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
        <DatePicker label="Policy start date *" placeholder="Select start date" value={startDate} onChange={setStartDate} />
        <DatePicker label="Policy end date *" placeholder="Select end date" value={endDate} onChange={setEndDate} />
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
          <Text style={styles.label}>Select adults *</Text>
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
              {members.map((member) => {
                const md = memberData[member.id] || { dob: null, sumInsured: '' };
                return (
                  <View key={member.id} style={styles.memberCard}>
                    <Text style={styles.memberLabel}>{member.label}</Text>
                    <DatePicker
                      label="Date of Birth *"
                      placeholder="Select DOB"
                      value={md.dob}
                      onChange={(val) => updateMember(member.id, 'dob', val)}
                    />
                    <Textfield
                      label="Sum Insured *"
                      value={formatIndianCurrency(md.sumInsured || '')}
                      onChangeText={(t) => updateMember(member.id, 'sumInsured', numericOnly(t))}
                      placeholder="Rs."
                      keyboardType="number-pad"
                    />
                  </View>
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
          return (
            <View key={sp.id} style={[styles.subPlan, { borderColor: sp.border }, selected && { backgroundColor: sp.tint }]}>
              <View style={styles.subPlanHead}>
                <View style={[styles.subPlanIcon, { backgroundColor: sp.iconBg }]}>
                  <SubPlanIcon id={sp.id} />
                </View>
                <View style={styles.subPlanTitleRow}>
                  <Text style={styles.subPlanName}>{sp.name}</Text>
                  <Badge variant="solid" size="sm" color={sp.badgeColor} label={sp.badge} />
                </View>
                <Text style={styles.subPlanTagline}>Lorem ipsum dolor sit amet</Text>
              </View>
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
  </View>
);

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, gap: spacing.md, ...shadow.lg },
  heading: { fontFamily: typography.fontFamily, fontSize: 20, fontWeight: '600', color: colors.textHeading },
  sub: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textBody },
  label: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textBody },
  planTypeRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  planType: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.lg, padding: spacing.md },
  planTypeSel: { borderColor: '#3B82F6', backgroundColor: '#EFF6FF' },
  planTypeLabel: { fontFamily: typography.fontFamily, fontSize: 15, color: colors.textHeading },
  dates: { gap: spacing.md },
  members: { gap: spacing.md, marginTop: spacing.sm },
  memberCard: { borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.xl, padding: spacing.md, gap: spacing.md },
  memberLabel: { fontFamily: typography.fontFamily, fontSize: 15, fontWeight: '500', color: colors.textHeading },
  subPlans: { gap: spacing.md },
  subPlan: { borderWidth: 1, borderRadius: radius.lg, padding: spacing.md, gap: spacing.md },
  subPlanHead: { gap: spacing.xs, padding: spacing.md, borderRadius: radius.lg, backgroundColor: colors.surfaceSubtle },
  subPlanIcon: { width: 32, height: 32, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  subPlanTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs },
  subPlanName: { fontFamily: typography.fontFamily, fontSize: 22, fontWeight: '500', color: colors.textHeading },
  subPlanTagline: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textBody },
  benefits: { gap: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.borderSubtle },
  benefitsHeading: { fontFamily: typography.fontFamily, fontSize: 14, fontWeight: '500', color: colors.textHeading },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  benefitText: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textBody },
});
