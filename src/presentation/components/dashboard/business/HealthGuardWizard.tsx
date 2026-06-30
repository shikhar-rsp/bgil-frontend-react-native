import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { CheckCircle, CheckSquare, Square } from 'phosphor-react-native';
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

const STEPS = [
  { label: 'Plan' },
  { label: 'Proposer' },
  { label: 'Add-ons' },
  { label: 'Preview' },
];

const ADD_ONS = ['Personal Accident Cover', 'Critical Illness', 'Hospital Cash', 'OPD Cover'];

interface HealthGuardWizardProps {
  product: string;
  onClose: () => void;
  onConvertToProposal: (customerName: string) => void;
}

/**
 * Health Guard quote wizard. A structural port of the web's 5-step flow
 * (PlanDetails → ProposerDetails → AddOns → Preview → success): same stepper UX
 * and key fields, with the heavier per-member sub-forms condensed.
 */
export const HealthGuardWizard: React.FC<HealthGuardWizardProps> = ({
  product,
  onClose,
  onConvertToProposal,
}) => {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  // Step 1 — plan
  const [planType, setPlanType] = useState<'individual' | 'float'>('individual');
  const [subPlan, setSubPlan] = useState<'silver' | 'gold' | 'platinum'>('gold');
  const [sumInsured, setSumInsured] = useState('500000');
  // Step 2 — proposer
  const [name, setName] = useState('');
  const [income, setIncome] = useState('');
  const [pincode, setPincode] = useState('');
  // Step 3 — add-ons
  const [addOns, setAddOns] = useState<string[]>([]);

  const toggleAddOn = (value: string) =>
    setAddOns((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));

  const canProceed =
    step === 0
      ? !!sumInsured
      : step === 1
        ? !!name && !!income && !!pincode
        : true;

  if (done) {
    return (
      <View style={styles.success}>
        <CheckCircle size={64} color={colors.success} weight="fill" />
        <Text style={styles.successTitle}>Quote generated!</Text>
        <Text style={styles.successBody}>Quote for {name || 'customer'} is ready to share or convert.</Text>
        <View style={styles.successActions}>
          <Button
            label="Convert to Proposal"
            onPress={() => onConvertToProposal(name || 'Customer')}
            fullWidth
          />
          <Button label="Back to Business" variant="secondaryGray" onPress={onClose} fullWidth />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.stepperWrap}>
        <ProgressStepper steps={STEPS} current={step} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.product}>{product}</Text>

        {step === 0 ? (
          <View style={styles.block}>
            <Text style={styles.label}>Plan type</Text>
            <Radio selected={planType === 'individual'} onPress={() => setPlanType('individual')} label="Individual" />
            <Radio selected={planType === 'float'} onPress={() => setPlanType('float')} label="Family Floater" />

            <Text style={styles.label}>Plan tier</Text>
            {(['silver', 'gold', 'platinum'] as const).map((tier) => (
              <Radio
                key={tier}
                selected={subPlan === tier}
                onPress={() => setSubPlan(tier)}
                label={tier[0].toUpperCase() + tier.slice(1)}
              />
            ))}

            <Textfield
              label="Sum Insured"
              value={sumInsured}
              onChangeText={(t) => setSumInsured(t.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              placeholder="500000"
            />
          </View>
        ) : step === 1 ? (
          <View style={styles.block}>
            <Textfield label="Proposer Name" value={name} onChangeText={setName} placeholder="Full name" />
            <Textfield
              label="Annual Income"
              value={income}
              onChangeText={(t) => setIncome(t.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              placeholder="100000"
            />
            <Textfield
              label="Pincode"
              value={pincode}
              onChangeText={(t) => setPincode(t.replace(/[^0-9]/g, '').slice(0, 6))}
              keyboardType="number-pad"
              placeholder="400001"
            />
          </View>
        ) : step === 2 ? (
          <View style={styles.block}>
            <Text style={styles.label}>Select add-ons</Text>
            {ADD_ONS.map((addOn) => {
              const checked = addOns.includes(addOn);
              return (
                <Pressable
                  key={addOn}
                  style={styles.addOnRow}
                  onPress={() => toggleAddOn(addOn)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked }}
                >
                  {checked ? (
                    <CheckSquare size={22} weight="fill" color={colors.brand} />
                  ) : (
                    <Square size={22} color={colors.textMuted} />
                  )}
                  <Text style={styles.addOnLabel}>{addOn}</Text>
                </Pressable>
              );
            })}
          </View>
        ) : (
          <View style={styles.block}>
            <Text style={styles.label}>Review</Text>
            <SummaryRow label="Product" value={product} />
            <SummaryRow label="Plan" value={`${planType === 'individual' ? 'Individual' : 'Family Floater'} · ${subPlan}`} />
            <SummaryRow label="Sum Insured" value={`₹ ${Number(sumInsured || 0).toLocaleString('en-IN')}`} />
            <SummaryRow label="Proposer" value={name || '—'} />
            <SummaryRow label="Add-ons" value={addOns.length ? addOns.join(', ') : 'None'} />
            <SummaryRow label="Estimated Premium" value="₹ 31,000" />
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
          label={step === STEPS.length - 1 ? 'Generate Quote' : 'Continue'}
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
  product: { fontFamily: typography.fontFamily, fontSize: 18, fontWeight: '600', color: colors.textHeading },
  block: { gap: spacing.md, backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg },
  label: { fontFamily: typography.fontFamily, fontSize: 14, fontWeight: '500', color: colors.textBody, marginTop: spacing.xs },
  addOnRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  addOnLabel: { fontFamily: typography.fontFamily, fontSize: 15, color: colors.textHeading },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs },
  summaryLabel: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textBody },
  summaryValue: { fontFamily: typography.fontFamily, fontSize: 14, fontWeight: '500', color: colors.textHeading, flexShrink: 1, textAlign: 'right' },
  footer: { flexDirection: 'row', gap: spacing.md, padding: spacing.lg, backgroundColor: colors.surface },
  footerBtn: { flex: 1 },
  success: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xl },
  successTitle: { fontFamily: typography.fontFamily, fontSize: 24, fontWeight: '600', color: colors.textHeading },
  successBody: { fontFamily: typography.fontFamily, fontSize: 15, color: colors.textBody, textAlign: 'center' },
  successActions: { width: '100%', gap: spacing.md, marginTop: spacing.lg },
});
