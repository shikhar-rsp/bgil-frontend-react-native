import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Button, OtpInput, colors, spacing, typography } from '@atlas-ds/react-native';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { AuthHeader } from '../../components/auth/AuthHeader';
import { useAuthUseCases } from '../../hooks/useAuthUseCases';
import type { AuthScreenProps } from '../../../navigation';

const OTP_SECONDS = 119; // 1:59

export const VerifyOtp: React.FC<AuthScreenProps<'VerifyOtp'>> = ({ navigation, route }) => {
  const isRecovery = route.params?.recovery === true;
  const persona = route.params?.persona ?? 'agent';
  const { verifyOtp } = useAuthUseCases();
  const [otpValue, setOtpValue] = useState('');
  const [timeLeft, setTimeLeft] = useState(OTP_SECONDS);

  useEffect(() => {
    if (timeLeft <= 0) {
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleResend = () => setTimeLeft(OTP_SECONDS);

  const goNext = () => {
    if (isRecovery) {
      navigation.navigate('ResetPassword');
    } else {
      navigation.navigate(persona === 'rm' ? 'RMDashboard' : 'Dashboard');
    }
  };

  const handleSubmit = async () => {
    // DEV-only: skip OTP verification against the UAT backend so the flow is
    // walkable offline in debug builds. No effect on release builds.
    if (__DEV__) {
      goNext();
      return;
    }
    const result = await verifyOtp(otpValue, isRecovery);
    if (result.success) {
      goNext();
    }
  };

  return (
    <AuthLayout>
      <AuthHeader
        title="Verify OTP"
        subtitle="We've sent a 6-digit verification code to your registered mobile number ending with ****8765"
        onBack={() => navigation.navigate('AgentLogin')}
      />

      <View style={styles.form}>
        <OtpInput
          value={otpValue}
          onChange={setOtpValue}
          label="Enter 6 digit OTP"
          length={6}
          helper={timeLeft > 0 ? `Code expires in ${formatTime(timeLeft)} mins` : 'Code expired'}
          onResend={handleResend}
        />

        <Button
          label="Submit"
          onPress={handleSubmit}
          disabled={otpValue.length !== 6}
          fullWidth
          style={styles.submit}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Can't login? </Text>
        <Pressable
          onPress={() => navigation.navigate('GetHelp', { persona: 'agent' })}
          accessibilityRole="button"
        >
          <Text style={styles.footerLink}>Get Help</Text>
        </Pressable>
      </View>
    </AuthLayout>
  );
};

const styles = StyleSheet.create({
  form: { marginTop: spacing.xl },
  submit: { marginTop: spacing.xl },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg },
  footerText: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textBody },
  footerLink: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.brandPressed },
});
