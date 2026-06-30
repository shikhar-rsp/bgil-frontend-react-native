import React, { useRef, useState } from 'react';
import { View, Text, PanResponder, StyleSheet } from 'react-native';
import { colors, typography } from '../../theme';

export type SliderValue = number | [number, number];

export interface SliderProps {
  /** Current value. A number, or `[low, high]` when `range`. */
  value: SliderValue;
  onChange?: (value: SliderValue) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Caption on the left of the header. */
  label?: string;
  /** Caption on the right of the header (range slider). */
  rightLabel?: string;
  /** Dual-thumb range variant — `value` becomes `[low, high]`. */
  range?: boolean;
  /** Labels rendered evenly under the track (e.g. ['-50%','0%','+50%']). */
  valueLabels?: string[];
  /** Show min/max under the track. Default true (ignored if `valueLabels` set). */
  showDataRange?: boolean;
  disabled?: boolean;
  style?: object;
}

// Thumb / "Right control" — 24px white circle with a brand border (Figma node
// 4283:2341). All track/fill/thumb positioning derives from THUMB, so this size
// drives both the single and range variants.
const THUMB = 24;
// The track is only 8px tall, a hard target to hit/drag with a finger. The
// wrapper is grown to a comfortable 40px touch zone (track/fill/thumb stay
// vertically centered, so the visual is unchanged) and hitSlop extends the
// PanResponder grab area a little further past its edges.
const TOUCH_HEIGHT = 40;
const TOUCH_SLOP = { top: 8, bottom: 8, left: 8, right: 8 };
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

/**
 * Slider — single- or dual-thumb track. Mirrors `@atlas-ds/react` `<Slider>`:
 * 8px #F1F5F9 track, #005DAC fill, 24px white thumb w/ brand border, 14/400
 * label, optional rightLabel, valueLabels and min/max data range. Full width
 * (responsive); dragging via PanResponder (no native range dep).
 */
export const Slider: React.FC<SliderProps> = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  rightLabel,
  range = false,
  valueLabels,
  showDataRange = true,
  disabled = false,
  style,
}) => {
  const [w, setW] = useState(0);
  const widthRef = useRef(0);

  // Live refs — the PanResponders are created ONCE (useRef), so their handlers
  // must read the CURRENT value / onChange / config from refs, not from the
  // first-render closures. Without this the range clamp would compare against
  // the initial low/high and a thumb could cross the other after the first move.
  const valueRef = useRef(value);
  valueRef.current = value;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const disabledRef = useRef(disabled);
  disabledRef.current = disabled;
  const cfgRef = useRef({ min, max, step });
  cfgRef.current = { min, max, step };
  const dragging = useRef<'low' | 'high' | null>(null);

  const span = max - min || 1;

  const [low, high] = range
    ? (value as [number, number])
    : [min, value as number];

  const valueFromX = (x: number) => {
    const tw = widthRef.current;
    const { min: lo, max: hi, step: st } = cfgRef.current;
    const sp = hi - lo || 1;
    if (!tw) return lo;
    const ratio = clamp((x - THUMB / 2) / (tw - THUMB), 0, 1);
    return clamp(Math.round((lo + ratio * sp) / st) * st, lo, hi);
  };

  // Clamp so neither thumb passes the other: the LEFT thumb stays ≤ the right
  // thumb's value, the RIGHT thumb stays ≥ the left thumb's value.
  const apply = (v: number) => {
    const [lo, hi] = valueRef.current as [number, number];
    if (dragging.current === 'low') onChangeRef.current?.([Math.min(v, hi), hi]);
    else onChangeRef.current?.([lo, Math.max(v, lo)]);
  };

  // --- Single thumb ---
  const singlePan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabledRef.current,
      onMoveShouldSetPanResponder: () => !disabledRef.current,
      onPanResponderGrant: (e) => onChangeRef.current?.(valueFromX(e.nativeEvent.locationX)),
      onPanResponderMove: (e) => onChangeRef.current?.(valueFromX(e.nativeEvent.locationX)),
    })
  ).current;

  // --- Range (two thumbs) — pick the nearer thumb at grant, then clamp. ---
  const rangePan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabledRef.current,
      onMoveShouldSetPanResponder: () => !disabledRef.current,
      onPanResponderGrant: (e) => {
        const v = valueFromX(e.nativeEvent.locationX);
        const [lo, hi] = valueRef.current as [number, number];
        dragging.current = lo === hi ? (v < lo ? 'low' : 'high') : Math.abs(v - lo) <= Math.abs(v - hi) ? 'low' : 'high';
        apply(v);
      },
      onPanResponderMove: (e) => apply(valueFromX(e.nativeEvent.locationX)),
      onPanResponderRelease: () => (dragging.current = null),
    })
  ).current;

  const usable = Math.max(0, w - THUMB);
  const lowFrac = (low - min) / span;
  const highFrac = (high - min) / span;
  const lowLeft = lowFrac * usable;
  const highLeft = highFrac * usable;
  const fillLeft = range ? lowLeft + THUMB / 2 : 0;
  const fillW = range ? (highFrac - lowFrac) * usable : highLeft + THUMB / 2;

  return (
    <View style={[styles.container, disabled && styles.disabled, style]}>
      {(label || rightLabel) && (
        <View style={styles.header}>
          <Text style={styles.label}>{label ?? ''}</Text>
          {rightLabel ? <Text style={styles.label}>{rightLabel}</Text> : null}
        </View>
      )}

      <View
        style={styles.wrapper}
        hitSlop={TOUCH_SLOP}
        onLayout={(e) => {
          widthRef.current = e.nativeEvent.layout.width;
          setW(e.nativeEvent.layout.width);
        }}
        {...(range ? rangePan.panHandlers : singlePan.panHandlers)}
      >
        <View style={styles.track} />
        <View style={[styles.fill, { left: fillLeft, width: fillW }]} />
        {range ? <View style={[styles.thumb, { left: lowLeft }]} /> : null}
        <View style={[styles.thumb, { left: highLeft }]} />
      </View>

      {valueLabels && valueLabels.length ? (
        <View style={styles.rangeLabels}>
          {valueLabels.map((l, i) => (
            <Text key={i} style={styles.rangeValue}>{l}</Text>
          ))}
        </View>
      ) : showDataRange ? (
        <View style={styles.rangeLabels}>
          <Text style={styles.rangeValue}>{min}</Text>
          <Text style={styles.rangeValue}>{max}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: 8, alignSelf: 'stretch' },
  disabled: { opacity: 0.5 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  // Web label: 14 / 400 / #1E293B.
  label: { fontFamily: typography.fontFamily, fontSize: 14, lineHeight: 20, fontWeight: '400', color: colors.textHeading },
  wrapper: { height: TOUCH_HEIGHT, justifyContent: 'center', position: 'relative' },
  track: { position: 'absolute', left: 0, right: 0, height: 8, borderRadius: 12, backgroundColor: colors.surfaceMuted },
  fill: { position: 'absolute', height: 8, borderRadius: 12, backgroundColor: colors.brand },
  thumb: {
    position: 'absolute',
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    backgroundColor: '#FFFFFF', // color.background.disabled
    borderWidth: 2,
    borderColor: colors.brand, // color.border.brand #005DAC
    shadowColor: '#0A0D12',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  // Web range labels: space-between, 12px #94A3B8.
  rangeLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  rangeValue: { fontFamily: typography.fontFamily, fontSize: 12, lineHeight: 16, color: colors.textMuted },
});
