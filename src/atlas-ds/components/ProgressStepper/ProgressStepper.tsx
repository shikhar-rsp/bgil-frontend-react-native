import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, typography } from '../../theme';

export type StepperOrientation = 'horizontal' | 'vertical';

export interface StepperStep {
  label: string;
  description?: string;
}

export interface ProgressStepperProps {
  steps: StepperStep[];
  /** Index of the current (active) step. Steps before it are completed. */
  current: number;
  /** `horizontal` (icon above label) or `vertical` (icon left of label). Default `horizontal`. */
  orientation?: StepperOrientation;
  /** Fired when the user taps a numbered step. */
  onStepPress?: (index: number) => void;
  style?: object;
}

// Web stepper palette (accent = green #65A30D).
const GREEN = '#65A30D';
const DONE_BG = GREEN;
const DIVIDER_DONE = GREEN;
const DIVIDER_IDLE = colors.borderSubtle; // #E2E8F0

type Status = 'completed' | 'active' | 'default';

/**
 * ProgressStepper — numbered steps with connectors. Mirrors `@atlas-ds/react`
 * stepper: 28px circle icons, completed = green fill + white check, active =
 * green border + dark number, upcoming = grey border/number; connectors turn
 * green once passed. Horizontal or vertical. Full width (responsive).
 */
export const ProgressStepper: React.FC<ProgressStepperProps> = ({
  steps,
  current,
  orientation = 'horizontal',
  onStepPress,
  style,
}) => {
  const statusOf = (i: number): Status => (i < current ? 'completed' : i === current ? 'active' : 'default');
  const vertical = orientation === 'vertical';

  if (vertical) {
    return (
      <View style={[styles.vWrap, style]}>
        {steps.map((step, i) => {
          const status = statusOf(i);
          const last = i === steps.length - 1;
          return (
            <View key={i} style={styles.vRow}>
              <View style={styles.vIconCol}>
                {onStepPress ? (
                  <Pressable
                    onPress={() => onStepPress(i)}
                    style={styles.iconTapArea}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={`Go to step ${i + 1}`}
                  >
                    <StepIcon status={status} index={i} />
                  </Pressable>
                ) : (
                  <StepIcon status={status} index={i} />
                )}
                {!last ? <View style={[styles.vDivider, { backgroundColor: i < current ? DIVIDER_DONE : DIVIDER_IDLE }]} /> : null}
              </View>
              <View style={[styles.vContent, !last && styles.vContentGap]}>
                <StepText status={status} label={step.label} description={step.description} />
              </View>
            </View>
          );
        })}
      </View>
    );
  }

  return (
    <View style={[styles.hWrap, style]}>
      {steps.map((step, i) => {
        const status = statusOf(i);
        const first = i === 0;
        const last = i === steps.length - 1;
        return (
          <View key={i} style={styles.hStep}>
            <View style={styles.hIconRow}>
              <View style={[styles.hLine, { backgroundColor: first ? 'transparent' : i - 1 < current ? DIVIDER_DONE : DIVIDER_IDLE }]} />
              {onStepPress ? (
                <Pressable
                  onPress={() => onStepPress(i)}
                  style={styles.iconTapArea}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={`Go to step ${i + 1}`}
                >
                  <StepIcon status={status} index={i} />
                </Pressable>
              ) : (
                <StepIcon status={status} index={i} />
              )}
              <View style={[styles.hLine, { backgroundColor: last ? 'transparent' : i < current ? DIVIDER_DONE : DIVIDER_IDLE }]} />
            </View>
            <View style={styles.hContent}>
              <StepText status={status} label={step.label} description={step.description} centered />
            </View>
          </View>
        );
      })}
    </View>
  );
};

const StepIcon: React.FC<{ status: Status; index: number }> = ({ status, index }) => {
  if (status === 'completed') {
    return (
      <View style={[styles.icon, { backgroundColor: DONE_BG, borderColor: DONE_BG }]}>
        <View style={styles.check} />
      </View>
    );
  }
  const active = status === 'active';
  return (
    <View style={[styles.icon, { backgroundColor: '#FFFFFF', borderColor: active ? GREEN : colors.borderSubtle }]}>
      <Text style={[styles.iconText, { color: active ? colors.textHeading : colors.textMuted }]}>{index + 1}</Text>
    </View>
  );
};

const StepText: React.FC<{ status: Status; label: string; description?: string; centered?: boolean }> = ({
  status,
  label,
  description,
  centered,
}) => {
  const labelColor = status === 'default' ? colors.textMuted : colors.textHeading;
  return (
    <View style={[styles.textCol, centered && styles.textCentered]}>
      <Text style={[styles.label, { color: labelColor }]} numberOfLines={1}>
        {label}
      </Text>
      {description ? (
        <Text style={[styles.desc, centered && styles.textCentered]} numberOfLines={2}>
          {description}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  // Icon — 28px circle, 1px border, 14/400.
  icon: { width: 28, height: 28, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  iconText: { fontFamily: typography.fontFamily, fontSize: 14, lineHeight: 20, fontWeight: '400' },
  check: { width: 6, height: 11, borderRightWidth: 2, borderBottomWidth: 2, borderColor: '#FFFFFF', transform: [{ rotate: '45deg' }], marginTop: -2 },
  textCol: { gap: 2 },
  textCentered: { alignItems: 'center', textAlign: 'center' },
  label: { fontFamily: typography.fontFamily, fontSize: 14, lineHeight: 20, fontWeight: '400' },
  desc: { fontFamily: typography.fontFamily, fontSize: 14, lineHeight: 20, fontWeight: '400', color: colors.textMuted },

  // Horizontal
  hWrap: { flexDirection: 'row', alignSelf: 'stretch' },
  hStep: { flex: 1, alignItems: 'center' },
  hIconRow: { flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch' },
  hLine: { flex: 1, height: 1 },
  hContent: { marginTop: 8, alignItems: 'center', paddingHorizontal: 4 },

  // Vertical
  vWrap: { alignSelf: 'stretch' },
  vRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  vIconCol: { alignItems: 'center', alignSelf: 'stretch' },
  vDivider: { width: 1, flex: 1, minHeight: 28, marginVertical: 4 },
  vContent: { flex: 1, paddingTop: 4 },
  vContentGap: { paddingBottom: 20 },
  iconTapArea: { alignItems: 'center', justifyContent: 'center' },
});
