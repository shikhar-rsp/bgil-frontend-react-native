import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Button, colors, spacing, radius, typography } from '@atlas-ds/react-native';
import { QuoteFooter } from '../QuoteFooter';
import { ShareQuoteModal } from '../motor/ShareQuoteModal';
import { HealthGuardHeader } from './HealthGuardHeader';
import { PlanDetailsStep } from './PlanDetailsStep';
import { ProposerDetailsStep } from './ProposerDetailsStep';
import { AddOnsStep } from './AddOnsStep';
import { PreviewStep } from './PreviewStep';
import { PolicyTenurePremium } from './PolicyTenurePremium';
import { buildMembers, type MemberDatum } from './healthData';

const STEPS = [
  { label: 'Plan' },
  { label: 'Members' },
  { label: 'Proposer' },
  { label: 'Add-ons' },
  { label: 'Premium' },
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

  // Toggle "keep sum insured same for all". On enable, immediately copy the
  // first entered sum insured onto every member (thereafter `updateMember`
  // keeps them in sync on each edit).
  const toggleKeepSumInsuredSame = () => {
    setKeepSumInsuredSame((prev) => {
      const next = !prev;
      if (next) {
        setMemberData((data) => {
          const source = members.map((m) => data[m.id]?.sumInsured).find(Boolean) ?? '';
          const synced = { ...data };
          members.forEach((m) => {
            const base: MemberDatum = synced[m.id] ?? { dob: null, sumInsured: '', selectedAddOns: [], wantsAddOns: '' };
            synced[m.id] = { ...base, sumInsured: source };
          });
          return synced;
        });
      }
      return next;
    });
  };

  // Step 1: plan type + dates. Step 2: members + sub plan. Step 3: proposer.
  const planStepValid = planType !== '' && startDate !== null && endDate !== null;
  const membersStepValid =
    subPlan !== '' &&
    (planType === 'floater'
      ? sumInsured !== ''
      : members.length > 0 && members.every((m) => memberData[m.id]?.dob && memberData[m.id]?.sumInsured));
  const proposerStepValid = proposerName !== '' && proposerDOB !== null && annualIncome !== '' && pincode.length === 6;

  const canProceed =
    currentStep === 1 ? planStepValid :
    currentStep === 2 ? membersStepValid :
    currentStep === 3 ? proposerStepValid :
    true;

  const goNext = () => setCurrentStep((s) => Math.min(s + 1, STEPS.length));

  return (
    <View style={styles.flex}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {currentStep !== 6 ? <HealthGuardHeader productName={productName} /> : null}

        {currentStep === 1 || currentStep === 2 ? (
          <PlanDetailsStep
            section={currentStep === 1 ? 'plan' : 'members'}
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
            keepSumInsuredSame={keepSumInsuredSame}
            toggleKeepSumInsuredSame={toggleKeepSumInsuredSame}
          />
        ) : currentStep === 3 ? (
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
        ) : currentStep === 4 ? (
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
        ) : currentStep === 5 ? (
          <PolicyTenurePremium />
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
        <QuoteFooter
          currentStep={currentStep}
          previewStep={6}
          previewQuoteStep={5}
          isProceedDisabled={!canProceed}
          onBack={() => (currentStep > 1 ? setCurrentStep(currentStep - 1) : onClose())}
          onProceed={goNext}
          onShareQuote={() => setShowShare(true)}
          onConvertToProposal={() => onConvertToProposal(proposerName || 'Customer')}
        />
      </View>

      <ShareQuoteModal
        isOpen={showShare}
        onClose={() => setShowShare(false)}
        quoteData={{ id: 'QT - 28686-8728387', customerName: proposerName || 'Customer', policyType: `${productName} Policy` }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.surfaceSubtle },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  // Full-bleed: the footer bar supplies its own padding.
  footer: {},
  modalScrim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  modalCard: { width: '100%', maxWidth: 420, backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.xl, gap: spacing.md, alignItems: 'center' },
  modalTitle: { fontFamily: typography.fontFamily, fontSize: 18, fontWeight: '600', color: colors.textHeading },
  modalBody: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textBody, textAlign: 'center' },
});
