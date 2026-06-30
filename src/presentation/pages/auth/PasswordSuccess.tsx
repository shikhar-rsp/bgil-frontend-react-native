import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CheckCircle } from 'phosphor-react-native';
import { Button, colors, spacing, typography } from '@atlas-ds/react-native';
import { AuthLayout } from '../../components/auth/AuthLayout';
import type { AuthScreenProps } from '../../../navigation';

export const PasswordSuccess: React.FC<AuthScreenProps<'PasswordSuccess'>> = ({ navigation }) => (
  <AuthLayout showBanner={false}>
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <CheckCircle size={56} color={colors.success} weight="fill" />
      </View>

      <Text style={styles.title}>{'Password Changed\nSuccessfully!'}</Text>

      <Button
        label="Back to Login"
        onPress={() => navigation.navigate('DesignationSelect')}
        fullWidth
        style={styles.button}
      />
    </View>
  </AuthLayout>
);

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECFDF5',
    marginBottom: spacing.lg,
  },
  title: {
    fontFamily: typography.fontFamily,
    fontSize: 30,
    fontWeight: '600',
    lineHeight: 38,
    textAlign: 'center',
    color: colors.textHeading,
    marginBottom: spacing.xxl,
  },
  button: { width: '100%' },
});
