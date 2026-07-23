import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Modal, Pressable, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { CheckCircle, Confetti, ArrowsLeftRight, X } from 'phosphor-react-native';
import { Button, ProgressStepper, Radio, colors, spacing, radius, typography, fontFamilyForWeight } from '@atlas-ds/react-native';
import { PolicyHeader } from './PolicyHeader';
import { PreviewQuoteStep } from './PreviewQuoteStep';
import { ProposerDetailsStep, type ProposerData } from './ProposerDetailsStep';
import { MemberDetailsStep } from './MemberDetailsStep';
import { AddOnsStep } from './AddOnsStep';
import { NomineeDetailsStep } from './NomineeDetailsStep';
import { PreviousPolicyStep, type PreviousPolicyData } from './PreviousPolicyStep';
import { KycDetailsStep, type KycData } from './KycDetailsStep';
import { PaymentStep, type PaymentData } from './PaymentStep';
import { newMember, newNominee, type BusinessType, type PlanType, type ProposalMember, type Nominee } from './proposalData';

interface ConvertProposalProps {
  customerName: string;
  planType?: PlanType;
  onClose: () => void;
}

const STEP_META: Record<string, { label: string }> = {
  preview: { label: 'Preview' },
  proposer: { label: 'Proposer' },
  members: { label: 'Members' },
  addons: { label: 'Add-ons' },
  nominee: { label: 'Nominee' },
  previous: { label: 'Prev. Policy' },
  kyc: { label: 'KYC' },
  payment: { label: 'Payment' },
};

const emptyProposer: ProposerData = { proposerName: '', proposerDOB: null, annualIncome: '', contactNo: '', emailId: '', address: '', pincode: '', city: '', area: '', state: '', gender: '', nationality: '', maritalStatus: '', occupation: '' };
const emptyPrevPolicy: PreviousPolicyData = { policyNumber: '', insurer: '', sumInsured: '', startDate: null, endDate: null, cumulativeBonus: '' };
const emptyKyc: KycData = { pan: '', ckyc: '', aadhaar: '', phone: '', email: '', verified: false, kycMethod: '', kycDone: false, confirmMethod: '' };
const emptyPayment: PaymentData = { mode: '', email: '', receiptNumber: '', accountNumber: '', partyId: '', ifsc: '', branch: '', bank: '' };

