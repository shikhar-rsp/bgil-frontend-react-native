import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeSlash } from 'phosphor-react-native';
import { Button, Textfield, colors, spacing, typography } from '@atlas-ds/react-native';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { AuthHeader } from '../../components/auth/AuthHeader';
import type { AuthScreenProps } from '../../../navigation';

const rmLoginSchema = z.object({
  employeeCode: z.string().min(4, 'Employee code must be at least 4 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type RmLoginFormValues = z.infer<typeof rmLoginSchema>;

export const RmLogin: React.FC<AuthScreenProps<'RmLogin'>> = ({ navigation }) => {
  const [showPassword, setShowPassword] = useState(false);
  const { control, handleSubmit, formState } = useForm<RmLoginFormValues>({
    resolver: zodResolver(rmLoginSchema),
    mode: 'onSubmit',
  });

  const onSubmit = (data: RmLoginFormValues) => {
    console.log('RM Login Submitted:', data);
    navigation.navigate('VerifyOtp', { persona: 'rm' });
  };

  return (
    <AuthLayout>
      <AuthHeader title="Enter Login Details" onBack={() => navigation.navigate('DesignationSelect')} />

      <View style={styles.fields}>
        <Controller
          control={control}
          name="employeeCode"
          render={({ field }) => (
            <Textfield
              label="Enter Employee Code"
              value={field.value}
              onChangeText={field.onChange}
              placeholder="Enter Code"
              error={formState.errors.employeeCode?.message}
            />
          )}
        />

        <View>
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <Textfield
                label="Enter Password"
                value={field.value}
                onChangeText={field.onChange}
                placeholder="**************"
                secureTextEntry={!showPassword}
                error={formState.errors.password?.message}
                trailingIcon={
                  <Pressable
                    onPress={() => setShowPassword((prev) => !prev)}
                    accessibilityRole="button"
                    accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                    hitSlop={8}
                  >
                    {showPassword ? (
                      <EyeSlash size={18} color={colors.textBody} />
                    ) : (
                      <Eye size={18} color={colors.textMuted} />
                    )}
                  </Pressable>
                }
              />
            )}
          />
          <View style={styles.forgotRow}>
            <Button
              label="Forgot password?"
              variant="link"
              size="sm"
              onPress={() => navigation.navigate('ForgotPassword')}
            />
          </View>
        </View>
      </View>

      <Button label="Proceed" onPress={handleSubmit(onSubmit)} fullWidth style={styles.submit} />

      <View style={styles.footer}>
        <Text style={styles.footerText}>Can't login? </Text>
        <Pressable
          onPress={() => navigation.navigate('GetHelp', { persona: 'rm' })}
          accessibilityRole="button"
        >
          <Text style={styles.footerLink}>Get Help</Text>
        </Pressable>
      </View>
    </AuthLayout>
  );
};

const styles = StyleSheet.create({
  fields: { gap: spacing.lg, marginTop: spacing.xl },
  forgotRow: { alignItems: 'flex-end', marginTop: spacing.xs },
  submit: { marginTop: spacing.xl },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg },
  footerText: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textBody },
  footerLink: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.brandPressed },
});
