import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { List, SquaresFour } from 'phosphor-react-native';
import { colors, radius, typography } from '../../theme';

export type SegmentedSize = 'sm' | 'md';

/** Built-in Phosphor glyphs for segment `iconName`. */
export type SegmentedIconName = 'list' | 'grid';

const SEGMENT_ICON_SIZE = 16; // Figma icon size-[16px]

export interface SegmentedOption {
  /** Caption (optional for icon-only segments). */
  label?: string;
  value: string;
  /** Optional icon (recommended 18×18). Overrides `iconName`. */
  icon?: React.ReactNode;
  /** Built-in Phosphor icon — `list` or `grid`. Tint follows selected state. */
  iconName?: SegmentedIconName;
}

export interface SegmentedControlProps {
  /** Options to display. */
  options: SegmentedOption[];
  /** Selected value (controlled). */
  value: string;
  /** Fired with the new value. */
  onChange?: (value: string) => void;
  /** Segment size — `sm` or `md`. Default `md`. */
  size?: SegmentedSize;
  /** Stretch to fill the parent width. Default true. */
  fullWidth?: boolean;
  style?: object;
}

/**
 * SegmentedControl — a track of mutually-exclusive segments. Mirrors
 * `@atlas-ds/react` `<SegmentedControl>`: sm/md sizes, text / icon / icon+text
 * segments, selected segment outlined in brand with a subtle shadow. Pass any
 * icon via `icon`, or use built-in `iconName` (`list`, `grid`) with Phosphor.
 */
export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  value,
  onChange,
  size = 'md',
  fullWidth = true,
  style,
}) => (
  <View style={[styles.track, fullWidth && styles.fullWidth, style]} accessibilityRole="tablist">
    {options.map((opt) => {
      const active = opt.value === value;
      const icon = opt.icon ?? (opt.iconName ? builtInIcon(opt.iconName, active) : null);
      return (
        <Pressable
          key={opt.value}
          onPress={() => onChange?.(opt.value)}
          accessibilityRole="tab"
          accessibilityState={{ selected: active }}
          style={[
            styles.segment,
            size === 'sm' ? styles.segmentSm : styles.segmentMd,
            fullWidth && styles.segmentFlex,
            active && styles.segmentActive,
          ]}
        >
          {icon ? <View style={styles.icon}>{icon}</View> : null}
          {opt.label ? (
            <Text
              style={[
                styles.label,
                size === 'sm' ? styles.labelSm : styles.labelMd,
                active && styles.labelActive,
              ]}
              numberOfLines={1}
            >
              {opt.label}
            </Text>
          ) : null}
        </Pressable>
      );
    })}
  </View>
);

function builtInIcon(name: SegmentedIconName, active: boolean): React.ReactNode {
  const props = {
    size: SEGMENT_ICON_SIZE,
    color: active ? colors.brandPressed : colors.textBody, // #004E91 selected / #475569 idle
    weight: 'regular' as const,
  };
  switch (name) {
    case 'list':
      return <List {...props} />;
    case 'grid':
      return <SquaresFour {...props} />;
  }
}

const styles = StyleSheet.create({
  // Web: track #F1F5F9, radius 8, padding 0, gap 0.
  track: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSubtle, // #F8FAFC — inactive track
    borderRadius: radius.lg, // 8
    alignSelf: 'flex-start',
  },
  fullWidth: { alignSelf: 'stretch' },
  // Web segments: radius 8, 1px transparent border, icon+text row (gap 8).
  segment: {
    flexDirection: 'row',
    gap: 8,
    borderRadius: radius.lg, // 8
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Web sm: padding 4/12; md: padding 8/16.
  segmentSm: { paddingVertical: 4, paddingHorizontal: 12 },
  segmentMd: { paddingVertical: 8, paddingHorizontal: 16 },
  icon: { width: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
  segmentFlex: { flex: 1 },
  // Selected (Figma): white bg, brand border (#005DAC), Shadow/xs.
  segmentActive: {
    backgroundColor: colors.surface, // #FFFFFF (color.background.accent.gray.subtlest)
    borderColor: colors.brand,
    shadowColor: '#0A0D12',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  // Unselected text #475569 (color.text.subtle); selected #004E91 (brand-default).
  // Size-dependent: sm → Body 2 (14/20), md → Body 1 (16/24).
  label: { fontFamily: typography.fontFamily, fontWeight: '400', color: colors.textBody },
  labelSm: { fontSize: 14, lineHeight: 20 },
  labelMd: { fontSize: 16, lineHeight: 24 },
  labelActive: { color: colors.brandPressed }, // #004E91
});
