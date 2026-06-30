import React from 'react';
import { View, Text, Modal, StyleSheet } from 'react-native';
import { Spinner, colors, typography, radius, spacing } from '@atlas-ds/react-native';
import { useLoader } from '../../context/LoaderContext';

/**
 * Global blocking loader overlay. The web version was a fixed full-screen
 * scrim + spinner; here it's a transparent RN `Modal` so it sits above the
 * whole navigation tree. Driven by `LoaderContext`.
 */
export const Loader: React.FC = () => {
  const { isLoading } = useLoader();

  return (
    <Modal visible={isLoading} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.scrim} accessibilityLabel="Loading" accessibilityRole="progressbar">
        <View style={styles.card}>
          <Spinner size={40} color="brand" />
          <Text style={styles.label}>Please wait…</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  card: {
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: colors.surface,
    paddingHorizontal: 40,
    paddingVertical: 32,
    borderRadius: radius.xl,
  },
  label: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: '500',
    color: colors.textBody,
  },
});
