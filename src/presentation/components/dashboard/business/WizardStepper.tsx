import React, { useEffect, useRef, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { ProgressStepper, colors, spacing, radius, shadow } from '@atlas-ds/react-native';

/** Width reserved per step before the row starts scrolling. */
export const STEP_WIDTH = 120;

interface WizardStepperProps {
  steps: { label: string }[];
  /** Index of the current (active) step. */
  current: number;
  /** Fired when a step is tapped. Omit to make the row read-only. */
  onStepPress?: (index: number) => void;
}

/**
 * The quote/renewal wizards' progress row.
 *
 * A phone can show three or four steps at a time, so the row scrolls sideways
 * rather than compressing every label to nothing. It also follows the flow:
 * advancing past the visible steps used to leave the active one off-screen
 * until the user scrolled to find it, so the row now centres itself on the
 * current step whenever it changes.
 */
export const WizardStepper: React.FC<WizardStepperProps> = ({ steps, current, onStepPress }) => {
  const scrollRef = useRef<ScrollView>(null);
  const [viewport, setViewport] = useState(0);

  const contentWidth = Math.max(viewport, steps.length * STEP_WIDTH);

  useEffect(() => {
    // Nothing to centre on until the row has been measured, and no point
    // scrolling a row that already fits.
    if (viewport === 0 || contentWidth <= viewport) {
      return;
    }
    const stepCentre = current * STEP_WIDTH + STEP_WIDTH / 2;
    const x = Math.max(0, Math.min(stepCentre - viewport / 2, contentWidth - viewport));
    scrollRef.current?.scrollTo({ x, animated: true });
  }, [current, viewport, contentWidth]);

  return (
    <View style={styles.card}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        onLayout={(e) => setViewport(e.nativeEvent.layout.width)}
      >
        <ProgressStepper
          steps={steps}
          current={current}
          onStepPress={onStepPress}
          style={{ width: contentWidth }}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    ...shadow.lg,
  },
});
