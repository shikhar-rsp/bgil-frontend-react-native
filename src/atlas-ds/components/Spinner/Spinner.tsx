import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Easing,
  Platform,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../../theme';

/**
 * Named loader colours mirroring the Figma "Spinner" component
 * (vHExm4J0Y43BZkLYswSKm8 node 2072:13847). Each variant is the solid head of
 * the fading ring; the tail fades to transparent.
 *   • Gray     → slate-700  #334155
 *   • Inverse  → white      #FFFFFF  (for use on brand/dark surfaces)
 *   • Brand    → Bajaj blue #005DAC
 *   • Warning  → amber-500  #F59E0B
 *   • Error    → red-500    #EF4444
 */
export type SpinnerColor = 'gray' | 'inverse' | 'brand' | 'warning' | 'error';

const SPINNER_COLORS: Record<SpinnerColor, string> = {
  gray: '#334155',
  inverse: '#FFFFFF',
  brand: colors.brand,
  warning: '#F59E0B',
  error: '#EF4444',
};

export interface SpinnerProps {
  /** Diameter in px. Default 16 (Figma loader size). */
  size?: number;
  /** Named loader colour or any custom colour string. Default `brand`. */
  color?: SpinnerColor | (string & {});
  /** Milliseconds per full revolution. Default 800. */
  durationMs?: number;
  /** Number of arc segments forming the fading ring. Default 60. */
  segments?: number;
  style?: StyleProp<ViewStyle>;
  /** Accessibility label. Default `Loading`. */
  accessibilityLabel?: string;
}

// Geometry in the fixed 16-unit viewBox (matches Figma): outer radius 8, inner
// 6.667 → centre-line radius 7.333, stroke 1.333. Scaling happens via the Svg's
// width/height, so the path maths stay size-independent.
const VIEWBOX = 16;
const CENTER = VIEWBOX / 2;
const STROKE = VIEWBOX * (1.333 / 16);
const RADIUS = VIEWBOX * (7.333 / 16);
const MIN_OPACITY = 0; // tail fades fully out (Figma: ~6% white ≈ transparent)

const polar = (angleRad: number): [number, number] => [
  CENTER + RADIUS * Math.cos(angleRad),
  CENTER + RADIUS * Math.sin(angleRad),
];

/**
 * Spinner — the design-system loading indicator. A ring whose colour fades from
 * transparent (tail) to solid (head), rotating continuously. Reproduces the
 * Figma conic-gradient loader using arc segments so it renders identically on
 * iOS, Android and web (react-native-svg has no conic gradient).
 *
 * Used by `Button` in its loading state; also exported for standalone use.
 */
export const Spinner: React.FC<SpinnerProps> = ({
  size = 16,
  color = 'brand',
  durationMs = 800,
  segments = 60,
  style,
  accessibilityLabel = 'Loading',
}) => {
  const stroke = (SPINNER_COLORS as Record<string, string>)[color] ?? color;
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: durationMs,
        easing: Easing.linear,
        // RN-web ignores the native driver (and warns); rotate is GPU-friendly
        // on native, so drive it natively everywhere it's supported.
        useNativeDriver: Platform.OS !== 'web',
      }),
    );
    anim.start();
    return () => anim.stop();
  }, [spin, durationMs]);

  // Build the fading ring once per `segments`. Each segment is a short arc with
  // its own opacity, stepping linearly from the faint tail to the solid head.
  // Butt caps + shared endpoints tile cleanly without semi-transparent overlap.
  const arcs = useMemo(() => {
    const step = (Math.PI * 2) / segments;
    return Array.from({ length: segments }, (_, i) => {
      const a0 = i * step - Math.PI / 2; // start at 12 o'clock
      const a1 = (i + 1) * step - Math.PI / 2;
      const [x0, y0] = polar(a0);
      const [x1, y1] = polar(a1);
      const opacity = MIN_OPACITY + (1 - MIN_OPACITY) * (i / (segments - 1));
      return { d: `M ${x0} ${y0} A ${RADIUS} ${RADIUS} 0 0 1 ${x1} ${y1}`, opacity };
    });
  }, [segments]);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      style={[{ width: size, height: size, transform: [{ rotate }] }, style]}
    >
      <Svg width={size} height={size} viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}>
        {arcs.map((arc, i) => (
          <Path
            key={i}
            d={arc.d}
            stroke={stroke}
            strokeOpacity={arc.opacity}
            strokeWidth={STROKE}
            fill="none"
          />
        ))}
      </Svg>
    </Animated.View>
  );
};
