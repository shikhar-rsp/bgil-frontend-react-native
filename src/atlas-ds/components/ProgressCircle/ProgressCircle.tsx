import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography } from '../../theme';

// Web --progress-circle-fill-color is fixed green; no colour variants.
const FILL = '#65A30D';

export interface ProgressCircleProps {
  /** Progress 0–100. */
  value: number;
  /** Diameter in px. Default 88. */
  size?: number;
  /** Ring thickness in px. Default 8. */
  strokeWidth?: number;
  /** Show the "NN%" label in the centre. Default true. */
  showLabel?: boolean;
  style?: object;
}

/**
 * ProgressCircle — a determinate circular progress ring drawn without
 * `react-native-svg` (two rotating half-rings + a centre hole). Mirrors
 * `@atlas-ds/react` `<ProgressCircle>`.
 */
export const ProgressCircle: React.FC<ProgressCircleProps> = ({
  value,
  size = 88,
  strokeWidth = 8,
  showLabel = true,
  style,
}) => {
  const pct = Math.max(0, Math.min(100, value));
  const ring = FILL;
  const track = colors.borderSubtle; // web --progress-circle-track-color #E2E8F0
  const half = size / 2;

  // Each half-ring is a full circle showing only its top+right quarters
  // (a right-side semicircle), clipped to one half and rotated.
  // Right half draws 0–50%, left half draws 50–100%.
  const rightDeg = pct <= 50 ? (pct / 50) * 180 : 180;
  const leftDeg = pct <= 50 ? 0 : ((pct - 50) / 50) * 180;

  const halfRing = (rotate: number) => ({
    width: size,
    height: size,
    borderRadius: half,
    borderWidth: strokeWidth,
    borderTopColor: ring,
    borderRightColor: ring,
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
    transform: [{ rotate: `${rotate - 135}deg` }],
  });

  return (
    <View style={[{ width: size, height: size }, style]}>
      {/* Track */}
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: half,
          borderWidth: strokeWidth,
          borderColor: track,
        }}
      />
      {/* Right half (0–50%) */}
      <View style={[styles.clip, { width: half, height: size, left: half }]}>
        <View style={[halfRing(rightDeg), { position: 'absolute', left: -half }]} />
      </View>
      {/* Left half (50–100%) */}
      <View style={[styles.clip, { width: half, height: size, left: 0 }]}>
        <View style={[halfRing(leftDeg + 180), { position: 'absolute', left: 0 }]} />
      </View>

      {showLabel && (
        <View style={[StyleSheet.absoluteFill, styles.center]}>
          <Text style={[styles.label, { fontSize: Math.round(size * 0.24) }]}>{Math.round(pct)}%</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  clip: { position: 'absolute', top: 0, overflow: 'hidden' },
  center: { alignItems: 'center', justifyContent: 'center' },
  label: { fontFamily: typography.fontFamily, fontWeight: '600', color: colors.textHeading },
});
