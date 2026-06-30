import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { colors, typography } from '@atlas-ds/react-native';

type FallbackMessageProps = {
  message?: string | null;
  variant?: 'error' | 'info';
};

/** Inline error/info line. Renders nothing when there is no message. */
export const FallbackMessage: React.FC<FallbackMessageProps> = ({
  message,
  variant = 'error',
}) => {
  if (!message) {
    return null;
  }

  return (
    <Text
      accessibilityRole={variant === 'error' ? 'alert' : 'text'}
      style={[styles.base, variant === 'error' ? styles.error : styles.info]}
    >
      {message}
    </Text>
  );
};

const styles = StyleSheet.create({
  base: {
    fontFamily: typography.fontFamily,
    fontSize: 13,
    marginTop: 6,
  },
  error: { color: colors.dangerText },
  info: { color: colors.success },
});
