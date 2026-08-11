import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { ToastGlobal, colors, spacing, radius, typography } from '@atlas-ds/react-native';
import { QuoteFooter } from '../QuoteFooter';
import { WizardStepper } from '../WizardStepper';
import { ShareQuoteModal } from '../motor/ShareQuoteModal';
import { PolicyFeaturesModal } from '../PolicyFeaturesModal';
import { HEALTH_POLICY_FEATURES } from '../policyFeaturesData';
import { HealthGuardHeader } from './HealthGuardHeader';
import { PlanDetailsStep } from './PlanDetailsStep';
import { ProposerDetailsStep } from './ProposerDetailsStep';
import { AddOnsStep } from './AddOnsStep';
import { PreviewStep } from './PreviewStep';
import { PolicyTenurePremium } from './PolicyTenurePremium';
import {
  TENURES,
  buildMembers,
  criticalPlansFor,
  planValueForProduct,
  type Coverage,
  type MemberDatum,
} from './healthData';

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
  /**
   * Lends the host screen this wizard's step-back. The footer carries no Back
   * button — the screen's top bar is the only back control — so it has to walk
   * the steps here rather than dropping straight out of the flow.
   */
  onRegisterBack?: (handler: (() => void) | null) => void;
  onConvertToProposal: (customer: string) => void;
  /** Open the wizard at this step (e.g. 6 = Preview) — used by a task's "View". */
  initialStep?: number;
  /** Seed a customer as the proposer + a demo quote when opened at `initialStep`. */
  initialCustomer?: string;
  /** Task-View mode: Back exits the flow entirely (e.g. to the Tasks tab) rather
   *  than walking the wizard steps. */
  onExit?: () => void;
}

/**
 * Detailed Health Guard quote flow (ported faithfully from web dashboard/p5):
 * Plan Details (plan type, members, per-member sum insured, sub-plans) →
 * Proposer KYC → per-member Add-ons → Preview & Share.
 */
