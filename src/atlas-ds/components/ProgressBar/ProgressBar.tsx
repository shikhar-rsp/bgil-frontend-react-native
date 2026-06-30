import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography } from '../../theme';

// Web --color-progress-fill is fixed green; the bar has no colour variants.
const FILL = '#65A30D';

export interface ProgressBarProps {
  /** Progress 0–100. */
  value: number;
  /** Track thickness in px. Default 8. */
  height?: number;
  /** Show the "NN%" value in the header. */
  showLabel?: boolean;
  /** Optional caption shown on the left of the header. */
  label?: string;
  style?: object;
}

/**
 * ProgressBar — a determinate horizontal progress track. Mirrors
 * `@atlas-ds/react` `<ProgressBar>`.
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  height = 8,
  showLabel = false,
  label,
  style,
}) => {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <View style={[styles.wrap, style]}>
      {(label || showLabel) && (
        <View style={styles.header}>
          <Text style={styles.label}>{label ?? ''}</Text>
          {showLabel ? <Text style={styles.value}>{Math.round(pct)}%</Text> : null}
        </View>
      )}
      <View style={[styles.track, { height }]}>
        <View
          style={{
            width: `${pct}%`,
            height,
            borderRadius: 8, // web --radius-progress-fill
            backgroundColor: FILL,
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Web: column, gap 8, full width. Header: space-between. Track radius 4.
  wrap: { gap: 8, alignSelf: 'stretch' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  track: { width: '100%', backgroundColor: colors.borderSubtle, borderRadius: 4, overflow: 'hidden' },
  label: { fontFamily: typography.fontFamily, fontSize: 14, lineHeight: 20, color: colors.textHeading },
  value: { fontFamily: typography.fontFamily, fontSize: 14, lineHeight: 20, color: colors.textBody },
});
