import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { CheckCircle, Confetti, ArrowsLeftRight, Link } from 'phosphor-react-native';
import { Button, BottomSheet, Toast, colors, spacing, radius, typography, fontFamilyForWeight } from '@atlas-ds/react-native';
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

const emptyProposer: ProposerData = { proposerName: '', proposerDOB: null, annualIncome: '', contactNo: '', emailId: '', address: '', pincode: '', city: '', area: '', state: '', gender: '', nationality: '', maritalStatus: '', occupation: '' };
const emptyPrevPolicy: PreviousPolicyData = { policyNumber: '', insurer: '', sumInsured: '', startDate: null, endDate: null, cumulativeBonus: '' };
const emptyKyc: KycData = { pan: '', ckyc: '', aadhaar: '', phone: '', email: '', verified: false, kycMethod: '', kycDone: false, confirmMethod: '' };
const emptyPayment: PaymentData = { mode: '', email: '', receiptNumber: '', accountNumber: '', partyId: '', ifsc: '', branch: '', bank: '' };

export const ConvertProposal: React.FC<ConvertProposalProps> = ({ customerName, planType = 'float', onClose }) => {
  const [businessType, setBusinessType] = useState<BusinessType | null>(null);
  const [showTypeModal, setShowTypeModal] = useState(true);
  const [stepIndex, setStepIndex] = useState(0);
  const [issued, setIssued] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

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

  // "Issue another policy" — reset the flow to a fresh proposal.
  const handleIssueAnother = () => {
    setIssued(false);
    setLinkCopied(false);
    setStepIndex(0);
    setBusinessType(null);
    setShowTypeModal(true);
    setProposer({ ...emptyProposer, proposerName: customerName });
    setMembers([newMember('m-1')]);
    setNominees({});
    setWantsAddOns('yes');
    setSelectedAddOns([]);
    setPrevPolicy(emptyPrevPolicy);
    setKyc(emptyKyc);
    setPayment(emptyPayment);
  };

  return (
    <View style={styles.flex}>
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
              <Button label={isLast ? 'Issue Policy' : 'Proceed'} size="sm"  onPress={goNext} />
            </View>
          </>
        )}
      </View>

      {/* Business type selection */}
      <BottomSheet
        visible={showTypeModal}
        onClose={() => { setShowTypeModal(false); if (!businessType) onClose(); }}
        title="Select Business Type"
        subtitle="Choose a business type to proceed with policy issuance"
        contentMinHeight={0}
      >
        <View style={styles.typeOptions}>
          {[
            { value: 'new' as const, label: 'New Business', sub: 'Customer does not have any policy with any insurer.', Icon: Confetti, bg: '#059669', border: '#A7F3D0' },
            { value: 'portability' as const, label: 'Portability', sub: 'Customer has an existing policy with another insurer.', Icon: ArrowsLeftRight, bg: '#2563EB', border: '#BFDBFE' },
          ].map((opt) => (
            <Pressable
              key={opt.value}
              style={[styles.typeOption, { borderColor: opt.border }]}
              onPress={() => { setBusinessType(opt.value); setShowTypeModal(false); }}
              accessibilityRole="button"
              accessibilityLabel={opt.label}
            >
              <View style={[styles.typeIcon, { backgroundColor: opt.bg }]}>
                <opt.Icon size={24} color="#FFFFFF" />
              </View>
              <View style={styles.typeOptText}>
                <Text style={styles.typeOptLabel}>{opt.label}</Text>
                <Text style={styles.typeOptSub}>{opt.sub}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </BottomSheet>

      {/* Policy issued — payment link confirmation */}
      <BottomSheet
        visible={issued}
        onClose={() => setIssued(false)}
        icon={<CheckCircle size={20} color="#65A30D" weight="fill" />}
        featuredIconColor="lime"
        title="Payment Link Sent!"
        contentMinHeight={0}
      >
        <View style={styles.issuedContent}>
          {linkCopied ? <Toast variant="neutral" title="Link copied" onClose={() => setLinkCopied(false)} /> : null}
          <Text style={styles.issuedText}>
            Payment link for your proposal ID 18637815 has been sent successfully!
          </Text>
          <View style={styles.issuedActions}>
            <Button
              label="Copy Payment Link"
              variant="secondaryGray"
              leadingIcon={<Link size={16} color={colors.textBody} />}
              onPress={() => setLinkCopied(true)}
              style={styles.issuedBtn}
            />
            <Button label="Issue another policy" onPress={handleIssueAnother} style={styles.issuedBtn} />
          </View>
        </View>
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.surfaceSubtle },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, padding: spacing.lg, backgroundColor: colors.surface },
  right: { flexDirection: 'row', gap: spacing.sm },
  typeOptions: { gap: spacing.md },
  // Tap-to-proceed row: icon left, text right (mirrors the motor vehicle-type sheet).
  typeOption: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.lg, padding: spacing.md, backgroundColor: colors.surface },
  typeIcon: { width: 40, height: 40, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  typeOptText: { flex: 1, gap: spacing.xs },
  typeOptLabel: { fontFamily: fontFamilyForWeight('500'), fontSize: 15, fontWeight: '500', color: colors.textHeading },
  typeOptSub: { fontFamily: typography.fontFamily, fontSize: 13, color: colors.textBody },
  // Payment-link-sent sheet — a divider above the centred message, then actions.
  issuedContent: { gap: spacing.lg, borderTopWidth: 1, borderTopColor: colors.borderSubtle, paddingTop: spacing.lg },
  issuedText: { fontFamily: typography.fontFamily, fontSize: 14, lineHeight: 20, color: colors.textBody, textAlign: 'center' },
  issuedActions: { flexDirection: 'row', gap: spacing.md },
  issuedBtn: { flex: 1, alignSelf: 'stretch' },
});
