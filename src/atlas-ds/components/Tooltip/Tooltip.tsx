import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { radius, typography } from '../../theme';

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';
export type TooltipTheme = 'light' | 'dark';
export type TooltipTrigger = 'longPress' | 'press';
/** For top/bottom placement: which end of the bubble edge the arrow sits on. */
export type TooltipArrowAlign = 'start' | 'center' | 'end';

export interface TooltipProps {
  /** Body text. */
  content: string;
  /** Optional bold heading above the content (web `--has-heading`). */
  heading?: string;
  /**
   * Controlled visibility. Omit to make the tooltip uncontrolled — it then
   * shows on long-press (or tap) of the anchor and auto-hides.
   */
  visible?: boolean;
  /** The anchor element. */
  children: React.ReactNode;
  /** `top` (default) | `bottom` | `left` | `right`. */
  placement?: TooltipPlacement;
  /** `light` (default, #fff/#1E293B) | `dark` (#334155/#fff). */
  theme?: TooltipTheme;
  /** Uncontrolled gesture: `longPress` (default, native mobile pattern) or `press`. */
  trigger?: TooltipTrigger;
  /** Uncontrolled auto-hide delay in ms. Default 2500. Set 0 to disable. */
  autoHideMs?: number;
  /**
   * For `top`/`bottom` placement, shift the arrow toward the bubble's start
   * (left), center or end (right) edge. Default `center`. Figma "Bottom left/
   * center/right" + "Top center".
   */
  arrowAlign?: TooltipArrowAlign;
  /** Hide the arrow entirely (Figma "None" variant). Default true. */
  showArrow?: boolean;
  style?: object;
}

// Web tooltip tokens. `subtle` is the supporting-paragraph color used when a
// heading is present (Figma: #475569 on light, white/inverse on dark).
const THEMES = {
  light: { bg: '#FFFFFF', text: '#1E293B', subtle: '#475569' },
  dark: { bg: '#334155', text: '#FFFFFF', subtle: '#FFFFFF' },
} as const;

// Inset of the arrow from the bubble corner for start/end alignment (≈ radius
// + half the arrow so the tail clears the rounded corner).
const ARROW_INSET = 14;

const ARROW = 6;

/**
 * Tooltip — a bubble with an arrow on one of four sides, light/dark themes and
 * an optional heading. Mirrors `@atlas-ds/react` `<Tooltip>` (radius 8, padding
 * 8/12, 12/400 text, 500 heading).
 *
 * Mobile has no hover, so when `visible` is omitted the tooltip is uncontrolled
 * and shows on **long-press** of the anchor (the native pattern), auto-hiding
 * after `autoHideMs`. Pass `visible` to control it yourself. For interactive
 * anchors (Button) that capture the gesture, prefer controlled `visible`.
 */
