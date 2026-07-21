import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { CaretLeft } from 'phosphor-react-native';
import { colors, spacing, typography, fontFamilyForWeight } from '@atlas-ds/react-native';

type AuthHeaderProps = {
  title: string;
  subtitle?: string;
  /** Show the back chevron and fire this on press. */
  onBack?: () => void;
};

/** Back chevron + centered title/subtitle used across the auth screens. */
export const AuthHeader: React.FC<AuthHeaderProps> = ({ title, subtitle, onBack }) => (
  <View>
    {onBack ? (
      <Pressable
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="Back"
        style={styles.back}
        hitSlop={8}
      >
        <CaretLeft size={16} color={colors.textBody} weight="bold" />
        <Text style={styles.backText}>Back</Text>
      </Pressable>
    ) : null}

    <Text style={styles.title}>{title}</Text>
    {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xl,
  },
  backText: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    color: colors.textBody,
  },
  title: {
    fontFamily: fontFamilyForWeight('600'),
    fontSize: 28,
    color: colors.textHeading,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: typography.fontFamily,
    fontSize: 16,
    color: colors.textBody,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
