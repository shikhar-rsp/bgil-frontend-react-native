import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Toast, colors, spacing, radius, fontFamilyForWeight, shadow } from '@atlas-ds/react-native';
import { MotorHeader, motorPolicyTitle } from './MotorHeader';
import { VehicleTypeModal } from './VehicleTypeModal';
import { VehicleIdentificationStep } from './VehicleIdentificationStep';
import { PlanDetailsStep } from './PlanDetailsStep';
import { AddOnsStep } from './AddOnsStep';
import { SuggestedPlans } from './SuggestedPlans';
import { DiscountLoaderCard, type DiscountLoader } from './DiscountLoaderCard';
import { ProposerDetails } from './ProposerDetails';
import { MotorSideContainer } from './MotorSideContainer';
import { PreviewStep } from './PreviewStep';
import { QuoteFooter } from '../QuoteFooter';
import { WizardStepper } from '../WizardStepper';
import { ShareQuoteModal } from './ShareQuoteModal';
import { PolicyFeaturesModal } from '../PolicyFeaturesModal';
import { MOTOR_POLICY_FEATURES } from '../policyFeaturesData';
import { Slider } from '@atlas-ds/react-native';
import { validateRegistration, lookupVehicle, DEFAULT_IDV, TENURE_YEAR_MAP } from './motorData';

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
 * Two-Wheeler / Motor insurance quote flow (ported faithfully from web
 * dashboard/p5). Step 1 is a single scrolling form (vehicle identification →
 * plan details → IDV → suggested plans → add-ons → discount/loader → suggestions
 * → proposer) with a premium side panel; step 3 is the preview.
 */
/** Stepper labels, one per `currentStep`. */
const STEPS = [
  { label: 'Vehicle' },
  { label: 'Plan' },
  { label: 'IDV' },
  { label: 'Add-ons' },
  { label: 'Premium' },
  { label: 'Preview' },
];

