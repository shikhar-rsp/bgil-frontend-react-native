import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { CheckCircle, Shield, ShieldStar, SketchLogo, XCircle } from 'phosphor-react-native';
import {
  Accordion,
  Checkbox,
  Dropdown,
  DatePicker,
  Radio,
  Badge,
  colors,
  spacing,
  radius,
  typography,
  shadow,
  fontFamilyForWeight,
} from '@atlas-ds/react-native';
import { RequiredField } from './RequiredField';
import { WhoIsCovered } from './WhoIsCovered';
import { CriticalIllnessPlans } from './CriticalIllnessPlans';
import { SheetSelect } from './SheetSelect';
import {
  PLAN_OPTIONS,
  SUB_PLANS,
  BASE_SUB_PLAN,
  SUM_INSURED_OPTIONS,
  formatRupees,
  rupeeAmount,
  type Coverage,
  type Member,
  type MemberDatum,
  type SubPlan,
} from './healthData';

interface PlanDetailsStepProps {
  /** `plan` = plan type + dates; `members` = member details + sub plan. */
  section: 'plan' | 'members';
  selectedPlan: string;
  setSelectedPlan: (val: string) => void;
  planType: string;
  setPlanType: (val: string) => void;
  coverage: Coverage;
  setCoverageCount: (id: string, count: number) => void;
  oldestMemberDOB: Date | null;
  setOldestMemberDOB: (date: Date | null) => void;
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
  /** Every member detail is filled in, so the sub-plan cards can quote a price. */
  priceReady: boolean;
  wantsCriticalIllness: string;
  setWantsCriticalIllness: (val: string) => void;
  grossMonthlyIncome: string;
  setGrossMonthlyIncome: (val: string) => void;
  occupation: string;
  setOccupation: (val: string) => void;
  hasDisability: string;
  setHasDisability: (val: string) => void;
  selectedCriticalPlans: string[];
  toggleCriticalPlan: (id: string) => void;
  onDownloadBrochure: () => void;
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
  section,
  selectedPlan,
  setSelectedPlan,
  planType,
  setPlanType,
  coverage,
  setCoverageCount,
  oldestMemberDOB,
  setOldestMemberDOB,
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
  priceReady,
  wantsCriticalIllness,
  setWantsCriticalIllness,
  grossMonthlyIncome,
  setGrossMonthlyIncome,
  occupation,
  setOccupation,
  hasDisability,
  setHasDisability,
  selectedCriticalPlans,
  toggleCriticalPlan,
  onDownloadBrochure,
}) => (
  <View style={styles.wrap}>
    {section === 'plan' ? (
    <View style={styles.card}>
      <Text style={styles.heading}>Plan Details</Text>
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

      <Dropdown label="Select Policy Plan" options={PLAN_OPTIONS} value={selectedPlan} onChange={setSelectedPlan} />

      <View style={styles.dates}>
        <RequiredField label="Policy start date">
          <DatePicker placeholder="Select start date" value={startDate} onChange={setStartDate} />
        </RequiredField>
        <RequiredField label="Policy end date">
          <DatePicker placeholder="Select end date" value={endDate} onChange={setEndDate} />
        </RequiredField>

        {/* Floater is one shared cover, so the amount is picked with the plan
            rather than per member. */}
        {planType === 'floater' ? (
          <RequiredField label="Total sum insured">
            <SheetSelect
              placeholder="Select sum insured"
              sheetTitle="Total sum insured"
              options={SUM_INSURED_OPTIONS}
              value={sumInsured}
              onChange={setSumInsured}
            />
          </RequiredField>
        ) : null}
      </View>
    </View>
    ) : null}

    {section === 'members' ? (
    <>
    {planType !== '' ? (
      <>
        <WhoIsCovered
          planType={planType}
          coverage={coverage}
          setCoverageCount={setCoverageCount}
          oldestMemberDOB={oldestMemberDOB}
          setOldestMemberDOB={setOldestMemberDOB}
        />

        {planType === 'individual' && members.length > 0 ? (
          <View style={styles.card}>
            <Text style={styles.heading}>Member Details</Text>
            <Checkbox
              size="sm"
              checked={keepSumInsuredSame}
              onChange={toggleKeepSumInsuredSame}
              label="Keep Sum Insured same for all"
            />

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
                        <SheetSelect
                          placeholder="Select sum insured"
                          sheetTitle="Sum insured"
                          options={SUM_INSURED_OPTIONS}
                          value={md.sumInsured || ''}
                          onChange={(val) => updateMember(member.id, 'sumInsured', val)}
                        />
                      </RequiredField>
                    </View>
                  </Accordion>
                );
              })}
            </View>
          </View>
        ) : null}
      </>
    ) : null}

    <View style={styles.card}>
      <Text style={styles.heading}>Select a sub plan</Text>
      <View style={styles.subPlans}>
        {SUB_PLANS.map((sp) => {
          const selected = subPlan === sp.id;
          const g = SUB_PLAN_GRADIENTS[sp.id];
          return (
            // Whole card is the radio target, matching motor's Suggested Plans —
            // the tier is a choice among three, not an action per card.
            <Pressable
              key={sp.id}
              onPress={() => setSubPlan(sp.id)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              style={[
                styles.subPlan,
                { borderColor: selected ? sp.border : colors.borderSubtle },
                selected && { backgroundColor: sp.tint },
              ]}
            >
              {/* Background-only gradient — on iOS it paints over its own children. */}
              <View style={styles.subPlanHead}>
                <LinearGradient
                  useAngle
                  angle={g.angle}
                  colors={g.colors}
                  locations={g.locations}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.subPlanTop}>
                  <View style={[styles.subPlanIcon, { backgroundColor: sp.iconBg }]}>
                    <SubPlanIcon id={sp.id} />
                  </View>
                  <Radio selected={selected} onPress={() => setSubPlan(sp.id)} />
                </View>
                <View style={styles.subPlanTitleRow}>
                  <Text style={styles.subPlanName}>{sp.name}</Text>
                  <Badge variant="solid" size="sm" color={sp.badgeColor} label={sp.badge} />
                </View>

                {/* Premiums stay blanked out until every member detail is in —
                    a price quoted off half-filled member data would be wrong. */}
                {priceReady ? (
                  <>
                    {/* "Rs." stays regular; only the amount is medium. */}
                    <Text style={styles.subPlanPrice}>
                      <Text style={styles.subPlanPriceCurrency}>Rs. </Text>
                      {rupeeAmount(sp.premium)}
                    </Text>
                    <Text style={styles.subPlanPriceNote}>
                      for 1 yr · {formatRupees(sp.premium)}/yr
                    </Text>
                    {sp.premium > BASE_SUB_PLAN.premium ? (
                      <Badge
                        variant="light"
                        size="sm"
                        color={sp.badgeColor}
                        label={`+${formatRupees(sp.premium - BASE_SUB_PLAN.premium)} over ${BASE_SUB_PLAN.name}`}
                        style={styles.subPlanUplift}
                      />
                    ) : null}
                  </>
                ) : (
                  <>
                    <Text style={styles.subPlanPriceEmpty}>
                      <Text style={styles.subPlanPriceCurrency}>Rs. </Text>
                      --
                    </Text>
                    <Text style={styles.subPlanPriceNote}>Add more details for price</Text>
                  </>
                )}
              </View>
              <View style={styles.benefits}>
                <Text style={styles.benefitsHeading}>What you get</Text>
                {sp.benefits.map((b, i) => (
                  <View key={i} style={styles.benefitRow}>
                    {b.excluded ? (
                      <XCircle size={16} color={colors.danger} />
                    ) : (
                      <CheckCircle size={16} color={colors.success} />
                    )}
                    <Text style={[styles.benefitText, b.excluded && styles.benefitTextExcluded]}>
                      {b.label}:{' '}
                      <Text style={[styles.benefitValue, b.excluded && styles.benefitTextExcluded]}>{b.value}</Text>
                    </Text>
                  </View>
                ))}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>

    <CriticalIllnessPlans
      wantsCriticalIllness={wantsCriticalIllness}
      setWantsCriticalIllness={setWantsCriticalIllness}
      grossMonthlyIncome={grossMonthlyIncome}
      setGrossMonthlyIncome={setGrossMonthlyIncome}
      occupation={occupation}
      setOccupation={setOccupation}
      hasDisability={hasDisability}
      setHasDisability={setHasDisability}
      selectedPlans={selectedCriticalPlans}
      togglePlan={toggleCriticalPlan}
      onDownloadBrochure={onDownloadBrochure}
    />

    </>
    ) : null}
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
  planTypeSel: { borderColor: colors.brand, backgroundColor: '#EFF6FF' },
  planTypeLabel: { fontFamily: typography.fontFamily, fontSize: 15, color: colors.textHeading },
  dates: { gap: spacing.md },
  members: { gap: spacing.md, marginTop: spacing.sm },
  memberCard: { borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.xl, overflow: 'hidden' },
  // Accordion's panel body ships no padding — supply the field spacing here.
  memberFields: { gap: spacing.md, paddingHorizontal: spacing.md, paddingBottom: spacing.md, paddingTop: spacing.xs },
  subPlans: { gap: spacing.md },
  subPlan: { borderWidth: 1, borderRadius: radius.lg, padding: spacing.md, gap: spacing.md },
  // `overflow` rounds off the absolutely-filled gradient behind the content.
  subPlanHead: { gap: spacing.xs, padding: spacing.md, borderRadius: radius.lg, overflow: 'hidden' },
  // Tier glyph left, radio right — the same header row motor's plan cards use.
  subPlanTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  subPlanIcon: { width: 32, height: 32, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  subPlanTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs },
  subPlanName: { fontFamily: typography.fontFamily, fontSize: 22, fontWeight: '500', color: colors.textHeading },
  subPlanPrice: { fontFamily: fontFamilyForWeight('500'), fontSize: 28, lineHeight: 34, fontWeight: '500', color: colors.textHeading, marginTop: spacing.xs },
  subPlanPriceCurrency: { fontFamily: typography.fontFamily, fontWeight: '400' },
  // Same size as the quoted figure so the card doesn't resize once priced.
  subPlanPriceEmpty: { fontFamily: fontFamilyForWeight('500'), fontSize: 26, lineHeight: 34, fontWeight: '500', color: colors.textDisabled, marginTop: spacing.xs },
  // Negative top margin cancels the header's row gap, so the note sits tight
  // under the figure it annotates rather than reading as the next row.
  subPlanPriceNote: { fontFamily: typography.fontFamily, fontSize: 12, lineHeight: 16, color: colors.textMuted, marginTop: -spacing.xs },
  subPlanUplift: { marginTop: spacing.xxs },
  benefits: { gap: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.borderSubtle },
  benefitsHeading: { fontFamily: fontFamilyForWeight('500'), fontSize: 14, fontWeight: '500', color: colors.textHeading },
  // `flex-start` so the icon stays on the first line when the row wraps.
  benefitRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  benefitText: { flex: 1, fontFamily: typography.fontFamily, fontSize: 14, lineHeight: 20, color: colors.textBody },
  benefitTextExcluded: { color: colors.textMuted },
  benefitValue: { fontFamily: fontFamilyForWeight('500'), fontWeight: '500', color: colors.textHeading },
});
