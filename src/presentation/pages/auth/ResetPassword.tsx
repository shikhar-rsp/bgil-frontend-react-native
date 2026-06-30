import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check } from 'phosphor-react-native';
import { Button, Textfield, colors, spacing, typography } from '@atlas-ds/react-native';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { AuthHeader } from '../../components/auth/AuthHeader';
import { resetPasswordSchema } from '../../validation/auth_schemas';
import type { ResetPasswordData } from '../../../domain/entities/auth_entities';
import { useAuthUseCases } from '../../hooks/useAuthUseCases';
import type { AuthScreenProps } from '../../../navigation';

export const ResetPassword: React.FC<AuthScreenProps<'ResetPassword'>> = ({ navigation }) => {
  const { resetPassword } = useAuthUseCases();
  const { control, handleSubmit, formState } = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onChange',
  });

  const passwordValue = useWatch({ control, name: 'password', defaultValue: '' });

  const requirements = [
    { label: 'At least one lowercase letter', met: /[a-z]/.test(passwordValue) },
    { label: 'Minimum 8 Characters', met: passwordValue.length >= 8 },
    { label: 'At least one uppercase letter', met: /[A-Z]/.test(passwordValue) },
    { label: 'At least one number', met: /[0-9]/.test(passwordValue) },
  ];

  const hasInput = passwordValue.length > 0;
  const toneFor = (met: boolean) =>
    met ? colors.success : hasInput ? colors.dangerText : colors.textBody;

  const onSubmit = async (data: ResetPasswordData) => {
    const result = await resetPassword(data);
    if (result.success) {
      navigation.navigate('PasswordSuccess');
    }
  };

  return (
    <AuthLayout>
      <AuthHeader title="Enter New Password" />

      <View style={styles.form}>
        <View style={styles.block}>
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <Textfield
                label="Enter New Password"
                value={field.value}
                onChangeText={field.onChange}
                placeholder="Enter New password"
                secureTextEntry
                error={formState.errors.password?.message}
              />
            )}
          />

          <View style={styles.requirements}>
            {requirements.map((req) => (
              <View key={req.label} style={styles.requirementRow}>
                <Check size={16} weight="bold" color={toneFor(req.met)} />
                <Text style={[styles.requirementLabel, { color: toneFor(req.met) }]}>
                  {req.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field }) => (
            <Textfield
              label="Confirm New Password"
              value={field.value}
              onChangeText={field.onChange}
              placeholder="Enter New password"
              secureTextEntry
              error={formState.errors.confirmPassword?.message}
            />
          )}
        />

        <View style={styles.actions}>
          <Button
            label="Reset Password"
            onPress={handleSubmit(onSubmit)}
            disabled={!formState.isValid}
            fullWidth
          />
          <Button
            label="Back to login"
            variant="secondaryGray"
            onPress={() => navigation.navigate('DesignationSelect')}
            fullWidth
          />
        </View>
      </View>
    </AuthLayout>
  );
};

const styles = StyleSheet.create({
  form: { marginTop: spacing.xl, gap: spacing.xxl },
  block: { gap: spacing.lg },
  requirements: { gap: spacing.sm, paddingLeft: spacing.xs },
  requirementRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  requirementLabel: { fontFamily: typography.fontFamily, fontSize: 14 },
  actions: { gap: spacing.lg },
});
