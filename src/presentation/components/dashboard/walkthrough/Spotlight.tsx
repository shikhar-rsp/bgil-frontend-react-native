import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { colors } from '@atlas-ds/react-native';
import type { TargetRect } from './WalkthroughContext';

interface SpotlightProps {
  rect: TargetRect;
  /** Cutout corner radius. */
  radius?: number;
  /** Tapping the dimmed area closes the tour, matching the web. */
  onPressOutside: () => void;
}

/**
 * Dim layer with a rectangular hole over the current target.
 *
 * The web draws this as an SVG `<mask>`. Four dim views around the target give
 * the same look without SVG and, more usefully, leave a genuine gap — touches
 * inside the hole reach the highlighted control instead of being swallowed by
 * an overlay that covers the whole screen.
 */
export const Spotlight: React.FC<SpotlightProps> = ({ rect, radius = 12, onPressOutside }) => {
  const right = rect.x + rect.width;
  const bottom = rect.y + rect.height;

  return (
    <>
      <Pressable
        style={[styles.dim, { top: 0, left: 0, right: 0, height: Math.max(0, rect.y) }]}
        onPress={onPressOutside}
        accessibilityRole="button"
        accessibilityLabel="Close walkthrough"
      />
      <Pressable style={[styles.dim, { top: bottom, left: 0, right: 0, bottom: 0 }]} onPress={onPressOutside} />
      <Pressable
        style={[styles.dim, { top: rect.y, left: 0, width: Math.max(0, rect.x), height: rect.height }]}
        onPress={onPressOutside}
      />
      <Pressable style={[styles.dim, { top: rect.y, left: right, right: 0, height: rect.height }]} onPress={onPressOutside} />

      {/* Ring around the hole. Non-interactive so the target stays tappable. */}
      <View
        pointerEvents="none"
        style={[
          styles.ring,
          { top: rect.y, left: rect.x, width: rect.width, height: rect.height, borderRadius: radius },
        ]}
      />
    </>
  );
};

const styles = StyleSheet.create({
  // #1A1A1A at 36%, matching the web spotlight fill.
  dim: { position: 'absolute', backgroundColor: 'rgba(26,26,26,0.36)' },
  ring: { position: 'absolute', borderWidth: 2, borderColor: colors.surface },
});
