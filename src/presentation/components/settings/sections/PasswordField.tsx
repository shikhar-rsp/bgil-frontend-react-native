import React, { useState } from 'react';
import { Pressable } from 'react-native';
import { Eye, EyeSlash } from 'phosphor-react-native';
import { Textfield, colors } from '@atlas-ds/react-native';

interface PasswordFieldProps {
  label: string;
  value: string;
  error?: string;
  onChangeText: (value: string) => void;
}

/**
 * Masked field with a show/hide affordance — the same pairing the login form
 * uses, kept local because it is only the Change Password steps that need it.
 */
export const PasswordField: React.FC<PasswordFieldProps> = ({
  label,
  value,
  error,
  onChangeText,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <Textfield
      label={label}
      value={value}
      onChangeText={onChangeText}
      error={error}
      secureTextEntry={!isVisible}
      trailingIcon={
        <Pressable
          onPress={() => setIsVisible((visible) => !visible)}
          accessibilityRole="button"
          accessibilityLabel={isVisible ? 'Hide password' : 'Show password'}
          hitSlop={8}
        >
          {isVisible ? (
            <EyeSlash size={18} color={colors.textBody} />
          ) : (
            <Eye size={18} color={colors.textMuted} />
          )}
        </Pressable>
      }
    />
  );
};
