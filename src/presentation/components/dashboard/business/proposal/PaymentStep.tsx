import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Textfield, Radio, colors, spacing, radius, typography, shadow } from '@atlas-ds/react-native';
import { PAYMENT_MODES, type PaymentMode } from './proposalData';

export type PaymentData = {
  mode: PaymentMode | '';
  email: string;
  receiptNumber: string;
  accountNumber: string;
  partyId: string;
  ifsc: string;
  branch: string;
  bank: string;
};

interface PaymentStepProps {
  data: PaymentData;
  update: <K extends keyof PaymentData>(field: K, value: PaymentData[K]) => void;
}

export const PaymentStep: React.FC<PaymentStepProps> = ({ data, update }) => (
  <View style={styles.wrap}>
    <View style={styles.card}>
      <Text style={styles.heading}>Payment</Text>
      <Text style={styles.label}>Select payment mode *</Text>
      <View style={styles.modes}>
        {PAYMENT_MODES.map((m) => (
          <Pressable
            key={m.value}
            style={[styles.mode, data.mode === m.value && styles.modeSel]}
            onPress={() => update('mode', m.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected: data.mode === m.value }}
          >
            <Radio selected={data.mode === m.value} onPress={() => update('mode', m.value)} />
            <Text style={styles.modeLabel}>{m.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>

    {data.mode ? (
      <View style={styles.card}>
        <Text style={styles.heading}>Payment Details</Text>
        {data.mode === 'online-link' ? (
          <Textfield label="Email ID *" value={data.email} onChangeText={(t) => update('email', t)} placeholder="Enter email ID" keyboardType="email-address" />
        ) : null}
        {data.mode === 'voucher' || data.mode === 'cheque' ? (
          <Textfield label="Receipt Number *" value={data.receiptNumber} onChangeText={(t) => update('receiptNumber', t)} placeholder="Enter Receipt Number" />
        ) : null}
        {data.mode === 'agent-float' || data.mode === 'customer-float' ? (
          <Textfield label="Party ID *" value={data.partyId} onChangeText={(t) => update('partyId', t)} placeholder="Enter Party ID" />
        ) : null}
        {data.mode === 'cheque' ? (
          <>
            <Textfield label="Account Number *" value={data.accountNumber} onChangeText={(t) => update('accountNumber', t.replace(/\D/g, ''))} placeholder="Enter account number" keyboardType="number-pad" />
            <Textfield label="IFSC Code *" value={data.ifsc} onChangeText={(t) => update('ifsc', t.toUpperCase())} placeholder="Enter IFSC code" />
            <Textfield label="Branch Name *" value={data.branch} onChangeText={(t) => update('branch', t)} placeholder="Enter branch name" />
            <Textfield label="Bank Name *" value={data.bank} onChangeText={(t) => update('bank', t)} placeholder="Enter bank name" />
          </>
        ) : null}
      </View>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, gap: spacing.md, ...shadow.lg },
  heading: { fontFamily: typography.fontFamily, fontSize: 20, fontWeight: '500', color: colors.textHeading },
  label: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textBody },
  modes: { gap: spacing.sm },
  mode: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.lg, padding: spacing.md },
  modeSel: { borderColor: '#3B82F6', backgroundColor: '#EFF6FF' },
  modeLabel: { fontFamily: typography.fontFamily, fontSize: 15, color: colors.textHeading },
});
