import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Modal, Pressable, StyleSheet } from 'react-native';
import { CheckCircle, FilePlus, FileText } from 'phosphor-react-native';
import { Button, ProgressStepper, Radio, colors, spacing, radius, typography } from '@atlas-ds/react-native';
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
const emptyKyc: KycData = { pan: '', ckyc: '', aadhaar: '', phone: '', email: '', verified: false };
const emptyPayment: PaymentData = { mode: '', email: '', receiptNumber: '', accountNumber: '', partyId: '', ifsc: '', branch: '', bank: '' };

export const ConvertProposal: React.FC<ConvertProposalProps> = ({ customerName, planType = 'float', onClose }) => {
  const [businessType, setBusinessType] = useState<BusinessType | null>(null);
  const [showTypeModal, setShowTypeModal] = useState(true);
  const [stepIndex, setStepIndex] = useState(0);
  const [issued, setIssued] = useState(false);

  const [proposer, setProposer] = useState<ProposerData>({ ...emptyProposer, proposerName: customerName });
  const [members, setMembers] = useState<ProposalMember[]>([newMember('m-1')]);
  const [nominees, setNominees] = useState<Nominee[]>([newNominee('n-1')]);
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
  const updateNominee = (id: string, f: keyof Nominee, v: Nominee[keyof Nominee]) =>
    setNominees((prev) => prev.map((n) => (n.id === id ? { ...n, [f]: v } : n)));

  const canProceed = (() => {
    switch (key) {
      case 'proposer':
        return !!(proposer.proposerName && proposer.proposerDOB && proposer.contactNo && proposer.emailId && proposer.pincode.length === 6);
      case 'members':
        return members.every((m) => m.name && m.relationship && m.dob);
      case 'nominee':
        return nominees.every((n) => n.name && n.relationship);
      case 'previous':
        return !!(prevPolicy.policyNumber && prevPolicy.insurer);
      case 'kyc':
        return kyc.verified;
      case 'payment':
        return payment.mode !== '';
      default:
        return true;
    }
  })();

  const isLast = stepIndex === stepKeys.length - 1;
  const goNext = () => (isLast ? setIssued(true) : setStepIndex((s) => s + 1));

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
          <AddOnsStep wantsAddOns={wantsAddOns} setWantsAddOns={setWantsAddOns} selectedAddOns={selectedAddOns} setSelectedAddOns={setSelectedAddOns} />
        ) : key === 'nominee' ? (
          <NomineeDetailsStep
            nominees={nominees}
            updateNominee={updateNominee}
            addNominee={() => setNominees((prev) => [...prev, newNominee(`n-${prev.length + 1}-${prev.length}`)])}
            removeNominee={(id) => setNominees((prev) => prev.filter((n) => n.id !== id))}
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
        <Button label="Back" variant="secondaryGray" size="sm" onPress={() => (stepIndex > 0 ? setStepIndex(stepIndex - 1) : onClose())} />
        <Button label={isLast ? 'Issue Policy' : 'Proceed'} size="sm" disabled={!canProceed} onPress={goNext} />
      </View>

      {/* Business type selection */}
      <Modal visible={showTypeModal} transparent animationType="fade" onRequestClose={() => { setShowTypeModal(false); if (!businessType) onClose(); }}>
        <View style={styles.scrim}>
          <View style={styles.typeCard}>
            <Text style={styles.typeTitle}>Select Business Type</Text>
            <View style={styles.typeOptions}>
              {[
                { value: 'new' as const, label: 'New Business', sub: 'Fresh policy', Icon: FilePlus, bg: '#2563EB' },
                { value: 'portability' as const, label: 'Portability', sub: 'Port an existing policy', Icon: FileText, bg: '#EA580C' },
              ].map((opt) => (
                <Pressable key={opt.value} style={[styles.typeOption, businessType === opt.value && styles.typeOptionSel]} onPress={() => setBusinessType(opt.value)} accessibilityRole="radio" accessibilityState={{ selected: businessType === opt.value }}>
                  <View style={styles.typeOptTop}>
                    <View style={[styles.typeIcon, { backgroundColor: opt.bg }]}>
                      <opt.Icon size={24} color="#FFFFFF" />
                    </View>
                    <Radio selected={businessType === opt.value} onPress={() => setBusinessType(opt.value)} />
                  </View>
                  <Text style={styles.typeOptLabel}>{opt.label}</Text>
                  <Text style={styles.typeOptSub}>{opt.sub}</Text>
                </Pressable>
              ))}
            </View>
            <Button label="Proceed" disabled={!businessType} onPress={() => setShowTypeModal(false)} fullWidth />
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
  scrim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  typeCard: { width: '100%', maxWidth: 480, backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.xl, gap: spacing.lg },
  typeTitle: { fontFamily: typography.fontFamily, fontSize: 18, fontWeight: '600', color: colors.textHeading },
  typeOptions: { flexDirection: 'row', gap: spacing.md },
  typeOption: { flex: 1, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.lg, padding: spacing.md, gap: spacing.md },
  typeOptionSel: { borderColor: '#3B82F6', backgroundColor: '#EFF6FF' },
  typeOptTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  typeIcon: { width: 40, height: 40, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  typeOptLabel: { fontFamily: typography.fontFamily, fontSize: 15, fontWeight: '500', color: colors.textHeading },
  typeOptSub: { fontFamily: typography.fontFamily, fontSize: 13, color: colors.textBody },
  success: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xl, backgroundColor: colors.surfaceSubtle },
  successTitle: { fontFamily: typography.fontFamily, fontSize: 24, fontWeight: '600', color: colors.textHeading },
  successBody: { fontFamily: typography.fontFamily, fontSize: 15, color: colors.textBody, textAlign: 'center' },
  successBtn: { width: '100%', maxWidth: 320, marginTop: spacing.lg },
});
