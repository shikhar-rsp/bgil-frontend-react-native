import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Textfield, spacing } from '@atlas-ds/react-native';
import { mobileSchema } from '../../validation/auth_schemas';
import type { MobileLoginData } from '../../../domain/entities/auth_entities';
import { useAuthUseCases } from '../../hooks/useAuthUseCases';
import { FallbackMessage } from './FallbackMessage';
import { ENV } from '../../../config/env';
import { resolveMockRoleByMobile } from '../../../infrastructure/mockAuth';
import type { RootStackParamList } from '../../../navigation';

export const MobileLoginForm: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { loginWithMobile } = useAuthUseCases();
  const [serverError, setServerError] = useState<string | null>(null);
  const { control, handleSubmit, formState } = useForm<MobileLoginData>({
    resolver: zodResolver(mobileSchema),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    defaultValues: { mobileNumber: '' },
  });

  const mobileValue = useWatch({ control, name: 'mobileNumber' });
  const isFormFilled = mobileValue?.length === 10;

  const onSubmit = async (data: MobileLoginData) => {
    setServerError(null);
    // QC/demo mode: resolve the role from the local mock mobile numbers.
    if (ENV.MOCK_AUTH) {
      const role = resolveMockRoleByMobile(data.mobileNumber, ['agent', 'trainee']);
      if (role) {
        navigation.navigate('VerifyOtp', { role });
      } else {
        setServerError('This mobile number is not registered.');
      }
      return;
    }
    const result = await loginWithMobile(data);
    if (result.success) {
      navigation.navigate('VerifyOtp');
    }
  };

  return (
    <View>
      <Controller
        control={control}
        name="mobileNumber"
        render={({ field }) => (
          <Textfield
            label="Enter Mobile Number"
            value={field.value}
            onChangeText={(text) => field.onChange(text.replace(/[^0-9]/g, '').slice(0, 10))}
            placeholder="+91-"
            keyboardType="number-pad"
            error={formState.errors.mobileNumber?.message}
          />
        )}
      />

      <FallbackMessage message={serverError} />

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
  submit: { marginTop: spacing.xl },
});
