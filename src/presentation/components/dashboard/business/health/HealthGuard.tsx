import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Modal, StyleSheet } from 'react-native';
import { Button, ProgressStepper, colors, spacing, radius, typography } from '@atlas-ds/react-native';
import { HealthGuardHeader } from './HealthGuardHeader';
import { PlanDetailsStep } from './PlanDetailsStep';
import { ProposerDetailsStep } from './ProposerDetailsStep';
import { AddOnsStep } from './AddOnsStep';
import { PreviewStep } from './PreviewStep';
import { buildMembers, type MemberDatum } from './healthData';

const STEPS = [
  { label: 'Plan' },
  { label: 'Proposer' },
  { label: 'Add-ons' },
  { label: 'Preview' },
];

interface HealthGuardProps {
  productName: string;
  onClose: () => void;
  onConvertToProposal: (customer: string) => void;
}

/**
 * Detailed Health Guard quote flow (ported faithfully from web dashboard/p5):
 * Plan Details (plan type, members, per-member sum insured, sub-plans) →
 * Proposer KYC → per-member Add-ons → Preview & Share.
 */
export const HealthGuard: React.FC<HealthGuardProps> = ({ productName, onClose, onConvertToProposal }) => {
  const [currentStep, setCurrentStep] = useState(1);

  const [selectedPlan, setSelectedPlan] = useState('health-guard');
  const [planType, setPlanType] = useState('');
  const [subPlan, setSubPlan] = useState('');
  const [adults, setAdults] = useState('0');
  const [seniorCitizens, setSeniorCitizens] = useState('0');
  const [childrenCount, setChildrenCount] = useState('0');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [sumInsured, setSumInsured] = useState('');

  const [proposerIsMember, setProposerIsMember] = useState(false);
  const [proposerName, setProposerName] = useState('');
  const [proposerDOB, setProposerDOB] = useState<Date | null>(null);
  const [annualIncome, setAnnualIncome] = useState('');
  const [pincode, setPincode] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');

  const [memberData, setMemberData] = useState<Record<string, MemberDatum>>({});
  const [keepSumInsuredSame, setKeepSumInsuredSame] = useState(false);
  const [keepAddOnsSame, setKeepAddOnsSame] = useState(false);
  const [floaterAddOns, setFloaterAddOns] = useState<string[]>([]);
  const [showShare, setShowShare] = useState(false);

  const members = useMemo(
    () => buildMembers(proposerIsMember, proposerName, Number(adults), Number(seniorCitizens), Number(childrenCount)),
    [proposerIsMember, proposerName, adults, seniorCitizens, childrenCount],
  );

  const updateMember = (id: string, field: keyof MemberDatum, value: MemberDatum[keyof MemberDatum]) => {
    setMemberData((prev) => {
      const base: MemberDatum = prev[id] ?? { dob: null, sumInsured: '', selectedAddOns: [], wantsAddOns: '' };
      const next = { ...prev, [id]: { ...base, [field]: value } };
      // Keep sum-insured / add-ons in sync across members when toggled on.
      if (field === 'sumInsured' && keepSumInsuredSame) {
        members.forEach((m) => {
          next[m.id] = { ...(next[m.id] ?? base), sumInsured: value as string };
        });
      }
      if (field === 'selectedAddOns' && keepAddOnsSame) {
        members.forEach((m) => {
          next[m.id] = { ...(next[m.id] ?? base), selectedAddOns: value as string[] };
        });
      }
      return next;
    });
  };

  const isStep1Valid =
    planType !== '' &&
    subPlan !== '' &&
    (planType === 'floater'
      ? sumInsured !== ''
      : members.length > 0 && members.every((m) => memberData[m.id]?.dob && memberData[m.id]?.sumInsured));
  const isStep2Valid = proposerName !== '' && proposerDOB !== null && annualIncome !== '' && pincode.length === 6;

  const canProceed = currentStep === 1 ? isStep1Valid : currentStep === 2 ? isStep2Valid : true;

  const goNext = () => setCurrentStep((s) => Math.min(s + 1, STEPS.length));

  return (
    <View style={styles.flex}>
      <View style={styles.stepperWrap}>
        <ProgressStepper steps={STEPS} current={currentStep - 1} onStepPress={(i) => i < currentStep && setCurrentStep(i + 1)} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {currentStep !== 4 ? <HealthGuardHeader productName={productName} /> : null}

        {currentStep === 1 ? (
          <PlanDetailsStep
            selectedPlan={selectedPlan}
            setSelectedPlan={setSelectedPlan}
            planType={planType}
            setPlanType={setPlanType}
            adults={adults}
            setAdults={setAdults}
            seniorCitizens={seniorCitizens}
            setSeniorCitizens={setSeniorCitizens}
            childrenCount={childrenCount}
            setChildrenCount={setChildrenCount}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            subPlan={subPlan}
            setSubPlan={setSubPlan}
            sumInsured={sumInsured}
            setSumInsured={setSumInsured}
            members={members}
            memberData={memberData}
            updateMember={updateMember}
          />
        ) : currentStep === 2 ? (
          <ProposerDetailsStep
            proposerIsMember={proposerIsMember}
            setProposerIsMember={setProposerIsMember}
            proposerName={proposerName}
            setProposerName={setProposerName}
            proposerDOB={proposerDOB}
            setProposerDOB={setProposerDOB}
            annualIncome={annualIncome}
            setAnnualIncome={setAnnualIncome}
            pincode={pincode}
            setPincode={setPincode}
            city={city}
            setCity={setCity}
            state={state}
            setState={setState}
          />
        ) : currentStep === 3 ? (
          <AddOnsStep
            planType={planType}
            members={members}
            memberData={memberData}
            updateMember={updateMember}
            keepAddOnsSame={keepAddOnsSame}
            toggleKeepAddOnsSame={() => setKeepAddOnsSame((v) => !v)}
            onSkipAndProceed={goNext}
            floaterAddOns={floaterAddOns}
            setFloaterAddOns={setFloaterAddOns}
          />
        ) : (
          <PreviewStep
            productName={productName}
            planType={planType}
            subPlan={subPlan}
            proposerName={proposerName}
            proposerDOB={proposerDOB}
            members={members}
            memberData={memberData}
          />
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={currentStep === 4 ? 'Back' : 'Reset form'}
          variant="secondaryGray"
          size="sm"
          onPress={() => (currentStep === 4 ? setCurrentStep(3) : setCurrentStep(1))}
        />
        {currentStep < 4 ? (
          <View style={styles.right}>
            <Button label="Back" variant="secondary" size="sm" onPress={() => (currentStep > 1 ? setCurrentStep(currentStep - 1) : onClose())} />
            <Button label="Proceed" size="sm" disabled={!canProceed} onPress={goNext} />
          </View>
        ) : (
          <View style={styles.right}>
            <Button label="Convert to proposal" variant="secondary" size="sm" onPress={() => onConvertToProposal(proposerName || 'Customer')} />
            <Button label="Share Quote" size="sm" onPress={() => setShowShare(true)} />
          </View>
        )}
      </View>

      <Modal visible={showShare} transparent animationType="fade" onRequestClose={() => setShowShare(false)}>
        <View style={styles.modalScrim}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Share Quote</Text>
            <Text style={styles.modalBody}>Quote for {proposerName || 'the customer'} is ready to share.</Text>
            <Button label="Done" onPress={() => setShowShare(false)} fullWidth />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.surfaceSubtle },
  stepperWrap: { padding: spacing.lg, backgroundColor: colors.surface },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, padding: spacing.lg, backgroundColor: colors.surface },
  right: { flexDirection: 'row', gap: spacing.sm },
  modalScrim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  modalCard: { width: '100%', maxWidth: 420, backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.xl, gap: spacing.md, alignItems: 'center' },
  modalTitle: { fontFamily: typography.fontFamily, fontSize: 18, fontWeight: '600', color: colors.textHeading },
  modalBody: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textBody, textAlign: 'center' },
});
