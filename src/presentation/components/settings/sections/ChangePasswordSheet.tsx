import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Key } from 'phosphor-react-native';
import {
  BottomSheet,
  Button,
  Checkbox,
  OtpInput,
  colors,
  spacing,
  fontFamilyForWeight,
  BOTTOM_SHEET_HEADER_GLYPH_SIZE,
  type BottomSheetPage,
} from '@atlas-ds/react-native';
import type { ChangePasswordPayload } from '../../../../domain/entities/settings_entities';
import { SETTINGS_MESSAGES } from '../../../../domain/entities/settings_entities';
import { newPasswordFormSchema } from '../../../validation/settings_schemas';
import { PasswordField } from './PasswordField';

interface ChangePasswordSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onVerifyCurrentPassword: (password: string) => Promise<{ success: boolean; message?: string }>;
  onVerifyOtp: (otp: string) => Promise<{ success: boolean; message?: string }>;
  onResendOtp: () => Promise<{ success: boolean }>;
  onSubmit: (payload: ChangePasswordPayload) => Promise<{ success: boolean; message?: string }>;
  /** Leaves the flow for the account-recovery screen. */
  onForgotPassword: () => void;
}

/** Step order, mirroring `ChangePasswordStep`. */
const CURRENT_PASSWORD = 0;
const VERIFY_OTP = 1;
const NEW_PASSWORD = 2;

/**
 * Three-step Change Password flow, matching the Figma user story:
 * current password → OTP verification → new password.
 *
 * The web build swaps the modal body between steps; here each step is a page of
 * the sheet, so moving forward glides and carries a back control. Server-side
 * failures (wrong password, wrong OTP, password reuse) surface inline.
 */
