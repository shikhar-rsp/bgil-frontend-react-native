import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PaperPlaneTilt } from 'phosphor-react-native';
import { Textfield, Button, BottomSheet, OtpInput, Toast, ToastGlobal, Card, Radio, Upload, type UploadFile, colors, spacing, radius, typography, shadow, fontFamilyForWeight } from '@atlas-ds/react-native';
import { RequiredField, RequiredLabel } from '../RequiredField';
import { MOCK_OTP } from './proposalData';

// PAN that resolves to an existing CKYC record (mock).
const KNOWN_PAN = 'ABCDE1234F';
const KNOWN_CKYC = 'CKYC00056789';

const KYC_METHODS = [
  { value: 'ekyc', label: 'EKYC' },
  { value: 'upload', label: 'Upload Documents' },
];

export type KycData = {
  pan: string;
  ckyc: string;
  aadhaar: string;
  phone: string;
  email: string;
  /** Proposal confirmation complete (OTP confirmed or proposal form uploaded). */
  verified: boolean;
  /** When no CKYC record is found, how the user chooses to complete KYC. */
  kycMethod: string;
  /** KYC complete (CKYC found, EKYC OTP confirmed, or documents uploaded). */
  kycDone: boolean;
  /** How the proposal is confirmed — 'otp' or 'upload'. */
  confirmMethod: string;
};

const CONFIRM_METHODS = [
  { value: 'otp', label: 'Through OTP' },
  { value: 'upload', label: 'Upload proposal form' },
];

interface KycDetailsStepProps {
  data: KycData;
  update: <K extends keyof KycData>(field: K, value: KycData[K]) => void;
}