export const TwoWheelerInsurance: React.FC<TwoWheelerInsuranceProps> = ({ onClose, onRegisterBack, onConvertToProposal, initialVehicleType, productName, initialStep, initialCustomer, onExit }) => {
  // The type is normally picked on the Browse Categories screen before this
  // flow mounts; the sheet only reappears after a Reset.
  const isNewInit = initialVehicleType === 'new';
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
      // From a task's "View", Back returns where it came from (Tasks) instead of
      // stepping through the wizard.
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

  const [selectedPlanType, setSelectedPlanType] = useState('');
  const [selectedCustomerType, setSelectedCustomerType] = useState('');
  const [policyStartDate, setPolicyStartDate] = useState<Date | null>(null);
  const [policyEndDate, setPolicyEndDate] = useState<Date | null>(null);
  const [policyTenure, setPolicyTenure] = useState('');

  const [proposerName, setProposerName] = useState(initialCustomer ?? '');
  const [proposerPhone, setProposerPhone] = useState('');
  const [proposerEmail, setProposerEmail] = useState('');

  const [vehicleModel, setVehicleModel] = useState(isNewInit ? '' : 'Swift Dzire');
  const [vehicleMake, setVehicleMake] = useState(isNewInit ? '' : '28914y0912');
  const [vehicleSubType, setVehicleSubType] = useState(isNewInit ? '' : 'One year');
  const [vehicleManufacturingYear, setVehicleManufacturingYear] = useState(isNewInit ? '' : '2020');
  const [registrationLocation, setRegistrationLocation] = useState(isNewInit ? '' : 'Pune');
  const [registrationDate, setRegistrationDate] = useState(isNewInit ? '' : '30 Nov 2020');
  const [vehicleIdv, setVehicleIdv] = useState(DEFAULT_IDV);
  const [currentPolicyNcb, setCurrentPolicyNcb] = useState('0');
  const [expiringPolicyNcb, setExpiringPolicyNcb] = useState('0');

  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [selectedPlan, setSelectedPlan] = useState('');
  // `[discount, loader]` — the two ends of the Discount/Loader slider.
  const [discountLoader, setDiscountLoader] = useState<DiscountLoader>([0, 0]);

  const [showShareModal, setShowShareModal] = useState(false);

  // Registered flow: the lookup is the source of truth for vehicle details — it
  // is what the found-vehicle card renders. Mirror it into state so downstream
  // rules see the real vehicle, notably the manufacturing year that drives the
  // 15-year add-on cutoff.
  useEffect(() => {
    if (vehicleType !== 'registered') {
      return;
    }
    const vehicle = lookupVehicle(registrationNumber);
    if (!vehicle) {
      return;
    }
    setVehicleModel(vehicle.model);
    setVehicleMake(vehicle.make);
    setVehicleSubType(vehicle.subType);
    setVehicleManufacturingYear(vehicle.year);
    setRegistrationLocation(vehicle.location);
    setRegistrationDate(vehicle.regDate);
  }, [vehicleType, registrationNumber]);

  const handleVehicleTypeChange = (type: 'registered' | 'new') => {
    setVehicleType(type);
    if (type === 'new') {
      setRegistrationNumber('');
      setVehicleModel('');
      setVehicleMake('');
      setVehicleSubType('');
      setVehicleManufacturingYear('');
      setRegistrationLocation('');
      setRegistrationDate('');
      setVehicleIdv(DEFAULT_IDV);
      setCurrentPolicyNcb('0');
      setExpiringPolicyNcb('0');
      setSelectedPlanType('');
    } else {
      setVehicleModel('Swift Dzire');
      setVehicleMake('28914y0912');
      setVehicleSubType('One year');
      setVehicleManufacturingYear('2020');
      setRegistrationLocation('Pune');
      setRegistrationDate('30 Nov 2020');
      setVehicleIdv(DEFAULT_IDV);
      setCurrentPolicyNcb('0');
      setExpiringPolicyNcb('0');
      setSelectedPlanType('');
    }
  };

  const calculatePolicyEndDate = (startDate: Date | null, tenure: string) => {
    const totalYears = TENURE_YEAR_MAP[tenure];
    if (!startDate || !totalYears) {
      setPolicyEndDate(null);
      return;
    }
    const end = new Date(startDate);
    end.setFullYear(end.getFullYear() + totalYears);
    setPolicyEndDate(end);
  };

  // Premium details unlock once the vehicle is known — identified by its
  // registration (registered) or filled in manually (new) — and a plan type
  // has been chosen. Proposer details aren't required for this.
  const showPremiumDetails = useMemo(() => {
    if (vehicleType === null || selectedPlanType === '') {
      return false;
    }
    if (vehicleType === 'new') {
      return (
        vehicleModel.trim() !== '' &&
        vehicleMake.trim() !== '' &&
        vehicleSubType.trim() !== '' &&
        vehicleManufacturingYear.trim() !== '' &&
        vehicleIdv.trim() !== ''
      );
    }
    return validateRegistration(registrationNumber);
  }, [
    vehicleType,
    selectedPlanType,
    registrationNumber,
    vehicleModel,
    vehicleMake,
    vehicleSubType,
    vehicleManufacturingYear,
    vehicleIdv,
  ]);

  // Per-step "can proceed" gating for the 5-step wizard.
  const isNew = vehicleType === 'new';
  const step1Valid = isNew
    ? vehicleModel.trim() !== '' && vehicleMake.trim() !== '' && vehicleSubType.trim() !== '' && vehicleManufacturingYear.trim() !== ''
    : validateRegistration(registrationNumber);
  // Step 2 now carries the Choose Plan card, so plan validation lives here.
  const step2Valid =
    selectedCustomerType !== '' &&
    (isNew || (selectedPlanType !== '' && policyStartDate !== null && policyEndDate !== null));
  const step3Valid = vehicleIdv.trim() !== '';
  const step4Valid = proposerName.trim() !== '' && proposerPhone.trim() !== '' && proposerEmail.trim() !== '';

  const canProceed =
    currentStep === 1 ? step1Valid :
    currentStep === 2 ? step2Valid :
    currentStep === 3 ? step3Valid :
    currentStep === 4 ? step4Valid :
    true;

  const resetForm = () => {
    setVehicleType(null);
    setShowVehicleTypeModal(true);
    setRegistrationNumber('');
    setVehicleModel('');
    setVehicleMake('');
    setVehicleSubType('');
    setVehicleManufacturingYear('');
    setRegistrationLocation('');
    setRegistrationDate('');
    // Sliders render at 0% from the start, so an empty string would silently
    // fail validation on a form that looks filled.
    setVehicleIdv(DEFAULT_IDV);
    setCurrentPolicyNcb('0');
    setExpiringPolicyNcb('0');
    setSelectedPlanType('');
    setSelectedCustomerType('');
    setPolicyStartDate(null);
    setPolicyEndDate(null);
    setProposerName('');
    setProposerPhone('');
    setProposerEmail('');
    setSelectedAddOns([]);
    setDiscountLoader([0, 0]);
    setSelectedPlan('');
  };

  const idvNumber = Number(String(vehicleIdv).replace(/[^\d]/g, '')) || 50000;

  const idProps = {
    vehicleType,
    registrationNumber,
    setRegistrationNumber,
    vehicleModel,
    setVehicleModel,
    vehicleMake,
    setVehicleMake,
    vehicleSubType,
    setVehicleSubType,
    vehicleManufacturingYear,
    setVehicleManufacturingYear,
    registrationLocation,
    setRegistrationLocation,
    registrationDate,
    setRegistrationDate,
    currentPolicyNcb,
    setCurrentPolicyNcb,
    expiringPolicyNcb,
    setExpiringPolicyNcb,
  };

  return (
    <View style={styles.flex}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hidden on the preview step, which is a result rather than a stage —
            same rule the product header below follows. */}
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
          <MotorHeader productName={productName} onViewFeatures={() => setShowFeatures(true)} />
        ) : null}

        {currentStep === 1 && vehicleType ? (
          <>
            {/* Header at top, identification card pushed to the bottom. */}
            <View style={styles.spacer} />
            <VehicleIdentificationStep mode="identify" {...idProps} />
          </>
        ) : currentStep === 2 && vehicleType ? (
          <>
            <VehicleIdentificationStep mode="ncb" {...idProps} />

            <PlanDetailsStep
              vehicleType={vehicleType}
              selectedPlanType={selectedPlanType}
              setSelectedPlanType={setSelectedPlanType}
              selectedCustomerType={selectedCustomerType}
              setSelectedCustomerType={setSelectedCustomerType}
              policyStartDate={policyStartDate}
              setPolicyStartDate={setPolicyStartDate}
              policyEndDate={policyEndDate}
              setPolicyEndDate={setPolicyEndDate}
              policyTenure={policyTenure}
              setPolicyTenure={setPolicyTenure}
              calculatePolicyEndDate={calculatePolicyEndDate}
            />
          </>
        ) : currentStep === 3 ? (
          <>
            <View style={styles.idvCard}>
              <View style={styles.idvHeader}>
                <Text style={styles.idvTitle}>Select Vehicle IDV</Text>
                <Text style={styles.idvValue}>₹ {new Intl.NumberFormat('en-IN').format(idvNumber)}</Text>
              </View>
              <Slider
                min={50000}
                max={1500000}
                step={1000}
                value={idvNumber}
                onChange={(val) => setVehicleIdv(new Intl.NumberFormat('en-IN').format(typeof val === 'number' ? val : val[0]))}
              />
            </View>

            <SuggestedPlans selectedPlan={selectedPlan} setSelectedPlan={setSelectedPlan} />
          </>
        ) : currentStep === 4 ? (
          <>
            <AddOnsStep
              selectedAddOns={selectedAddOns}
              setSelectedAddOns={setSelectedAddOns}
              vehicleManufacturingYear={vehicleManufacturingYear}
            />
            <ProposerDetails
              proposerName={proposerName}
              setProposerName={setProposerName}
              proposerPhone={proposerPhone}
              setProposerPhone={setProposerPhone}
              proposerEmail={proposerEmail}
              setProposerEmail={setProposerEmail}
            />
            <DiscountLoaderCard value={discountLoader} setValue={setDiscountLoader} />
          </>
        ) : currentStep === 5 ? (
          <MotorSideContainer
            isFormValid={step4Valid}
            showPremiumDetails={showPremiumDetails}
            policyTenure={policyTenure}
            setPolicyTenure={setPolicyTenure}
            policyStartDate={policyStartDate}
            selectedPlanType={selectedPlanType}
            calculatePolicyEndDate={calculatePolicyEndDate}
            discountLoader={discountLoader}
          />
        ) : currentStep === 6 ? (
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
            <PreviewStep proposerName={proposerName || 'Rakesh Kumar'} proposerDOB={new Date('1998-04-12')} productName={productName} />
          </>
        ) : null}
      </ScrollView>

      <View style={styles.footerWrap}>
        <QuoteFooter
          currentStep={currentStep}
          previewStep={6}
          previewQuoteStep={5}
          isProceedDisabled={!canProceed}
          onProceed={() => setCurrentStep(Math.min(currentStep + 1, 6))}
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
          handleVehicleTypeChange(type);
          setShowVehicleTypeModal(false);
        }}
      />

      {/* Quote created / share */}
      <ShareQuoteModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        quoteData={{ id: 'QT - 28686-8728387', customerName: proposerName || 'Rakesh Kumar', policyType: '4 Wheeler policy' }}
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
  flex: { flex: 1, backgroundColor: colors.surfaceSubtle,  },
  // flexGrow lets the step-1 spacer push the identification card to the bottom.
  // 16px gap between the last card and the footer.
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.lg, flexGrow: 1 },
  spacer: { flex: 1 },
  idvCard: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, gap: spacing.md, ...shadow.lg },
  // Value sits under the title, not beside it.
  idvHeader: { gap: spacing.xs },
  idvTitle: { fontFamily: fontFamilyForWeight('500'), fontSize: 18, fontWeight: '500', color: colors.textHeading },
  idvValue: { fontFamily: fontFamilyForWeight('500'), fontSize: 18, fontWeight: '600', color: colors.textHeading },
  // Full-bleed: the footer bar supplies its own padding.
  footerWrap: {},
});