export const ChangePasswordSheet: React.FC<ChangePasswordSheetProps> = ({
  isOpen,
  onClose,
  onVerifyCurrentPassword,
  onVerifyOtp,
  onResendOtp,
  onSubmit,
  onForgotPassword,
}) => {
  const [step, setStep] = useState(CURRENT_PASSWORD);
  const [isBusy, setIsBusy] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [currentPasswordError, setCurrentPasswordError] = useState<string>();

  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState<string>();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [logoutOtherDevices, setLogoutOtherDevices] = useState(false);
  const [newPasswordError, setNewPasswordError] = useState<string>();
  const [confirmPasswordError, setConfirmPasswordError] = useState<string>();

  // Reset the whole flow whenever the sheet is reopened. Adjusting state during
  // render (rather than in an effect) avoids a cascading re-render.
  const [wasOpen, setWasOpen] = useState(isOpen);
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) {
      setStep(CURRENT_PASSWORD);
      setCurrentPassword('');
      setCurrentPasswordError(undefined);
      setOtp('');
      setOtpError(undefined);
      setNewPassword('');
      setConfirmPassword('');
      setLogoutOtherDevices(false);
      setNewPasswordError(undefined);
      setConfirmPasswordError(undefined);
    }
  }

  const handleVerifyCurrentPassword = async () => {
    setIsBusy(true);
    try {
      const result = await onVerifyCurrentPassword(currentPassword);
      if (!result.success) {
        setCurrentPasswordError(result.message ?? SETTINGS_MESSAGES.incorrectCurrentPassword);
        return;
      }
      setCurrentPasswordError(undefined);
      await onResendOtp();
      setStep(VERIFY_OTP);
    } finally {
      setIsBusy(false);
    }
  };

  const handleVerifyOtp = async () => {
    setIsBusy(true);
    try {
      const result = await onVerifyOtp(otp);
      if (!result.success) {
        setOtpError(result.message ?? SETTINGS_MESSAGES.incorrectOtp);
        return;
      }
      setOtpError(undefined);
      setStep(NEW_PASSWORD);
    } finally {
      setIsBusy(false);
    }
  };

  const handleSubmit = async () => {
    const parsed = newPasswordFormSchema.safeParse({
      newPassword,
      confirmPassword,
      logoutOtherDevices,
    });

    if (!parsed.success) {
      const issues = parsed.error.issues;
      setNewPasswordError(issues.find((issue) => issue.path[0] === 'newPassword')?.message);
      setConfirmPasswordError(issues.find((issue) => issue.path[0] === 'confirmPassword')?.message);
      return;
    }

    setNewPasswordError(undefined);
    setConfirmPasswordError(undefined);
    setIsBusy(true);

    try {
      const result = await onSubmit({
        currentPassword,
        otp,
        newPassword,
        logoutOtherDevices,
      });

      // The reuse check can only be answered by the backend.
      if (!result.success) setNewPasswordError(result.message);
    } finally {
      setIsBusy(false);
    }
  };

  const headerIcon = <Key size={BOTTOM_SHEET_HEADER_GLYPH_SIZE} color={colors.brand} />;

  const pages: BottomSheetPage[] = [
    {
      key: 'current-password',
      icon: headerIcon,
      title: 'Change Password',
      subtitle: 'Confirm it is you before setting a new password.',
      contentMinHeight: 0,
      content: (
        <View style={styles.step}>
          <Text style={styles.stepTitle}>Enter your current password</Text>
          <PasswordField
            label="Current Password"
            value={currentPassword}
            error={currentPasswordError}
            onChangeText={(value) => {
              setCurrentPassword(value);
              setCurrentPasswordError(undefined);
            }}
          />
          <View style={styles.forgotRow}>
            <Button
              label="Forgot password?"
              variant="link"
              size="sm"
              onPress={onForgotPassword}
            />
          </View>
        </View>
      ),
      primaryAction: {
        label: 'Next',
        onPress: handleVerifyCurrentPassword,
        disabled: currentPassword.length === 0 || isBusy,
      },
      secondaryAction: { label: 'Cancel', onPress: onClose },
    },
    {
      key: 'verify-otp',
      icon: headerIcon,
      title: 'Verify OTP',
      subtitle: 'Enter the 6 digit code sent to your registered number.',
      contentMinHeight: 0,
      content: (
        <View style={styles.step}>
          <OtpInput
            value={otp}
            onChange={(value) => {
              setOtp(value);
              setOtpError(undefined);
            }}
            label="Enter 6 digit OTP"
            length={6}
            error={otpError}
            onResend={onResendOtp}
          />
        </View>
      ),
      primaryAction: { label: 'Next', onPress: handleVerifyOtp, disabled: otp.length !== 6 || isBusy },
      secondaryAction: { label: 'Back', onPress: () => setStep(CURRENT_PASSWORD) },
    },
    {
      key: 'new-password',
      icon: headerIcon,
      title: 'Enter new password',
      subtitle: SETTINGS_MESSAGES.passwordRule,
      contentMinHeight: 0,
      content: (
        <View style={styles.step}>
          <PasswordField
            label="New Password"
            value={newPassword}
            error={newPasswordError}
            onChangeText={(value) => {
              setNewPassword(value);
              setNewPasswordError(undefined);
            }}
          />
          <PasswordField
            label="Confirm New Password"
            value={confirmPassword}
            error={confirmPasswordError}
            onChangeText={(value) => {
              setConfirmPassword(value);
              setConfirmPasswordError(undefined);
            }}
          />
          <Checkbox
            size="sm"
            checked={logoutOtherDevices}
            onChange={setLogoutOtherDevices}
            label="Logout of all other devices"
          />
        </View>
      ),
      primaryAction: {
        label: 'Confirm',
        onPress: handleSubmit,
        disabled: newPassword.length === 0 || confirmPassword.length === 0 || isBusy,
      },
      secondaryAction: { label: 'Cancel', onPress: onClose },
    },
  ];

  return (
    <BottomSheet
      visible={isOpen}
      onClose={onClose}
      pages={pages}
      pageIndex={step}
      // Only the OTP step can be retreated from; re-entering the new-password
      // step would need a fresh OTP anyway.
      onBack={step === VERIFY_OTP ? () => setStep(CURRENT_PASSWORD) : undefined}
      backAccessibilityLabel="Back to current password"
    />
  );
};

const styles = StyleSheet.create({
  step: { gap: spacing.md, paddingVertical: spacing.sm },
  stepTitle: {
    fontFamily: fontFamilyForWeight('500'),
    fontSize: 16,
    lineHeight: 24,
    color: colors.textHeading,
  },
  forgotRow: { alignItems: 'flex-end' },
});
