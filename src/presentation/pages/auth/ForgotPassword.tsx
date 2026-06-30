import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Textfield, spacing } from '@atlas-ds/react-native';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { AuthHeader } from '../../components/auth/AuthHeader';
import { forgotPasswordSchema } from '../../validation/auth_schemas';
import type { ForgotPasswordData } from '../../../domain/entities/auth_entities';
import { useAuthUseCases } from '../../hooks/useAuthUseCases';
import type { AuthScreenProps } from '../../../navigation';

export const ForgotPassword: React.FC<AuthScreenProps<'ForgotPassword'>> = ({ navigation }) => {
  const { generateOtp } = useAuthUseCases();
  const { control, handleSubmit, formState } = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onSubmit',
  });

  const onSubmit = async (data: ForgotPasswordData) => {
    const result = await generateOtp(data);
    if (result.success) {
      navigation.navigate('VerifyOtp', { recovery: true });
    }
  };

  return (
    <AuthLayout>
      <AuthHeader title="Enter Email ID" onBack={() => navigation.navigate('AgentLogin')} />

      <View style={styles.form}>
        <Controller
          control={control}
          name="email"
          render={({ field }) => (
            <Textfield
              label="Enter Email ID"
              value={field.value}
              onChangeText={field.onChange}
              placeholder="example@email.com"
              keyboardType="email-address"
              error={formState.errors.email?.message}
            />
          )}
        />

        <View style={styles.actions}>
          <Button label="Generate OTP" onPress={handleSubmit(onSubmit)} fullWidth />
          <Button
            label="Back to Login"
            variant="secondaryGray"
            onPress={() => navigation.navigate('AgentLogin')}
            fullWidth
          />
        </View>
      </View>
    </AuthLayout>
  );
};

const styles = StyleSheet.create({
  form: { marginTop: spacing.xl },
  actions: { gap: spacing.lg, marginTop: spacing.xxl },
});