export const KycDetailsStep: React.FC<KycDetailsStepProps> = ({ data, update }) => {
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [ckycStatus, setCkycStatus] = useState<'none' | 'found' | 'notfound'>(
    data.pan === KNOWN_PAN ? 'found' : data.pan.length === 10 ? 'notfound' : 'none',
  );
  const [toastVisible, setToastVisible] = useState(false);

  const onPanChange = (t: string) => {
    const pan = t.toUpperCase().slice(0, 10);
    update('pan', pan);
    if (pan === KNOWN_PAN) {
      update('ckyc', KNOWN_CKYC);
      update('kycDone', true);
      setCkycStatus('found');
      setToastVisible(true);
    } else if (pan.length === 10) {
      update('ckyc', 'NA');
      update('kycDone', false);
      setCkycStatus('notfound');
      setToastVisible(true);
    } else {
      if (data.ckyc) {
        update('ckyc', '');
      }
      update('kycDone', false);
      setCkycStatus('none');
      setToastVisible(false);
    }
  };

  const [showEkycOtp, setShowEkycOtp] = useState(false);
  const [ekycOtp, setEkycOtp] = useState('');
  const [ekycOtpError, setEkycOtpError] = useState<string | null>(null);

  // Upload-KYC documents + proposal form (mock — native file picking isn't wired).
  const [panDoc, setPanDoc] = useState<UploadFile | null>(null);
  const [addressDoc, setAddressDoc] = useState<UploadFile | null>(null);
  const [proposalDoc, setProposalDoc] = useState<UploadFile | null>(null);

  // Under the Upload KYC path, KYC is complete once both documents are attached.
  useEffect(() => {
    if (data.kycMethod !== 'upload') {
      return;
    }
    update('kycDone', !!(panDoc && addressDoc));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panDoc, addressDoc, data.kycMethod]);

  // Uploading the proposal form confirms the proposal.
  useEffect(() => {
    if (data.confirmMethod !== 'upload') {
      return;
    }
    update('verified', !!proposalDoc);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proposalDoc, data.confirmMethod]);

  const verify = () => {
    if (otp === MOCK_OTP) {
      update('verified', true);
      setShowOtp(false);
      setOtp('');
    } else {
      setOtpError(`Invalid OTP. Use ${MOCK_OTP}.`);
    }
  };

  const verifyEkyc = () => {
    if (ekycOtp === MOCK_OTP) {
      update('kycDone', true);
      setShowEkycOtp(false);
      setEkycOtp('');
    } else {
      setEkycOtpError(`Invalid OTP. Use ${MOCK_OTP}.`);
    }
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        <Text style={styles.heading}>Proposer's KYC</Text>
        <RequiredField label="PAN number">
          <Textfield value={data.pan} onChangeText={onPanChange} placeholder="Enter PAN number (ABCDE1234F)" />
        </RequiredField>
        <Textfield label="CKYC number" value={data.ckyc} onChangeText={(t) => update('ckyc', t)} placeholder="Number will be fetched" readOnly />
        {toastVisible && ckycStatus === 'found' ? (
          <Toast
            variant="success"
            title="CKYC Number found!"
            message="The proposer has already done their KYC."
            onClose={() => setToastVisible(false)}
          />
        ) : toastVisible && ckycStatus === 'notfound' ? (
          <Toast
            variant="warning"
            title="CKYC Number not found!"
            message="Please complete KYC using one of the options below."
            onClose={() => setToastVisible(false)}
          />
        ) : null}

        {ckycStatus === 'notfound' ? (
          <View style={styles.kycMethod}>
            <RequiredLabel text="How would you like to proceed for KYC?" />
            {KYC_METHODS.map((opt) => (
              <Card
                key={opt.value}
                selected={data.kycMethod === opt.value}
                onPress={() => update('kycMethod', opt.value)}
                style={styles.kycOption}
              >
                <View style={styles.kycOptionInner}>
                  <Radio selected={data.kycMethod === opt.value} onPress={() => update('kycMethod', opt.value)} />
                  <Text style={styles.kycOptionLabel}>{opt.label}</Text>
                </View>
              </Card>
            ))}
          </View>
        ) : null}

        {ckycStatus === 'notfound' && data.kycMethod === 'ekyc' ? (
          <>
            <RequiredField label="Enter Aadhaar number">
              <Textfield value={data.aadhaar} onChangeText={(t) => update('aadhaar', t.replace(/\D/g, '').slice(0, 12))} placeholder="Enter your Aadhaar Number" keyboardType="number-pad" />
            </RequiredField>
            <Button
              label="Send OTP"
              variant="secondary"
              leadingIcon={<PaperPlaneTilt size={16} color={colors.brand} />}
              disabled={data.aadhaar.length !== 12}
              onPress={() => { setShowEkycOtp(true); setEkycOtpError(null); }}
              fullWidth
            />
          </>
        ) : null}

        {ckycStatus === 'notfound' && data.kycMethod === 'upload' ? (
          <>
            <Upload
              label="Upload PAN"
              required
              hint="PDF, JPG or PNG (Max 5MB)"
              file={panDoc}
              onPickPress={() => setPanDoc({ name: 'PAN-document.pdf' })}
              onFileRemove={() => setPanDoc(null)}
            />
            <Upload
              label="Upload Proof of Address"
              required
              hint="PDF, JPG or PNG (Max 5MB)"
              file={addressDoc}
              onPickPress={() => setAddressDoc({ name: 'address-proof.pdf' })}
              onFileRemove={() => setAddressDoc(null)}
            />
          </>
        ) : null}
      </View>

      <View style={styles.card}>
        <Text style={styles.heading}>Proposal Confirmation</Text>
        <View style={styles.kycMethod}>
          <RequiredLabel text="How would you like to receive confirmation?" />
          {CONFIRM_METHODS.map((opt) => (
            <Card
              key={opt.value}
              selected={data.confirmMethod === opt.value}
              onPress={() => update('confirmMethod', opt.value)}
              style={styles.kycOption}
            >
              <View style={styles.kycOptionInner}>
                <Radio selected={data.confirmMethod === opt.value} onPress={() => update('confirmMethod', opt.value)} />
                <Text style={styles.kycOptionLabel}>{opt.label}</Text>
              </View>
            </Card>
          ))}
        </View>

        {data.confirmMethod === 'otp' ? (
          <>
            <Text style={styles.sub}>Confirm contact details to send OTP</Text>
            <RequiredField label="Phone number">
              <Textfield value={data.phone} onChangeText={(t) => update('phone', t.replace(/\D/g, '').slice(0, 10))} placeholder="+91" keyboardType="number-pad" />
            </RequiredField>
            <RequiredField label="Email ID">
              <Textfield value={data.email} onChangeText={(t) => update('email', t)} placeholder="email@example.com" keyboardType="email-address" />
            </RequiredField>
            {data.verified ? (
              <ToastGlobal variant="success" title="Proposal confirmation done." message="Verified through OTP" />
            ) : (
              <Button
                label="Send OTP"
                variant="secondary"
                leadingIcon={<PaperPlaneTilt size={16} color={colors.brand} />}
                disabled={data.phone.length !== 10 || !data.email}
                onPress={() => { setShowOtp(true); setOtpError(null); }}
                fullWidth
              />
            )}
          </>
        ) : data.confirmMethod === 'upload' ? (
          <Upload
            label="Upload Proposal Form"
            required
            hint="PDF, JPG or PNG (Max 5MB)"
            file={proposalDoc}
            onPickPress={() => setProposalDoc({ name: 'proposal-form.pdf' })}
            onFileRemove={() => setProposalDoc(null)}
          />
        ) : null}
      </View>

      <BottomSheet
        visible={showOtp}
        onClose={() => setShowOtp(false)}
        title="Confirm Proposal Through OTP"
        subtitle="Please enter the OTP sent to your phone number and email ID."
        contentMinHeight={0}
        primaryAction={{ label: 'Confirm OTP', onPress: verify, disabled: otp.length !== 6 }}
        secondaryAction={{ label: 'Cancel', onPress: () => setShowOtp(false) }}
      >
        <View style={styles.otpBlock}>
          <Text style={styles.otpLabel}>Enter 6 - digit OTP</Text>
          <OtpInput value={otp} onChange={(v) => { setOtp(v); setOtpError(null); }} length={6} error={otpError ?? undefined} />
          <Text style={styles.otpHelper}>OTP valid for 4:58 secs</Text>
        </View>
      </BottomSheet>

      <BottomSheet
        visible={showEkycOtp}
        onClose={() => setShowEkycOtp(false)}
        title="Enter OTP to complete EKYC"
        subtitle="OTP has been sent on registered mobile number"
        contentMinHeight={0}
        primaryAction={{ label: 'Confirm OTP', onPress: verifyEkyc, disabled: ekycOtp.length !== 6 }}
        secondaryAction={{ label: 'Cancel', onPress: () => setShowEkycOtp(false) }}
      >
        <View style={styles.otpBlock}>
          <Text style={styles.otpLabel}>Enter 6-digit OTP</Text>
          <OtpInput value={ekycOtp} onChange={(v) => { setEkycOtp(v); setEkycOtpError(null); }} length={6} error={ekycOtpError ?? undefined} />
          <Text style={styles.otpHelper}>OTP is sent to number linked with Aadhaar</Text>
        </View>
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, gap: spacing.md, ...shadow.lg },
  heading: { fontFamily: fontFamilyForWeight('500'), fontSize: 20, fontWeight: '500', color: colors.textHeading },
  sub: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textBody },
  kycMethod: { gap: spacing.sm },
  kycOption: { alignSelf: 'stretch' },
  kycOptionInner: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexShrink: 1 },
  kycOptionLabel: { fontFamily: typography.fontFamily, fontSize: 15, color: colors.textHeading, flexShrink: 1 },
  // The sheet supplies the title, subtitle and footer, so only the OTP field
  // and its two captions live in the content slot.
  otpBlock: { gap: spacing.sm },
  otpLabel: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textBody },
  otpHelper: { fontFamily: typography.fontFamily, fontSize: 12, color: colors.textMuted },
  verified: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  verifiedText: { fontFamily: typography.fontFamily, fontSize: 14, fontWeight: '500', color: colors.success },
});
