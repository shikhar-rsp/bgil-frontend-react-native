import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet } from 'react-native';
import { CheckCircle } from 'phosphor-react-native';
import { Textfield, Button, OtpInput, colors, spacing, radius, typography, shadow } from '@atlas-ds/react-native';
import { MOCK_OTP } from './proposalData';

export type KycData = {
  pan: string;
  ckyc: string;
  aadhaar: string;
  phone: string;
  email: string;
  verified: boolean;
};

interface KycDetailsStepProps {
  data: KycData;
  update: <K extends keyof KycData>(field: K, value: KycData[K]) => void;
}

export const KycDetailsStep: React.FC<KycDetailsStepProps> = ({ data, update }) => {
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);

  const verify = () => {
    if (otp === MOCK_OTP) {
      update('verified', true);
      setShowOtp(false);
      setOtp('');
    } else {
      setOtpError(`Invalid OTP. Use ${MOCK_OTP}.`);
    }
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        <Text style={styles.heading}>Proposer's KYC</Text>
        <Textfield label="PAN number *" value={data.pan} onChangeText={(t) => update('pan', t.toUpperCase().slice(0, 10))} placeholder="Enter PAN number (ABCDE1234F)" />
        <Textfield label="CKYC number" value={data.ckyc} onChangeText={(t) => update('ckyc', t)} placeholder="Number will be fetched" readOnly />
        <Textfield label="Aadhaar Number" value={data.aadhaar} onChangeText={(t) => update('aadhaar', t.replace(/\D/g, '').slice(0, 12))} placeholder="Enter your Aadhaar Number" keyboardType="number-pad" />
      </View>

      <View style={styles.card}>
        <Text style={styles.heading}>Proposal Confirmation</Text>
        <Text style={styles.sub}>Confirm contact details to send OTP</Text>
        <Textfield label="Phone number *" value={data.phone} onChangeText={(t) => update('phone', t.replace(/\D/g, '').slice(0, 10))} placeholder="+91" keyboardType="number-pad" />
        <Textfield label="Email ID *" value={data.email} onChangeText={(t) => update('email', t)} placeholder="email@example.com" keyboardType="email-address" />
        {data.verified ? (
          <View style={styles.verified}>
            <CheckCircle size={18} color={colors.success} weight="fill" />
            <Text style={styles.verifiedText}>Contact verified</Text>
          </View>
        ) : (
          <Button label="Send OTP" variant="secondary" onPress={() => { setShowOtp(true); setOtpError(null); }} fullWidth />
        )}
      </View>

      <Modal visible={showOtp} transparent animationType="fade" onRequestClose={() => setShowOtp(false)}>
        <View style={styles.scrim}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Verify OTP</Text>
            <Text style={styles.sub}>Enter the 6-digit code sent to {data.phone || 'your phone'}</Text>
            <OtpInput value={otp} onChange={(v) => { setOtp(v); setOtpError(null); }} length={6} error={otpError ?? undefined} />
            <View style={styles.modalActions}>
              <Button label="Cancel" variant="secondaryGray" onPress={() => setShowOtp(false)} style={styles.modalBtn} />
              <Button label="Verify" disabled={otp.length !== 6} onPress={verify} style={styles.modalBtn} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, gap: spacing.md, ...shadow.lg },
  heading: { fontFamily: typography.fontFamily, fontSize: 20, fontWeight: '500', color: colors.textHeading },
  sub: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textBody },
  verified: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  verifiedText: { fontFamily: typography.fontFamily, fontSize: 14, fontWeight: '500', color: colors.success },
  scrim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  modalCard: { width: '100%', maxWidth: 420, backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.xl, gap: spacing.md },
  modalTitle: { fontFamily: typography.fontFamily, fontSize: 18, fontWeight: '600', color: colors.textHeading },
  modalActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  modalBtn: { flex: 1 },
});
