import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SegmentedControl, colors, spacing, typography } from '@atlas-ds/react-native';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { AuthHeader } from '../../components/auth/AuthHeader';
import { ImdLoginForm } from '../../components/auth/ImdLoginForm';
import { MobileLoginForm } from '../../components/auth/MobileLoginForm';
import type { AuthScreenProps } from '../../../navigation';

export const AgentLogin: React.FC<AuthScreenProps<'AgentLogin'>> = ({ navigation }) => {
  const [loginMethod, setLoginMethod] = useState<'imd' | 'mobile'>('imd');

  return (
    <AuthLayout>
      <AuthHeader title="Enter Login Details" onBack={() => navigation.navigate('DesignationSelect')} />

      <Text style={styles.prompt}>How would you like to login?</Text>
      <SegmentedControl
        value={loginMethod}
        onChange={(val) => setLoginMethod(val as 'imd' | 'mobile')}
        options={[
          { value: 'imd', label: 'IMD Code' },
          { value: 'mobile', label: 'Mobile Number' },
        ]}
      />

      <View style={styles.form}>
        {loginMethod === 'imd' ? <ImdLoginForm /> : <MobileLoginForm />}
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
  prompt: {
    fontFamily: typography.fontFamily,
    fontSize: 15,
    color: colors.textBody,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  form: { marginTop: spacing.xl },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  footerText: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    color: colors.textBody,
  },
  footerLink: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    color: colors.brandPressed,
  },
});
