import React from 'react';
import { View, Text, Modal, Pressable, StyleSheet } from 'react-native';
import { Play } from 'phosphor-react-native';
import { Button, colors, spacing, radius, typography } from '@atlas-ds/react-native';

interface ObboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartWalkthrough: () => void;
}

/** Welcome / intro modal shown on first dashboard load. */
export const ObboardingModal: React.FC<ObboardingModalProps> = ({
  isOpen,
  onClose,
  onStartWalkthrough,
}) => (
  <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
    <View style={styles.scrim}>
      <View style={styles.card}>
        <View style={styles.video}>
          <View style={styles.playButton}>
            <Play size={40} color={colors.textOnBrand} weight="fill" />
          </View>
          <Text style={styles.duration}>40 secs</Text>
        </View>

        <View style={styles.textBlock}>
          <Text style={styles.title}>Welcome Aboard! 🎉</Text>
          <Text style={styles.body}>
            This tour will guide you through the key features and functionalities we offer, ensuring
            you have a smooth and successful start.
          </Text>
        </View>

        <View style={styles.actions}>
          <Button label="Skip for now" variant="secondary" onPress={onClose} style={styles.actionBtn} />
          <Button label="Start Walkthrough" onPress={onStartWalkthrough} style={styles.actionBtn} />
        </View>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.xl,
  },
  video: {
    aspectRatio: 16 / 10,
    backgroundColor: '#003460',
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  duration: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.lg,
    fontFamily: typography.fontFamily,
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  textBlock: { alignItems: 'center', gap: spacing.sm },
  title: { fontFamily: typography.fontFamily, fontSize: 26, fontWeight: '600', color: colors.textHeading },
  body: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textBody, textAlign: 'center' },
  actions: { flexDirection: 'row', gap: spacing.md },
  actionBtn: { flex: 1 },
});
