import React, { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeSlash } from 'phosphor-react-native';
import { Button, Textfield, colors, spacing } from '@atlas-ds/react-native';
import { imdSchema } from '../../validation/auth_schemas';
import type { ImdLoginData } from '../../../domain/entities/auth_entities';
import { useAuthUseCases } from '../../hooks/useAuthUseCases';
import { FallbackMessage } from './FallbackMessage';
import type { RootStackParamList } from '../../../navigation';

export const ImdLoginForm: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { loginWithImd } = useAuthUseCases();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { control, handleSubmit, formState } = useForm<ImdLoginData>({
    resolver: zodResolver(imdSchema),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    defaultValues: { imdCode: '', password: '' },
  });

  const imdValue = useWatch({ control, name: 'imdCode' });
  const passwordValue = useWatch({ control, name: 'password' });
  const isFormFilled = !!imdValue && !!passwordValue;

  const onSubmit = async (data: ImdLoginData) => {
    setServerError(null);
    // DEV-only: the real login hits the UAT backend. In debug builds, skip it so
    // the flow is walkable offline. No effect on release builds.
    if (__DEV__) {
      navigation.navigate('VerifyOtp');
      return;
    }
    const result = await loginWithImd(data);
    if (result.success) {
      navigation.navigate('VerifyOtp');
    } else {
      setServerError(result.message ?? 'Login failed. Please try again.');
    }
  };

  return (
    <View>
      <View style={styles.fields}>
        <Controller
          control={control}
          name="imdCode"
          render={({ field }) => (
            <Textfield
              label="Enter IMD code"
              value={field.value}
              onChangeText={field.onChange}
              placeholder="Enter code"
              keyboardType="email-address"
              error={formState.errors.imdCode?.message}
            />
          )}
        />

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

        <FallbackMessage message={serverError} />
      </View>

      <View style={styles.forgotRow}>
        <Button
          label="Forgot Password"
          variant="link"
          size="sm"
          onPress={() => navigation.navigate('ForgotPassword')}
        />
      </View>

      <Button
        label="Proceed"
        onPress={handleSubmit(onSubmit)}
        disabled={!isFormFilled}
        fullWidth
        style={styles.submit}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  fields: { gap: spacing.lg },
  forgotRow: { alignItems: 'flex-end', marginTop: spacing.xs },
  submit: { marginTop: spacing.lg },
});