export const HealthGuard: React.FC<HealthGuardProps> = ({
  productName,
  onClose,
  onRegisterBack,
  onConvertToProposal,
  initialStep,
  initialCustomer,
  onExit,
}) => {
  const [currentStep, setCurrentStep] = useState(() => initialStep ?? 1);
  // Furthest step reached — the stepper only lets the agent jump back to steps
  // they have already filled in, never skip ahead past validation.
  const [maxVisitedStep, setMaxVisitedStep] = useState(() => initialStep ?? 1);
  // Task-View mode (opened at Preview from a task's "View"): Back leaves the flow.
  const taskView = !!initialCustomer;

  useEffect(() => {
    setMaxVisitedStep((furthest) => Math.max(furthest, currentStep));
  }, [currentStep]);

  // Registered once and reading the step from a ref, so advancing the wizard
  // doesn't churn the host's handler on every step.
  const stepRef = useRef(currentStep);
  stepRef.current = currentStep;

  useEffect(() => {
    onRegisterBack?.(() => {
      // From a task's "View", Back returns to where it came from (Tasks) instead
      // of stepping through the wizard.
      if (taskView && onExit) {
        onExit();
        return;
      }
      if (stepRef.current > 1) {
        setCurrentStep(stepRef.current - 1);
        return;
      }
      onClose();
    });
    return () => onRegisterBack?.(null);
  }, [onRegisterBack, onClose, taskView, onExit]);

  // Preselect the product the flow was entered with (Browse Categories tile).
  const [selectedPlan, setSelectedPlan] = useState(() => planValueForProduct(productName));
  const [planType, setPlanType] = useState('');
  const [subPlan, setSubPlan] = useState('');
  // "Who is covered?" — relation id → how many of that relation are covered.
  const [coverage, setCoverage] = useState<Coverage>({});
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [sumInsured, setSumInsured] = useState('');
  // Floater only — the eldest life covered, which the floater is priced on.
  const [oldestMemberDOB, setOldestMemberDOB] = useState<Date | null>(null);

  // Critical illness / PA add-on plans offered under the sub-plan tiers.
  const [wantsCriticalIllness, setWantsCriticalIllness] = useState('');
  const [grossMonthlyIncome, setGrossMonthlyIncome] = useState('');
  const [occupation, setOccupation] = useState('');
  const [hasDisability, setHasDisability] = useState('');
  const [selectedCriticalPlans, setSelectedCriticalPlans] = useState<string[]>([]);

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
  const [tenure, setTenure] = useState('');
  const [showBrochureToast, setShowBrochureToast] = useState(false);
  const brochureTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (brochureTimer.current) {
      clearTimeout(brochureTimer.current);
    }
  }, []);

  // When opened from a task's "View", seed a representative Individual/Gold quote
  // for the customer so the Preview step renders with real data (runs once).
  const seededRef = useRef(false);
  useEffect(() => {
    if (!initialCustomer || seededRef.current) {
      return;
    }
    seededRef.current = true;
    const dob = new Date(1990, 0, 1);
    const s = new Date();
    const e = new Date(s);
    e.setFullYear(e.getFullYear() + 3);
    setPlanType('individual');
    setSubPlan('gold');
    setProposerIsMember(true);
    setProposerName(initialCustomer);
    setProposerDOB(dob);
    setAnnualIncome('100000');
    setPincode('590001');
    setCity('Delhi');
    setState('Delhi');
    setCoverage({});
    setSumInsured('500000');
    setTenure('3y');
    setStartDate(s);
    setEndDate(e);
    setMemberData({ proposer: { dob, sumInsured: '500000', selectedAddOns: [], wantsAddOns: 'no' } });
  }, [initialCustomer]);

  // Mirrors the web brochure toast: show, then auto-dismiss after 3s.
  const handleDownloadBrochure = () => {
    if (brochureTimer.current) {
      clearTimeout(brochureTimer.current);
    }
    setShowBrochureToast(true);
    brochureTimer.current = setTimeout(() => setShowBrochureToast(false), 3000);
  };

  const [showFeatures, setShowFeatures] = useState(false);

  // Picking a tenure also recalculates the end date off the start date, the
  // same way the motor flow's `calculatePolicyEndDate` does.
  const selectTenure = (value: string) => {
    setTenure(value);
    const years = TENURES.find((t) => t.value === value)?.years;
    if (!startDate || !years) {
      return;
    }
    const end = new Date(startDate);
    end.setFullYear(end.getFullYear() + years);
    setEndDate(end);
  };

  const members = useMemo(
    () => buildMembers(proposerIsMember, proposerName, coverage, planType),
    [proposerIsMember, proposerName, coverage, planType],
  );

  const setCoverageCount = (id: string, count: number) =>
    setCoverage((prev) => ({ ...prev, [id]: Math.max(0, count) }));

  const toggleCriticalPlan = (id: string) =>
    setSelectedCriticalPlans((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));

  // Declaring a disability withdraws some plans — drop any already picked, so a
  // hidden card can't stay in the quote.
  const selectHasDisability = (value: string) => {
    setHasDisability(value);
    const offered = criticalPlansFor(value).map((p) => p.id);
    setSelectedCriticalPlans((prev) => prev.filter((id) => offered.includes(id)));
  };

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
  const planStepValid =
    planType !== '' &&
    startDate !== null &&
    endDate !== null &&
    // Floater picks its shared cover on this step, alongside the dates.
    (planType !== 'floater' || sumInsured !== '');
  // Everything the premium is priced off — the sub-plan cards stay blank until
  // this holds, and the step needs a tier picked on top of it.
  const memberDetailsComplete =
    members.length > 0 &&
    (planType === 'floater'
      ? oldestMemberDOB !== null
      : members.every((m) => memberData[m.id]?.dob && memberData[m.id]?.sumInsured));
  // The critical-illness question is required; answering "yes" pulls in the
  // income/occupation fields and the disability question it reveals.
  const criticalIllnessValid =
    wantsCriticalIllness === 'no' ||
    (wantsCriticalIllness === 'yes' &&
      grossMonthlyIncome !== '' &&
      occupation !== '' &&
      hasDisability !== '');
  const membersStepValid = subPlan !== '' && memberDetailsComplete && criticalIllnessValid;
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
        {/* Hidden on the preview step, which is a result rather than a stage —
            same rule the product header above follows. */}
        {currentStep !== 6 ? (
          <WizardStepper
            steps={STEPS}
            current={currentStep - 1}
            onStepPress={(index) => {
              if (index + 1 <= maxVisitedStep) {
                setCurrentStep(index + 1);
              }
            }}
          />
        ) : null}

        {currentStep !== 6 ? (
          <HealthGuardHeader
            productName={productName}
            onDownloadBrochure={handleDownloadBrochure}
            onViewFeatures={() => setShowFeatures(true)}
          />
        ) : null}

        {currentStep === 1 || currentStep === 2 ? (
          <PlanDetailsStep
            section={currentStep === 1 ? 'plan' : 'members'}
            selectedPlan={selectedPlan}
            setSelectedPlan={setSelectedPlan}
            planType={planType}
            setPlanType={setPlanType}
            coverage={coverage}
            setCoverageCount={setCoverageCount}
            oldestMemberDOB={oldestMemberDOB}
            setOldestMemberDOB={setOldestMemberDOB}
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
            priceReady={memberDetailsComplete}
            wantsCriticalIllness={wantsCriticalIllness}
            setWantsCriticalIllness={setWantsCriticalIllness}
            grossMonthlyIncome={grossMonthlyIncome}
            setGrossMonthlyIncome={setGrossMonthlyIncome}
            occupation={occupation}
            setOccupation={setOccupation}
            hasDisability={hasDisability}
            setHasDisability={selectHasDisability}
            selectedCriticalPlans={selectedCriticalPlans}
            toggleCriticalPlan={toggleCriticalPlan}
            onDownloadBrochure={handleDownloadBrochure}
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
          <PolicyTenurePremium
            tenure={tenure}
            onSelectTenure={selectTenure}
            subPlan={subPlan}
            planType={planType}
            members={members}
            memberData={memberData}
            sumInsured={sumInsured}
            oldestMemberDOB={oldestMemberDOB}
            floaterAddOns={floaterAddOns}
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
        <QuoteFooter
          currentStep={currentStep}
          previewStep={6}
          previewQuoteStep={5}
          isProceedDisabled={!canProceed}
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

      <PolicyFeaturesModal
        isOpen={showFeatures}
        onClose={() => setShowFeatures(false)}
        features={HEALTH_POLICY_FEATURES}
      />

      {showBrochureToast ? (
        <View style={styles.toast} pointerEvents="box-none">
          <ToastGlobal variant="success" title="Brochure is downloaded!" />
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.surfaceSubtle },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  // Full-bleed: the footer bar supplies its own padding.
  footer: {},
  // Floats over the step content, clear of the header row.
  toast: { position: 'absolute', top: spacing.lg, left: spacing.lg, right: spacing.lg, zIndex: 20 },
  modalScrim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  modalCard: { width: '100%', maxWidth: 420, backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.xl, gap: spacing.md, alignItems: 'center' },
  modalTitle: { fontFamily: typography.fontFamily, fontSize: 18, fontWeight: '600', color: colors.textHeading },
  modalBody: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textBody, textAlign: 'center' },
});
