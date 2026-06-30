import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { CheckCircle } from 'phosphor-react-native';
import {
  Button,
  Textfield,
  Radio,
  ProgressStepper,
  colors,
  spacing,
  radius,
  typography,
} from '@atlas-ds/react-native';

const STEPS = [{ label: 'Proposer' }, { label: 'Nominee' }, { label: 'Payment' }];

interface ConvertProposalWizardProps {
  customerName: string;
  onClose: () => void;
}

/**
 * Convert-to-Proposal wizard. A structural port of the web's multi-step proposal
 * flow (proposer KYC → nominee/members → payment) capturing the stepper UX and
 * core fields; the heavier KYC/underwriting sub-forms are condensed.
 */
export const ConvertProposalWizard: React.FC<ConvertProposalWizardProps> = ({
  customerName,
  onClose,
}) => {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  const [name, setName] = useState(customerName);
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [address, setAddress] = useState('');
  const [nominee, setNominee] = useState('');
  const [relationship, setRelationship] = useState<'spouse' | 'child' | 'parent'>('spouse');
  const [payMode, setPayMode] = useState<'online' | 'cheque'>('online');

  const canProceed =
    step === 0 ? !!name && !!email && !!contact : step === 1 ? !!nominee : true;

  if (done) {
    return (
      <View style={styles.success}>
        <CheckCircle size={64} color={colors.success} weight="fill" />
        <Text style={styles.successTitle}>Proposal submitted!</Text>
        <Text style={styles.successBody}>Proposal for {name} has been submitted for underwriting.</Text>
        <Button label="Back to Business" variant="secondaryGray" onPress={onClose} style={styles.successBtn} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.stepperWrap}>
        <ProgressStepper steps={STEPS} current={step} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {step === 0 ? (
          <View style={styles.block}>
            <Textfield label="Proposer Name" value={name} onChangeText={setName} placeholder="Full name" />
            <Textfield
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              placeholder="email@example.com"
            />
            <Textfield
              label="Contact No."
              value={contact}
              onChangeText={(t) => setContact(t.replace(/[^0-9]/g, '').slice(0, 10))}
              keyboardType="number-pad"
              placeholder="9876543210"
            />
            <Textfield label="Address" value={address} onChangeText={setAddress} placeholder="Address" />
          </View>
        ) : step === 1 ? (
          <View style={styles.block}>
            <Textfield label="Nominee Name" value={nominee} onChangeText={setNominee} placeholder="Full name" />
            <Text style={styles.label}>Relationship</Text>
            {(['spouse', 'child', 'parent'] as const).map((rel) => (
              <Radio
                key={rel}
                selected={relationship === rel}
                onPress={() => setRelationship(rel)}
                label={rel[0].toUpperCase() + rel.slice(1)}
              />
            ))}
          </View>
        ) : (
          <View style={styles.block}>
            <Text style={styles.label}>Payment method</Text>
            <Radio selected={payMode === 'online'} onPress={() => setPayMode('online')} label="Online Payment" />
            <Radio selected={payMode === 'cheque'} onPress={() => setPayMode('cheque')} label="Cheque" />

            <View style={styles.summaryBox}>
              <SummaryRow label="Proposer" value={name} />
              <SummaryRow label="Nominee" value={`${nominee} (${relationship})`} />
              <SummaryRow label="Premium" value="₹ 31,000" />
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={step === 0 ? 'Cancel' : 'Back'}
          variant="secondaryGray"
          onPress={() => (step === 0 ? onClose() : setStep((s) => s - 1))}
          style={styles.footerBtn}
        />
        <Button
          label={step === STEPS.length - 1 ? 'Submit Proposal' : 'Continue'}
          disabled={!canProceed}
          onPress={() => (step === STEPS.length - 1 ? setDone(true) : setStep((s) => s + 1))}
          style={styles.footerBtn}
        />
      </View>
    </View>
  );
};

const SummaryRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.summaryRow}>
    <Text style={styles.summaryLabel}>{label}</Text>
    <Text style={styles.summaryValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surfaceSubtle },
  stepperWrap: { padding: spacing.lg, backgroundColor: colors.surface },
  content: { padding: spacing.lg, gap: spacing.lg },
  block: { gap: spacing.md, backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg },
  label: { fontFamily: typography.fontFamily, fontSize: 14, fontWeight: '500', color: colors.textBody, marginTop: spacing.xs },
  summaryBox: { gap: spacing.xs, marginTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.borderSubtle, paddingTop: spacing.md },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs },
  summaryLabel: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textBody },
  summaryValue: { fontFamily: typography.fontFamily, fontSize: 14, fontWeight: '500', color: colors.textHeading },
  footer: { flexDirection: 'row', gap: spacing.md, padding: spacing.lg, backgroundColor: colors.surface },
  footerBtn: { flex: 1 },
  success: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xl },
  successTitle: { fontFamily: typography.fontFamily, fontSize: 24, fontWeight: '600', color: colors.textHeading },
  successBody: { fontFamily: typography.fontFamily, fontSize: 15, color: colors.textBody, textAlign: 'center' },
  successBtn: { width: '100%', marginTop: spacing.lg },
});