export const ConvertProposal: React.FC<ConvertProposalProps> = ({ customerName, planType = 'float', onClose }) => {
  const [businessType, setBusinessType] = useState<BusinessType | null>(null);
  const [showTypeModal, setShowTypeModal] = useState(true);
  const [stepIndex, setStepIndex] = useState(0);
  const [issued, setIssued] = useState(false);

  const [proposer, setProposer] = useState<ProposerData>({ ...emptyProposer, proposerName: customerName });
  const [members, setMembers] = useState<ProposalMember[]>([newMember('m-1')]);
  // Nominees are keyed by member id — one nominee per member, mirroring the
  // Member Details step.
  const [nominees, setNominees] = useState<Record<string, Nominee>>({});
  const [wantsAddOns, setWantsAddOns] = useState('yes');
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [prevPolicy, setPrevPolicy] = useState<PreviousPolicyData>(emptyPrevPolicy);
  const [kyc, setKyc] = useState<KycData>(emptyKyc);
  const [payment, setPayment] = useState<PaymentData>(emptyPayment);

  const stepKeys = useMemo(
    () =>
      businessType === 'portability'
        ? ['preview', 'proposer', 'members', 'addons', 'nominee', 'previous', 'kyc', 'payment']
        : ['preview', 'proposer', 'members', 'addons', 'nominee', 'kyc', 'payment'],
    [businessType],
  );
  const steps = stepKeys.map((k) => STEP_META[k]);
  const key = stepKeys[stepIndex];

  const updateProposer = <K extends keyof ProposerData>(f: K, v: ProposerData[K]) => setProposer((p) => ({ ...p, [f]: v }));
  const updatePrev = <K extends keyof PreviousPolicyData>(f: K, v: PreviousPolicyData[K]) => setPrevPolicy((p) => ({ ...p, [f]: v }));
  const updateKyc = <K extends keyof KycData>(f: K, v: KycData[K]) => setKyc((p) => ({ ...p, [f]: v }));
  const updatePayment = <K extends keyof PaymentData>(f: K, v: PaymentData[K]) => setPayment((p) => ({ ...p, [f]: v }));
  const updateMember = (id: string, f: keyof ProposalMember, v: ProposalMember[keyof ProposalMember]) =>
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, [f]: v } : m)));
  const updateNominee = (memberId: string, f: keyof Nominee, v: Nominee[keyof Nominee]) =>
    setNominees((prev) => ({ ...prev, [memberId]: { ...(prev[memberId] ?? newNominee(memberId)), [f]: v } }));

  const canProceed = (() => {
    switch (key) {
      case 'proposer':
        return !!(proposer.proposerName && proposer.proposerDOB && proposer.contactNo && proposer.emailId && proposer.pincode.length === 6);
      case 'members':
        return members.every((m) => m.name && m.relationship && m.dob);
      case 'nominee':
        return members.length > 0 && members.every((m) => nominees[m.id]?.name && nominees[m.id]?.relationship);
      case 'previous':
        return !!(prevPolicy.policyNumber && prevPolicy.insurer);
      case 'kyc':
        return kyc.kycDone && kyc.verified;
      case 'payment':
        return payment.mode !== '';
      default:
        return true;
    }
  })();

  const isLast = stepIndex === stepKeys.length - 1;
  const goNext = () => (isLast ? setIssued(true) : setStepIndex((s) => s + 1));

  // Reset just the current step's fields back to their empty defaults.
  const resetStep = () => {
    switch (key) {
      case 'proposer':
        setProposer({ ...emptyProposer, proposerName: customerName });
        break;
      case 'members':
        setMembers([newMember('m-1')]);
        break;
      case 'addons':
        setWantsAddOns('yes');
        setSelectedAddOns([]);
        break;
      case 'nominee':
        setNominees({});
        break;
      case 'previous':
        setPrevPolicy(emptyPrevPolicy);
        break;
      case 'kyc':
        setKyc(emptyKyc);
        break;
      case 'payment':
        setPayment(emptyPayment);
        break;
      default:
        break;
    }
  };

  if (issued) {
    return (
      <View style={styles.success}>
        <CheckCircle size={64} color={colors.success} weight="fill" />
        <Text style={styles.successTitle}>Policy issued!</Text>
        <Text style={styles.successBody}>Proposal for {proposer.proposerName || customerName} has been submitted.</Text>
        <Button label="Back to Business" variant="secondaryGray" onPress={onClose} style={styles.successBtn} />
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <View style={styles.stepperWrap}>
        <ProgressStepper steps={steps} current={stepIndex} onStepPress={(i) => i < stepIndex && setStepIndex(i)} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <PolicyHeader policyNumber="PR-28686" customerName={proposer.proposerName || customerName} />

        {key === 'preview' ? (
          <PreviewQuoteStep customerName={proposer.proposerName || customerName} planType={planType} />
        ) : key === 'proposer' ? (
          <ProposerDetailsStep data={proposer} update={updateProposer} />
        ) : key === 'members' ? (
          <MemberDetailsStep
            members={members}
            updateMember={updateMember}
            addMember={() => setMembers((prev) => [...prev, newMember(`m-${prev.length + 1}-${prev.length}`)])}
            removeMember={(id) => setMembers((prev) => prev.filter((m) => m.id !== id))}
          />
        ) : key === 'addons' ? (
          <AddOnsStep wantsAddOns={wantsAddOns} setWantsAddOns={setWantsAddOns} selectedAddOns={selectedAddOns} setSelectedAddOns={setSelectedAddOns} onSkipAndProceed={goNext} />
        ) : key === 'nominee' ? (
          <NomineeDetailsStep
            members={members}
            nominees={nominees}
            updateNominee={updateNominee}
          />
        ) : key === 'previous' ? (
          <PreviousPolicyStep data={prevPolicy} update={updatePrev} />
        ) : key === 'kyc' ? (
          <KycDetailsStep data={kyc} update={updateKyc} />
        ) : (
          <PaymentStep data={payment} update={updatePayment} />
        )}
      </ScrollView>

      <View style={styles.footer}>
        {key === 'preview' ? (
          <>
            <Button label="Download Quote" variant="secondaryGray" size="sm" onPress={() => {}} />
            <View style={styles.right}>
              <Button label="Share" variant="secondary" size="sm" onPress={() => {}} />
              <Button label="Convert" size="sm" onPress={goNext} />
            </View>
          </>
        ) : (
          <>
            <Button label="Reset form" variant="secondaryGray" size="sm" onPress={resetStep} />
            <View style={styles.right}>
              <Button label="Back" variant="secondary" size="sm" onPress={() => setStepIndex((s) => Math.max(0, s - 1))} />
              <Button label={isLast ? 'Issue Policy' : 'Proceed'} size="sm"  disabled={!canProceed} onPress={goNext} />
            </View>
          </>
        )}
      </View>

      {/* Business type selection */}
      <Modal visible={showTypeModal}  transparent animationType="fade" onRequestClose={() => { setShowTypeModal(false); if (!businessType) onClose(); }}>
        <View style={styles.scrim}>
          <View style={styles.typeCard}>
            <View style={styles.typeHeader}>
              <View style={styles.typeHeaderText}>
                <Text style={styles.typeTitle}>Select Business Type</Text>
                <Text style={styles.typeSubtitle}>Choose a business type to proceed with policy issuance</Text>
              </View>
              <Pressable onPress={() => { setShowTypeModal(false); onClose(); }} hitSlop={8} accessibilityRole="button" accessibilityLabel="Close">
                <X size={20} color={colors.textMuted} />
              </Pressable>
            </View>
            <View style={styles.typeOptions}>
              {[
                { value: 'new' as const, label: 'New Business', sub: 'Customer does not have any policy with any insurer.', Icon: Confetti, bg: '#059669', border: '#A7F3D0', borderSel: '#34D399', tint: '#ECFDF5' },
                { value: 'portability' as const, label: 'Portability', sub: 'Customer has an existing policy with another insurer.', Icon: ArrowsLeftRight, bg: '#2563EB', border: '#BFDBFE', borderSel: '#60A5FA', tint: '#EFF6FF' },
              ].map((opt) => {
                const isSel = businessType === opt.value;
                return (
                  <Pressable key={opt.value} style={[styles.typeOption, { borderColor: isSel ? opt.borderSel : opt.border }]} onPress={() => setBusinessType(opt.value)} accessibilityRole="radio" accessibilityState={{ selected: isSel }}>
                    {/* RN has no radial gradient — approximate `at 50% 0%` with a
                        top→bottom white→tint LinearGradient. */}
                    {isSel ? <LinearGradient colors={['#FFFFFF', opt.tint]} style={StyleSheet.absoluteFill} /> : null}
                    <View style={styles.typeOptTop}>
                      <View style={[styles.typeIcon, { backgroundColor: opt.bg }]}>
                        <opt.Icon size={24} color="#FFFFFF" />
                      </View>
                      <Radio selected={isSel} onPress={() => setBusinessType(opt.value)} />
                    </View>
                    <Text style={styles.typeOptLabel}>{opt.label}</Text>
                    <Text style={styles.typeOptSub}>{opt.sub}</Text>
                  </Pressable>
                );
              })}
            </View>
            <View style={styles.typeActions}>
              <Button label="Cancel" variant="secondary" onPress={() => { setShowTypeModal(false); onClose(); }} style={styles.typeActionBtn} />
              <Button label="Proceed" disabled={!businessType} onPress={() => setShowTypeModal(false)} style={styles.typeActionBtn} />
            </View>
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
  scrim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  typeCard: { width: '100%', maxWidth: 480, backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.xl, gap: spacing.lg },
  typeHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.md },
  typeHeaderText: { flex: 1, gap: spacing.xs },
  typeTitle: { fontFamily: fontFamilyForWeight('500'), fontSize: 18, fontWeight: '600', color: colors.textHeading },
  typeSubtitle: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textBody },
  typeOptions: { flexDirection: 'column', gap: spacing.md },
  typeActions: { flexDirection: 'row', gap: spacing.md },
  // `stretch` overrides Button's own `alignSelf: 'flex-start'` so both halves match.
  typeActionBtn: { flex: 1, alignSelf: 'stretch' },
  // overflow:hidden keeps the selected gradient inside the rounded border.
  typeOption: { borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.lg, padding: spacing.md, gap: spacing.md, backgroundColor: colors.surface, overflow: 'hidden' },
  typeOptTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  typeIcon: { width: 40, height: 40, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  typeOptLabel: { fontFamily: fontFamilyForWeight('500'), fontSize: 15, fontWeight: '500', color: colors.textHeading },
  typeOptSub: { fontFamily: typography.fontFamily, fontSize: 13, color: colors.textBody },
  success: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xl, backgroundColor: colors.surfaceSubtle },
  successTitle: { fontFamily: typography.fontFamily, fontSize: 24, fontWeight: '600', color: colors.textHeading },
  successBody: { fontFamily: typography.fontFamily, fontSize: 15, color: colors.textBody, textAlign: 'center' },
  successBtn: { width: '100%', maxWidth: 320, marginTop: spacing.lg },
});
