import React from 'react';
import { View, Text, Modal, StyleSheet } from 'react-native';
import { WarningCircle } from 'phosphor-react-native';
import { Button, colors, spacing, radius, typography } from '@atlas-ds/react-native';

interface SkipAddOnsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSkipAndProceed: () => void;
}

export const SkipAddOnsModal: React.FC<SkipAddOnsModalProps> = ({ isOpen, onClose, onSkipAndProceed }) => (
  <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
    <View style={styles.scrim}>
      <View style={styles.card}>
        <WarningCircle size={28} color={colors.warning} />
        <Text style={styles.title}>Continue without add-ons?</Text>
        <Text style={styles.body}>
          You haven't selected any add-ons. However, they can be selected at the proposal stage as well. Do you want to
          continue without them?
        </Text>
        <View style={styles.actions}>
          <Button label="Go back to select" variant="secondaryGray" onPress={onClose} style={styles.btn} />
          <Button
            label="Skip and move to next step"
            onPress={() => {
              onSkipAndProceed();
              onClose();
            }}
            style={styles.btn}
          />
        </View>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  scrim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  card: { width: '100%', maxWidth: 460, backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.xl, gap: spacing.md, alignItems: 'center' },
  title: { fontFamily: typography.fontFamily, fontSize: 18, fontWeight: '600', color: colors.textHeading, textAlign: 'center' },
  body: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textBody, textAlign: 'center' },
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  btn: { flex: 1 },
});