export const Tooltip: React.FC<TooltipProps> = ({
  content,
  heading,
  visible,
  children,
  placement = 'top',
  theme = 'light',
  trigger = 'longPress',
  autoHideMs = 2500,
  arrowAlign = 'center',
  showArrow = true,
  style,
}) => {
  const controlled = visible !== undefined;
  const [internal, setInternal] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const show = controlled ? visible : internal;

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const open = () => {
    setInternal(true);
    if (timer.current) clearTimeout(timer.current);
    if (autoHideMs) timer.current = setTimeout(() => setInternal(false), autoHideMs);
  };
  const close = () => {
    if (timer.current) clearTimeout(timer.current);
    setInternal(false);
  };

  const t = THEMES[theme];
  const horizontal = placement === 'left' || placement === 'right';

  const arrow = (() => {
    switch (placement) {
      case 'top':
        return <View style={[styles.arrow, { borderTopWidth: ARROW, borderTopColor: t.bg, borderLeftWidth: ARROW, borderRightWidth: ARROW, borderLeftColor: 'transparent', borderRightColor: 'transparent' }]} />;
      case 'bottom':
        return <View style={[styles.arrow, { borderBottomWidth: ARROW, borderBottomColor: t.bg, borderLeftWidth: ARROW, borderRightWidth: ARROW, borderLeftColor: 'transparent', borderRightColor: 'transparent' }]} />;
      case 'left':
        return <View style={[styles.arrow, { borderLeftWidth: ARROW, borderLeftColor: t.bg, borderTopWidth: ARROW, borderBottomWidth: ARROW, borderTopColor: 'transparent', borderBottomColor: 'transparent' }]} />;
      case 'right':
        return <View style={[styles.arrow, { borderRightWidth: ARROW, borderRightColor: t.bg, borderTopWidth: ARROW, borderBottomWidth: ARROW, borderTopColor: 'transparent', borderBottomColor: 'transparent' }]} />;
    }
  })();

  const bubble = (
    <View style={[styles.bubble, { backgroundColor: t.bg }, heading && styles.bubbleHeading]}>
      {heading ? <Text style={[styles.heading, { color: t.text }]}>{heading}</Text> : null}
      {/* Single-line tooltips use the heading color; the supporting paragraph
          under a heading uses the subtle color (Figma Body 3/Regular). */}
      <Text style={[styles.text, { color: heading ? t.subtle : t.text }]}>{content}</Text>
    </View>
  );

  // For top/bottom the arrow can sit at the start/center/end of the bubble edge;
  // shift both the bubble (cross-axis align) and the arrow (corner inset) to match.
  const vAlign =
    arrowAlign === 'start' ? 'flex-start' : arrowAlign === 'end' ? 'flex-end' : 'center';
  const arrowInset =
    horizontal || arrowAlign === 'center'
      ? null
      : arrowAlign === 'start'
      ? { marginLeft: ARROW_INSET }
      : { marginRight: ARROW_INSET };
  const arrowEl = showArrow ? <View style={arrowInset}>{arrow}</View> : null;

  const anchor = controlled ? (
    children
  ) : (
    <Pressable
      onLongPress={trigger === 'longPress' ? open : undefined}
      onPress={trigger === 'press' ? () => (internal ? close() : open()) : undefined}
      delayLongPress={300}
    >
      {children}
    </Pressable>
  );

  return (
    <View style={styles.anchor}>
      {show && (
        <View
          style={[
            styles.wrap,
            wrapStyle[placement],
            horizontal && styles.wrapRow,
            !horizontal && { alignItems: vAlign },
            style,
          ]}
          pointerEvents="none"
        >
          {placement === 'bottom' || placement === 'right' ? arrowEl : null}
          {bubble}
          {placement === 'top' || placement === 'left' ? arrowEl : null}
        </View>
      )}
      {anchor}
    </View>
  );
};

const styles = StyleSheet.create({
  anchor: { alignSelf: 'flex-start', position: 'relative' },
  wrap: { position: 'absolute', flexDirection: 'column', alignItems: 'center' },
  wrapRow: { flexDirection: 'row', alignItems: 'center' },
  // Web: radius 8, padding 8/12, 12/400 text, subtle shadow.
  bubble: {
    borderRadius: radius.lg,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxWidth: 240,
    shadowColor: '#0A0D12',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 3,
  },
  // Heading variant wraps; capped so it stays within a phone screen (responsive).
  bubbleHeading: { maxWidth: 260, gap: 4 },
  heading: { fontFamily: typography.fontFamily, fontSize: 12, lineHeight: 16, fontWeight: '500' },
  text: { fontFamily: typography.fontFamily, fontSize: 12, lineHeight: 16, fontWeight: '400' },
  arrow: { width: 0, height: 0 },
});

// Position the bubble+arrow group relative to the anchor (gap 12, web margin).
const wrapStyle = StyleSheet.create({
  top: { bottom: '100%', left: 0, right: 0, marginBottom: 12 },
  bottom: { top: '100%', left: 0, right: 0, marginTop: 12 },
  left: { right: '100%', top: 0, bottom: 0, justifyContent: 'center', alignItems: 'flex-end', marginRight: 12 },
  right: { left: '100%', top: 0, bottom: 0, justifyContent: 'center', alignItems: 'flex-start', marginLeft: 12 },
});
