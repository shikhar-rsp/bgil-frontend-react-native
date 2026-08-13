import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Toast, colors, spacing, typography } from '@atlas-ds/react-native';
import { MotorHeader, motorPolicyTitle, motorWheelerLabel } from './MotorHeader';
import { VehicleTypeModal } from './VehicleTypeModal';
import { VehicleIdentificationStep } from './VehicleIdentificationStep';
import { NoClaimBonusCard } from './NoClaimBonusCard';
import { VehicleIdvCard } from './VehicleIdvCard';
import { PlanDetailsStep } from './PlanDetailsStep';
import { SuggestedPlans } from './SuggestedPlans';
import { AddOnsStep } from './AddOnsStep';
import { ProposerDetails } from './ProposerDetails';
import { DiscountLoaderCard } from './DiscountLoaderCard';
import { Suggestions } from './Suggestions';
import { MotorSideContainer } from './MotorSideContainer';
import { PreviewStep } from './PreviewStep';
import { MotorCard } from './motorUi';
import { QuoteFooter } from '../QuoteFooter';
import { WizardStepper } from '../WizardStepper';
import { ShareQuoteModal } from './ShareQuoteModal';
import { PolicyFeaturesModal } from '../PolicyFeaturesModal';
import { MOTOR_POLICY_FEATURES } from '../policyFeaturesData';
import {
  calculatePremium,
  lookupVehicle,
  getDaysExpired,
  getNcbSlab,
  getPrefetchedPolicyPeriod,
  getVehicleAgeBucket,
  isVehicleFound,
  planAllowsDiscountLoader,
  planSupportsAddOns,
  validateRegistration,
  formatShortDate,
  DEFAULT_IDV,
  NO_PRIOR_POLICY_NCB,
  PLAN_OPTIONS,
  READY_MADE_QUOTES,
  type PlanId,
  type VehicleAgeBucket,
  type VehicleRecord,
} from './motorQuoteData';

type VehicleType = 'registered' | 'new' | null;

interface TwoWheelerInsuranceProps {
  onClose: () => void;
  /**
   * Lends the host screen this wizard's step-back. The footer carries no Back
   * button — the screen's top bar is the only back control — so it has to walk
   * the steps here rather than dropping straight out of the flow.
   */
  onRegisterBack?: (handler: (() => void) | null) => void;
  onConvertToProposal: (customer: string) => void;
  /** Chosen before the flow mounts (from the Browse Categories sheet). */
  initialVehicleType?: 'registered' | 'new';
  /** Selected product label, e.g. "Two Wheeler" — drives the header title. */
  productName?: string;
  /** Open the wizard at this step (e.g. 6 = Preview) — used by a task's "View". */
  initialStep?: number;
  /** Seed a customer as the proposer when opened at `initialStep` (task View). */
  initialCustomer?: string;
  /** Task-View mode: Back exits the flow entirely (e.g. to the Tasks tab). */
  onExit?: () => void;
}

/**
 * Motor quote flow (redesign ported from web).
 *
 * Web lays every card out in one scroll beside a sticky Premium Breakup rail.
 * Neither survives a phone, so the cards are dealt across the app's existing
 * six-step wizard in the order the design lists them, and the breakup gets the
 * step the rail can't have. Card content, gating and pricing are unchanged —
 * all of it comes from `motorQuoteData`.
 */
const STEPS = [
  { label: 'Vehicle' },
  { label: 'Plan' },
  { label: 'Add-ons' },
  { label: 'Details' },
  { label: 'Premium' },
  { label: 'Preview' },
];

const PREVIEW_STEP = 6;

/**
 * An unregistered vehicle has no lookup record, so the premium engine is fed a
 * stand-in built from whatever the agent has typed in.
 */
