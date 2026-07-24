import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { colors, spacing, radius, fontFamilyForWeight, shadow } from '@atlas-ds/react-native';
import { MotorHeader } from './MotorHeader';
import { VehicleTypeModal } from './VehicleTypeModal';
import { VehicleIdentificationStep } from './VehicleIdentificationStep';
import { PlanDetailsStep } from './PlanDetailsStep';
import { AddOnsStep } from './AddOnsStep';
import { SuggestedPlans } from './SuggestedPlans';
import { DiscountLoaderCard } from './DiscountLoaderCard';
import { Suggestions } from './Suggestions';
import { ProposerDetails } from './ProposerDetails';
import { MotorSideContainer } from './MotorSideContainer';
import { PreviewStep } from './PreviewStep';
import { QuoteFooter } from '../QuoteFooter';
import { ShareQuoteModal } from './ShareQuoteModal';
import { Slider } from '@atlas-ds/react-native';
import { isVehicleFound, validateRegistration, TENURE_YEAR_MAP } from './motorData';

type VehicleType = 'registered' | 'new' | null;

interface TwoWheelerInsuranceProps {
  onClose: () => void;
  onConvertToProposal: (customer: string) => void;
  /** Chosen before the flow mounts (from the Browse Categories sheet). */
  initialVehicleType?: 'registered' | 'new';
  /** Selected product label, e.g. "Two Wheeler" — drives the header title. */
  productName?: string;
}

/**
 * Two-Wheeler / Motor insurance quote flow (ported faithfully from web
 * dashboard/p5). Step 1 is a single scrolling form (vehicle identification →
 * plan details → IDV → suggested plans → add-ons → discount/loader → suggestions
 * → proposer) with a premium side panel; step 3 is the preview.
 */
export const TwoWheelerInsurance: React.FC<TwoWheelerInsuranceProps> = ({ onClose, onConvertToProposal, initialVehicleType, productName }) => {
  // The type is normally picked on the Browse Categories screen before this
  // flow mounts; the sheet only reappears after a Reset.
  const isNewInit = initialVehicleType === 'new';
  const [vehicleType, setVehicleType] = useState<VehicleType>(initialVehicleType ?? null);
  const [showVehicleTypeModal, setShowVehicleTypeModal] = useState(!initialVehicleType);
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [currentStep, setCurrentStep] = useState(1);

  const [selectedPlanType, setSelectedPlanType] = useState('');
  const [selectedCustomerType, setSelectedCustomerType] = useState('');
  const [policyStartDate, setPolicyStartDate] = useState<Date | null>(null);
  const [policyEndDate, setPolicyEndDate] = useState<Date | null>(null);
  const [policyTenure, setPolicyTenure] = useState('');

  const [proposerName, setProposerName] = useState('');
  const [proposerPhone, setProposerPhone] = useState('');
  const [proposerEmail, setProposerEmail] = useState('');

  const [vehicleModel, setVehicleModel] = useState(isNewInit ? '' : 'Swift Dzire');
  const [vehicleMake, setVehicleMake] = useState(isNewInit ? '' : '28914y0912');
  const [vehicleSubType, setVehicleSubType] = useState(isNewInit ? '' : 'One year');
  const [vehicleManufacturingYear, setVehicleManufacturingYear] = useState(isNewInit ? '' : '2020');
  const [registrationLocation, setRegistrationLocation] = useState(isNewInit ? '' : 'Pune');
  const [registrationDate, setRegistrationDate] = useState(isNewInit ? '' : '30 Nov 2020');
  const [vehicleIdv, setVehicleIdv] = useState('50000');
  const [currentPolicyNcb, setCurrentPolicyNcb] = useState('0');
  const [expiringPolicyNcb, setExpiringPolicyNcb] = useState('0');

  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [range, setRange] = useState<[number, number]>([0, 0]);

  const [showShareModal, setShowShareModal] = useState(false);

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
      setVehicleIdv('50000');
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
      setVehicleIdv('50000');
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
    return isVehicleFound(registrationNumber);
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
    : validateRegistration(registrationNumber) && isVehicleFound(registrationNumber);
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
    setVehicleIdv('');
    setCurrentPolicyNcb('');
    setExpiringPolicyNcb('');
    setSelectedPlanType('');
    setSelectedCustomerType('');
    setPolicyStartDate(null);
    setPolicyEndDate(null);
    setProposerName('');
    setProposerPhone('');
    setProposerEmail('');
    setSelectedAddOns([]);
    setRange([0, 0]);
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
        {currentStep !== 6 ? <MotorHeader productName={productName} /> : null}

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
            <DiscountLoaderCard value={range} setValue={setRange} />
            {/* <Suggestions /> */}
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
            discountLoader={range}
          />
        ) : currentStep === 6 ? (
          <PreviewStep proposerName={proposerName || 'Rakesh Kumar'} proposerDOB={new Date('1998-04-12')} productName={productName} />
        ) : null}
      </ScrollView>

      <View style={styles.footerWrap}>
        <QuoteFooter
          currentStep={currentStep}
          previewStep={6}
          previewQuoteStep={5}
          isProceedDisabled={!canProceed}
          onBack={() => (currentStep === 1 ? onClose() : setCurrentStep(currentStep - 1))}
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
