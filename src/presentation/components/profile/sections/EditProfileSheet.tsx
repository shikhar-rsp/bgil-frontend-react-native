import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PencilSimpleLine } from 'phosphor-react-native';
import {
  BottomSheet,
  DatePicker,
  Dropdown,
  TextArea,
  Textfield,
  colors,
  spacing,
  BOTTOM_SHEET_HEADER_GLYPH_SIZE,
} from '@atlas-ds/react-native';
import type { AgentProfile, EditableProfileData } from '../../../../domain/entities/profile_entities';
import { editProfileSchema, type EditProfileFormValues } from '../../../validation/profile_schemas';
import { GENDER_OPTIONS, MARITAL_STATUS_OPTIONS } from '../constants';
import { SectionHeading } from './ProfileDetailsSection';

interface EditProfileSheetProps {
  isOpen: boolean;
  profile: AgentProfile;
  onClose: () => void;
  onSubmit: (data: EditableProfileData) => Promise<void>;
}

const toFormValues = (profile: AgentProfile): EditProfileFormValues => ({
  fullName: profile.personal.fullName,
  gender: profile.personal.gender,
  dateOfBirth: profile.personal.dateOfBirth,
  maritalStatus: profile.personal.maritalStatus,
  emailId: profile.contact.emailId,
  mobileNumber: profile.contact.mobileNumber,
  whatsappNumber: profile.contact.whatsappNumber,
  pincode: profile.address.pincode,
  state: profile.address.state,
  city: profile.address.city,
  address: profile.address.address,
});

const toOptions = (values: string[]) => values.map((value) => ({ label: value, value }));

// The form stores the DOB as a DD/MM/YYYY string; the Atlas DatePicker works in
// Date objects, so convert at the field boundary.
const parseDMY = (value: string): Date | null => {
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value ?? '');
  if (!match) return null;
  const [, d, m, y] = match;
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDMY = (date: Date): string => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
};

/**
 * Keeps a stored value selectable even when it is not part of the canonical option
 * list — otherwise the field silently coerces to the first option and the saved
 * value is lost. Guards against legacy/API values such as "Un-Married".
 */
const withCurrentValue = (options: string[], value: string) =>
  value && !options.includes(value) ? [value, ...options] : options;

/** Edit Profile — the web modal, rendered as a bottom sheet on native. */
export const EditProfileSheet: React.FC<EditProfileSheetProps> = ({
  isOpen,
  profile,
  onClose,
  onSubmit,
}) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<EditProfileFormValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: toFormValues(profile),
    mode: 'onChange',
  });

  // Re-seed the form whenever the sheet is reopened so a cancelled edit is discarded.
  useEffect(() => {
    if (isOpen) {
      reset(toFormValues(profile));
    }
  }, [isOpen, profile, reset]);

  const genderOptions = useMemo(
    () => withCurrentValue(GENDER_OPTIONS, profile.personal.gender),
    [profile.personal.gender]
  );

  const maritalStatusOptions = useMemo(
    () => withCurrentValue(MARITAL_STATUS_OPTIONS, profile.personal.maritalStatus),
    [profile.personal.maritalStatus]
  );

  const submit = handleSubmit(async (values) => {
    await onSubmit(values);
  });

  return (
    <BottomSheet
      visible={isOpen}
      onClose={onClose}
      icon={
        <PencilSimpleLine size={BOTTOM_SHEET_HEADER_GLYPH_SIZE} color={colors.brand} />
      }
      title="Edit Profile"
      subtitle="Update your personal, contact and address details."
      primaryAction={{
        label: 'Update',
        onPress: submit,
        disabled: !isDirty || isSubmitting,
      }}
      secondaryAction={{ label: 'Cancel', onPress: onClose }}
    >
      <View style={styles.form}>
        <SectionHeading title="Personal Information" />

        <Controller
          control={control}
          name="fullName"
          render={({ field }) => (
            <Textfield
              label="Full Name"
              value={field.value}
              onChangeText={field.onChange}
              error={errors.fullName?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="gender"
          render={({ field }) => (
            <Dropdown
              label="Gender"
              placeholder="Select gender"
              options={toOptions(genderOptions)}
              value={field.value}
              onChange={field.onChange}
              error={!!errors.gender}
              hint={errors.gender?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="dateOfBirth"
          render={({ field }) => (
            <DatePicker
              label="Date of Birth"
              value={parseDMY(field.value)}
              onChange={(date) => field.onChange(date ? formatDMY(date) : '')}
              error={errors.dateOfBirth?.message}
              sheetTitle="Date of Birth"
            />
          )}
        />

        <Controller
          control={control}
          name="maritalStatus"
          render={({ field }) => (
            <Dropdown
              label="Marital Status"
              placeholder="Select marital status"
              options={toOptions(maritalStatusOptions)}
              value={field.value}
              onChange={field.onChange}
              error={!!errors.maritalStatus}
              hint={errors.maritalStatus?.message}
            />
          )}
        />

        <SectionHeading title="Contact Information" />

        <Controller
          control={control}
          name="emailId"
          render={({ field }) => (
            <Textfield
              label="Email ID"
              value={field.value}
              onChangeText={field.onChange}
              keyboardType="email-address"
              error={errors.emailId?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="mobileNumber"
          render={({ field }) => (
            <Textfield
              label="Mobile Number"
              value={field.value}
              onChangeText={field.onChange}
              keyboardType="phone-pad"
              error={errors.mobileNumber?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="whatsappNumber"
          render={({ field }) => (
            <Textfield
              label="Whatsapp Number"
              value={field.value}
              onChangeText={field.onChange}
              keyboardType="phone-pad"
              error={errors.whatsappNumber?.message}
            />
          )}
        />

        <SectionHeading title="Address" />

        <Controller
          control={control}
          name="pincode"
          render={({ field }) => (
            <Textfield
              label="Pincode"
              value={field.value}
              onChangeText={field.onChange}
              keyboardType="number-pad"
              error={errors.pincode?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="state"
          render={({ field }) => (
            <Textfield
              label="State"
              value={field.value}
              onChangeText={field.onChange}
              error={errors.state?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="city"
          render={({ field }) => (
            <Textfield
              label="City"
              value={field.value}
              onChangeText={field.onChange}
              error={errors.city?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="address"
          render={({ field }) => (
            <TextArea
              label="Address"
              rows={3}
              value={field.value}
              onChangeText={field.onChange}
              error={errors.address?.message}
            />
          )}
        />
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  form: { gap: spacing.lg, paddingBottom: spacing.sm },
});