const buildUnregisteredVehicle = (
  model: string,
  make: string,
  subType: string,
  year: string,
  location: string,
  registrationDate: string,
  idv: number,
): VehicleRecord => ({
  type: 'car',
  model: model || 'New vehicle',
  make: make || '—',
  subType: subType || '—',
  year: year || String(new Date().getFullYear()),
  location: location || '—',
  // The age rules read this, so fall back to the manufacturing year when no
  // registration date has been entered yet. Written in the same "30 Nov 2020"
  // shape the lookup uses, so `parseShortDate` reads both the same way.
  regDate: registrationDate
    ? formatShortDate(new Date(registrationDate))
    : `01 Jan ${year || new Date().getFullYear()}`,
  recommendedIdv: idv,
  ownDamageRate: 0.02,
  // Nothing has lapsed on a vehicle we hold no policy for.
  previousPolicyExpiryInDays: 365,
});

export const TwoWheelerInsurance: React.FC<TwoWheelerInsuranceProps> = ({
  onClose,
  onRegisterBack,
  onConvertToProposal,
  initialVehicleType,
  productName,
  initialStep,
  initialCustomer,
  onExit,
}) => {
  // The type is normally picked on the Browse Categories screen before this
  // flow mounts; the sheet only reappears after a Reset.
  // Task-View mode: opened at Preview from a proposal task's "View".
  const taskView = !!initialCustomer;

  const [vehicleType, setVehicleType] = useState<VehicleType>(initialVehicleType ?? null);
  const [showVehicleTypeModal, setShowVehicleTypeModal] = useState(!initialVehicleType);
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [currentStep, setCurrentStep] = useState(() => initialStep ?? 1);
  const [showFeatures, setShowFeatures] = useState(false);
  // Furthest step reached — the stepper only lets the agent jump back to steps
  // they have already filled in, never skip ahead past validation.
  const [maxVisitedStep, setMaxVisitedStep] = useState(() => initialStep ?? 1);
  const [showPaymentPending, setShowPaymentPending] = useState(taskView);

  useEffect(() => {
    setMaxVisitedStep((furthest) => Math.max(furthest, currentStep));
  }, [currentStep]);

  // Registered once and reading the step from a ref, so advancing the wizard
  // doesn't churn the host's handler on every step.
  const stepRef = useRef(currentStep);
  stepRef.current = currentStep;

  useEffect(() => {
    onRegisterBack?.(() => {
      // From a task's "View", Back returns where it came from (Tasks) instead
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

  const [selectedPlanType, setSelectedPlanType] = useState<PlanId | ''>('');
  const [policyStartDate, setPolicyStartDate] = useState<Date | null>(null);
  const [policyEndDate, setPolicyEndDate] = useState<Date | null>(null);

  const [proposerName, setProposerName] = useState(initialCustomer ?? '');
  const [proposerPhone, setProposerPhone] = useState('');
  const [proposerEmail, setProposerEmail] = useState('');

  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleSubType, setVehicleSubType] = useState('');
  const [vehicleManufacturingYear, setVehicleManufacturingYear] = useState('');
  const [registrationLocation, setRegistrationLocation] = useState('');
  const [registrationDate, setRegistrationDate] = useState('');
  const [vehicleIdv, setVehicleIdv] = useState<number>(DEFAULT_IDV);

  /** `null` until the agent answers — the NCB discount stays hidden till then. */
  const [claimMade, setClaimMade] = useState<boolean | null>(null);

  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [selectedPlan, setSelectedPlan] = useState('');
  /** Signed percentage — negative discounts, positive loads. */
  const [discountLoader, setDiscountLoader] = useState(0);

  const [showShareModal, setShowShareModal] = useState(false);

  const lookedUpVehicle = lookupVehicle(registrationNumber);

  // Registered flow: the lookup is the source of truth for vehicle details.
  // Mirror them into state so downstream rules see the real vehicle — notably
  // the manufacturing year, which drives add-on eligibility — and so the policy
  // period arrives filled in rather than waiting to be retyped.
  useEffect(() => {
    if (vehicleType !== 'registered' || !lookedUpVehicle) return;

    setVehicleModel(lookedUpVehicle.model);
    setVehicleMake(lookedUpVehicle.make);
    setVehicleSubType(lookedUpVehicle.subType);
    setVehicleManufacturingYear(lookedUpVehicle.year);
    setRegistrationLocation(lookedUpVehicle.location);
    setRegistrationDate(lookedUpVehicle.regDate);
    setVehicleIdv(lookedUpVehicle.recommendedIdv);

    const period = getPrefetchedPolicyPeriod(lookedUpVehicle);

    setPolicyStartDate(period.start);
    setPolicyEndDate(period.end);
  }, [vehicleType, lookedUpVehicle]);

  const isNewVehicle = vehicleType === 'new';

  // For the unregistered flow, the plans only appear once the vehicle has been
  // described well enough to price.
  const newVehicleDetailsComplete =
    vehicleModel.trim() !== '' &&
    vehicleMake.trim() !== '' &&
    vehicleSubType.trim() !== '' &&
    vehicleManufacturingYear.trim() !== '';

  const vehicle: VehicleRecord | undefined = isNewVehicle
    ? buildUnregisteredVehicle(
        vehicleModel,
        vehicleMake,
        vehicleSubType,
        vehicleManufacturingYear,
        registrationLocation,
        registrationDate,
        vehicleIdv,
      )
    : lookedUpVehicle;

  const isVehicleReady = isNewVehicle
    ? newVehicleDetailsComplete
    : isVehicleFound(registrationNumber);

  // Same rules either way — the bucket comes off the vehicle's own age, whether
  // we looked it up or the agent typed it in.
  const ageBucket: VehicleAgeBucket = vehicle ? getVehicleAgeBucket(vehicle) : 'over5';

  // Only a policy we hold on record can be lapsed.
  const daysExpired = lookedUpVehicle ? getDaysExpired(lookedUpVehicle) : 0;

  // There is no expiring policy behind an unregistered vehicle, so the question
  // isn't asked — and no bonus is applied that the agent can't see.
  const ncbSlab = isNewVehicle
    ? NO_PRIOR_POLICY_NCB
    : getNcbSlab(ageBucket, claimMade === true, daysExpired);

  const showNcbCard = isVehicleReady && !isNewVehicle;

  const activePlanId: PlanId = selectedPlanType || 'comprehensive';

  const premium = useMemo(() => {
    if (!vehicle || !isVehicleReady) return null;

    return calculatePremium({
      vehicle,
      planId: activePlanId,
      idv: vehicleIdv,
      ncbPercent: ncbSlab.percent,
      selectedAddOnIds: selectedAddOns,
      discountLoaderPercent: discountLoader,
    });
  }, [vehicle, isVehicleReady, activePlanId, vehicleIdv, ncbSlab.percent, selectedAddOns, discountLoader]);

  /** Headline price for each Choose Plan card, under the current selections. */
  const planPrices = useMemo(() => {
    const prices = {} as Record<PlanId, number>;

    PLAN_OPTIONS.forEach((plan) => {
      prices[plan.id] = vehicle
        ? calculatePremium({
            vehicle,
            planId: plan.id,
            idv: vehicleIdv,
            ncbPercent: ncbSlab.percent,
            selectedAddOnIds: selectedAddOns,
            discountLoaderPercent: discountLoader,
          }).total
        : 0;
    });

    return prices;
  }, [vehicle, vehicleIdv, ncbSlab.percent, selectedAddOns, discountLoader]);

  const supportsAddOns = planSupportsAddOns(activePlanId);

  // Third party pays nothing towards the customer's own car, so there is no
  // insured value to set and no own-damage package to bundle.
  const showVehicleIdv = isVehicleReady && supportsAddOns;
  const showAddOns = isVehicleReady && selectedPlanType !== '' && supportsAddOns;
  const showDiscountLoader = isVehicleReady && planAllowsDiscountLoader(activePlanId);

  const selectedQuoteName =
    READY_MADE_QUOTES.find((quote) => quote.id === selectedPlan)?.name ?? '';

  const policyTenureLabel = useMemo(() => {
    if (!policyStartDate || !policyEndDate) return '1 year';

    const years = Math.max(
      1,
      Math.round(
        (policyEndDate.getTime() - policyStartDate.getTime()) /
          (1000 * 60 * 60 * 24 * 365.25),
      ),
    );

    return years === 1 ? '1 year' : `${years} years`;
  }, [policyStartDate, policyEndDate]);

  // The web build gates the whole of step 1 in one go; the wizard splits the
  // same conditions across the steps that collect them.
  const step1Valid = Boolean(
    vehicleType !== null &&
      isVehicleReady &&
      policyStartDate !== null &&
      policyEndDate !== null &&
      // The plate is what identifies a registered vehicle, so it has to be well
      // formed, and there is an expiring policy to ask about. Neither applies
      // once the agent is entering the vehicle by hand.
      (isNewVehicle || (validateRegistration(registrationNumber) && claimMade !== null)),
  );
  const step2Valid = selectedPlanType !== '';
  const step4Valid =
    proposerName.trim() !== '' && proposerPhone.trim() !== '' && proposerEmail.trim() !== '';

  const canProceed =
    currentStep === 1 ? step1Valid
      : currentStep === 2 ? step2Valid
        : currentStep === 4 ? step4Valid
          : true;

  const resetForm = () => {
    setRegistrationNumber('');
    setVehicleModel('');
    setVehicleMake('');
    setVehicleSubType('');
    setVehicleManufacturingYear('');
    setRegistrationLocation('');
    setRegistrationDate('');
    setVehicleIdv(DEFAULT_IDV);
    setClaimMade(null);
    setSelectedPlanType('');
    setPolicyStartDate(null);
    setPolicyEndDate(null);
    setProposerName('');
    setProposerPhone('');
    setProposerEmail('');
    setSelectedAddOns([]);
    setSelectedPlan('');
    setDiscountLoader(0);
    setCurrentStep(1);
  };

  return (
    <View style={styles.flex}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hidden on the preview step, which is a result rather than a stage —
            same rule the product header below follows. */}
        {currentStep !== PREVIEW_STEP ? (
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

        {currentStep !== PREVIEW_STEP ? (
          <MotorHeader productName={productName} onViewFeatures={() => setShowFeatures(true)} />
        ) : null}

        {currentStep === 1 && vehicleType ? (
          <>
            <VehicleIdentificationStep
              vehicleType={vehicleType}
              registrationNumber={registrationNumber}
              setRegistrationNumber={setRegistrationNumber}
              vehicleModel={vehicleModel}
              setVehicleModel={setVehicleModel}
              vehicleMake={vehicleMake}
              setVehicleMake={setVehicleMake}
              vehicleSubType={vehicleSubType}
              setVehicleSubType={setVehicleSubType}
              vehicleManufacturingYear={vehicleManufacturingYear}
              setVehicleManufacturingYear={setVehicleManufacturingYear}
              registrationLocation={registrationLocation}
              setRegistrationLocation={setRegistrationLocation}
              registrationDate={registrationDate}
              setRegistrationDate={setRegistrationDate}
              policyStartDate={policyStartDate}
              setPolicyStartDate={setPolicyStartDate}
              policyEndDate={policyEndDate}
              setPolicyEndDate={setPolicyEndDate}
            />

            {showNcbCard ? (
              <NoClaimBonusCard
                claimMade={claimMade}
                setClaimMade={setClaimMade}
                slab={ncbSlab}
              />
            ) : null}
          </>
        ) : currentStep === 2 ? (
          <>
            {showVehicleIdv ? (
              <VehicleIdvCard idv={vehicleIdv} setIdv={setVehicleIdv} />
            ) : null}

            {isVehicleReady ? (
              <PlanDetailsStep
                ageBucket={ageBucket}
                selectedPlanType={selectedPlanType}
                setSelectedPlanType={setSelectedPlanType}
                planPrices={planPrices}
              />
            ) : null}
          </>
        ) : currentStep === 3 ? (
          showAddOns && vehicle ? (
            <>
              <SuggestedPlans
                selectedPlan={selectedPlan}
                setSelectedPlan={setSelectedPlan}
                vehicle={vehicle}
                planId={activePlanId}
                ncbPercent={ncbSlab.percent}
              />

              <AddOnsStep
                selectedAddOns={selectedAddOns}
                setSelectedAddOns={setSelectedAddOns}
                vehicleManufacturingYear={vehicleManufacturingYear}
              />
            </>
          ) : (
            // Third-party rates are IRDAI-notified and fixed, so this step has
            // nothing to offer. Saying so beats an empty screen or silently
            // skipping a step the stepper still shows.
            <MotorCard title="Select Add-ons">
              <Text style={styles.note}>
                Third-party cover is notified by IRDAI and fixed, so it carries no
                insured value, no add-ons and no ready-made packages. Choose
                Comprehensive or Own Damage to add cover.
              </Text>
            </MotorCard>
          )
        ) : currentStep === 4 ? (
          <>
            <ProposerDetails
              proposerName={proposerName}
              setProposerName={setProposerName}
              proposerPhone={proposerPhone}
              setProposerPhone={setProposerPhone}
              proposerEmail={proposerEmail}
              setProposerEmail={setProposerEmail}
            />

            {showDiscountLoader ? (
              <DiscountLoaderCard value={discountLoader} setValue={setDiscountLoader} />
            ) : null}

            {isVehicleReady ? <Suggestions /> : null}
          </>
        ) : currentStep === 5 ? (
          <MotorSideContainer premium={premium} tenureLabel={policyTenureLabel} />
        ) : currentStep === PREVIEW_STEP ? (
          <>
            {taskView && showPaymentPending ? (
              <Toast
                variant="warning"
                layout="stacked"
                title="Payment Pending"
                message={`Policy ID 1973937 for ${proposerName || 'Rakesh Kumar'} payment is still pending. Follow up with the customer or send a quick reminder notice ASAP!`}
                onClose={() => setShowPaymentPending(false)}
              />
            ) : null}

            {premium ? (
              <PreviewStep
                proposerName={proposerName}
                proposerPhone={proposerPhone}
                proposerEmail={proposerEmail}
                vehicle={vehicle}
                planId={activePlanId}
                premium={premium}
                packageName={selectedQuoteName}
                policyStartDate={policyStartDate}
                policyEndDate={policyEndDate}
                policyTenure={policyTenureLabel}
                selectedAddOnIds={selectedAddOns}
                wheelerLabel={motorWheelerLabel(productName)}
              />
            ) : (
              <MotorCard title="Preview & Share">
                <Text style={styles.note}>
                  Enter the vehicle details to generate a quote.
                </Text>
              </MotorCard>
            )}
          </>
        ) : null}
      </ScrollView>

      <View style={styles.footerWrap}>
        <QuoteFooter
          currentStep={currentStep}
          previewStep={PREVIEW_STEP}
          previewQuoteStep={5}
          isProceedDisabled={!canProceed}
          onReset={resetForm}
          onProceed={() => setCurrentStep(Math.min(currentStep + 1, PREVIEW_STEP))}
          onShareQuote={() => setShowShareModal(true)}
          onConvertToProposal={() => onConvertToProposal(proposerName || 'Rakesh Kumar')}
        />
      </View>

      <VehicleTypeModal
        isOpen={showVehicleTypeModal}
        onClose={() => {
          setShowVehicleTypeModal(false);
          if (!vehicleType) {
            onClose();
          }
        }}
        onProceed={(type) => {
          setVehicleType(type);
          resetForm();
          setShowVehicleTypeModal(false);
        }}
      />

      {/* Quote created / share */}
      <ShareQuoteModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        quoteData={{
          id: 'QT - 28686-8728387',
          customerName: proposerName || 'Rakesh Kumar',
          policyType: motorPolicyTitle(productName),
        }}
      />

      <PolicyFeaturesModal
        isOpen={showFeatures}
        onClose={() => setShowFeatures(false)}
        features={{ ...MOTOR_POLICY_FEATURES, title: motorPolicyTitle(productName) }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.surfaceSubtle },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.lg, flexGrow: 1 },
  note: { fontFamily: typography.fontFamily, fontSize: 14, lineHeight: 20, color: colors.textBody },
  // Full-bleed: the footer bar supplies its own padding.
  footerWrap: {},
});
