import React from 'react';
import { View, Modal, Pressable, StyleSheet } from 'react-native';
import { Play } from 'phosphor-react-native';
import { colors, spacing, radius } from '@atlas-ds/react-native';

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Fullscreen walkthrough video.
 *
 * Like the web original this is a placeholder — there is no source asset in
 * either repo, and the centre play button simply closes. Playing real video
 * needs `react-native-video` plus a native rebuild (Expo's `expo-av` is off
 * limits here); drop the player into the box below when an asset exists.
 *
 * The web overlay uses `backdrop-blur`, which has no React Native equivalent
 * without a native blur module, so this uses a plain translucent scrim.
 */
export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({ isOpen, onClose }) => (
  <Modal visible={isOpen} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
    {/* Backdrop tap closes, matching the web. */}
    <Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close video">
      <Pressable style={styles.stage} onPress={onClose}>
        <View style={styles.playButton}>
          <Play size={40} color={colors.textOnBrand} weight="fill" />
        </View>
      </Pressable>
    </Pressable>
  </Modal>
);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  // 1430:661 in the web layout — the same ratio, sized to the viewport here.
  // Near-black letterbox is a one-off video surface, not a themed colour.
  stage: {
    width: '100%',
    aspectRatio: 1430 / 661,
    backgroundColor: '#0B0B0B',
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
