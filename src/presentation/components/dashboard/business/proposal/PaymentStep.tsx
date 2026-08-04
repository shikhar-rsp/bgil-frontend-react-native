import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Wallet, Link, HandCoins, Money, Receipt } from 'phosphor-react-native';
import { Textfield, Radio, colors, spacing, radius, typography, shadow, fontFamilyForWeight } from '@atlas-ds/react-native';
import { RequiredField } from '../RequiredField';
import { PAYMENT_MODES, type PaymentMode } from './proposalData';

/**
 * Glyph per payment mode, matching the web step's lucide set:
 * Wallet / Link2 / HandCoins / BadgeIndianRupee / ReceiptText.
 * Kept here rather than in `proposalData` so that stays free of view imports.
 */
const MODE_ICONS: Record<PaymentMode, React.FC<{ size: number; color: string }>> = {
  'agent-float': Wallet,
  'online-link': Link,
  'customer-float': HandCoins,
  cheque: Money,
  voucher: Receipt,
};

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
      <Text style={styles.label}>Select payment mode <Text style={styles.asterisk}>*</Text></Text>
      {/* Web lays these out as five icon tiles in a row; a phone has room for
          one per row, so the tile becomes a leading badge with the radio
          trailing. */}
      <View style={styles.modes}>
        {PAYMENT_MODES.map((m) => {
          const Icon = MODE_ICONS[m.value];
          const selected = data.mode === m.value;
          return (
            <Pressable
              key={m.value}
              style={[styles.mode, selected && styles.modeSel]}
              onPress={() => update('mode', m.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
            >
              <View style={styles.modeIcon}>
                <Icon size={20} color={colors.textOnBrand} />
              </View>
              <Text style={styles.modeLabel}>{m.label}</Text>
              <Radio selected={selected} onPress={() => update('mode', m.value)} />
            </Pressable>
          );
        })}
      </View>
    </View>

    {data.mode ? (
      <View style={styles.card}>
        <Text style={styles.heading}>Payment Details</Text>
        {data.mode === 'online-link' ? (
          <RequiredField label="Email ID">
            <Textfield value={data.email} onChangeText={(t) => update('email', t)} placeholder="Enter email ID" keyboardType="email-address" />
          </RequiredField>
        ) : null}
        {data.mode === 'voucher' || data.mode === 'cheque' ? (
          <RequiredField label="Receipt Number">
            <Textfield value={data.receiptNumber} onChangeText={(t) => update('receiptNumber', t)} placeholder="Enter Receipt Number" />
          </RequiredField>
        ) : null}
        {data.mode === 'agent-float' || data.mode === 'customer-float' ? (
          <RequiredField label="Party ID">
            <Textfield value={data.partyId} onChangeText={(t) => update('partyId', t)} placeholder="Enter Party ID" />
          </RequiredField>
        ) : null}
        {data.mode === 'cheque' ? (
          <>
            <RequiredField label="Account Number">
              <Textfield value={data.accountNumber} onChangeText={(t) => update('accountNumber', t.replace(/\D/g, ''))} placeholder="Enter account number" keyboardType="number-pad" />
            </RequiredField>
            <RequiredField label="IFSC Code">
              <Textfield value={data.ifsc} onChangeText={(t) => update('ifsc', t.toUpperCase())} placeholder="Enter IFSC code" />
            </RequiredField>
            <RequiredField label="Branch Name">
              <Textfield value={data.branch} onChangeText={(t) => update('branch', t)} placeholder="Enter branch name" />
            </RequiredField>
            <RequiredField label="Bank Name">
              <Textfield value={data.bank} onChangeText={(t) => update('bank', t)} placeholder="Enter bank name" />
            </RequiredField>
          </>
        ) : null}
      </View>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, gap: spacing.md, ...shadow.lg },
  heading: { fontFamily: fontFamilyForWeight('500'), fontSize: 20, fontWeight: '500', color: colors.textHeading },
  label: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textBody },
  asterisk: { color: colors.dangerText },
  modes: { gap: spacing.sm },
  mode: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.lg, padding: spacing.md },
  modeSel: { borderColor: '#3B82F6', backgroundColor: '#EFF6FF' },
  // Web: 40×40 #2563EB square, 8px radius, white glyph.
  modeIcon: { width: 40, height: 40, borderRadius: radius.lg, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center' },
  // `flex: 1` pushes the radio to the row's trailing edge.
  modeLabel: { flex: 1, fontFamily: typography.fontFamily, fontSize: 15, color: colors.textHeading },
});
