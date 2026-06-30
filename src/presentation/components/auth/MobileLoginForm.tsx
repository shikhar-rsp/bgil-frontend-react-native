import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Textfield, spacing } from '@atlas-ds/react-native';
import { mobileSchema } from '../../validation/auth_schemas';
import type { MobileLoginData } from '../../../domain/entities/auth_entities';
import { useAuthUseCases } from '../../hooks/useAuthUseCases';
import type { RootStackParamList } from '../../../navigation';

export const MobileLoginForm: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { loginWithMobile } = useAuthUseCases();
  const { control, handleSubmit, formState } = useForm<MobileLoginData>({
    resolver: zodResolver(mobileSchema),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    defaultValues: { mobileNumber: '' },
  });

  const mobileValue = useWatch({ control, name: 'mobileNumber' });
  const isFormFilled = mobileValue?.length === 10;

  const onSubmit = async (data: MobileLoginData) => {
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
