import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { ImageSquare } from 'phosphor-react-native';
import { colors, radius, typography, shadow } from '../../theme';

/**
 * The 12 coach-mark tail positions from Figma (node 9451:3796).
 *
 * The first word is the edge the tail sits on (which way it points):
 *   `up`    → top edge, points up
 *   `down`  → bottom edge, points down
 *   `left`  → left edge, points left
 *   `right` → right edge, points right
 *
 * The suffix anchors it along that edge. For top/bottom edges that's
 * `-left` / (center) / `-right`; for left/right edges it's `-top` / (center) /
 * `-bottom`.
 */
export type ProductTourTail =
  | 'up'
  | 'up-left'
  | 'up-right'
  | 'down'
  | 'down-left'
  | 'down-right'
  | 'left'
  | 'left-top'
  | 'left-bottom'
  | 'right'
  | 'right-top'
  | 'right-bottom';

export interface ProductTourProps {
  /** Card heading (Body 1 / 16·24 / Medium). */
  title: string;
  /** Body copy (Body 2 / 14·20 / Regular). */
  description: string;
  /** Tail direction + anchor. Default `up`. */
  tail?: ProductTourTail;

  /** Show the 140px media slot above the text. Default `false`. */
  showSlot?: boolean;
  /** Content rendered inside the slot (image, illustration…). */
  slot?: React.ReactNode;

  /** Show the footer nav row (snooze + back/next). Default `true`. */
  nav?: boolean;

  /** Show the left "Snooze" link. Default `true`. */
  snooze?: boolean;
  snoozeLabel?: string;
  onSnooze?: () => void;

  /** Show step dots next to snooze. Default `false`. */
  progress?: boolean;
  /** Total number of steps (dots). Default `6`. */
  steps?: number;
  /** 1-based index of the active step. Default `1`. */
  currentStep?: number;

  /** Show the outline "Back" button. Default `true`. */
  backButton?: boolean;
  backLabel?: string;
  onBack?: () => void;

  /** Show the filled "Next" button. Default `true`. */
  primaryButton?: boolean;
  nextLabel?: string;
  onNext?: () => void;

  style?: object;
}

// Tail triangle: 28px base × 8px height (Figma). Built with the RN border trick.
const TAIL_BASE = 14; // half-base
const TAIL_DEPTH = 8;
// Inset of the tail from the card corner for the off-centre anchors.
const TAIL_OFFSET = 24;
const TAIL_BG = colors.surface;

type Edge = 'up' | 'down' | 'left' | 'right';
type Align = 'start' | 'center' | 'end';

const parseTail = (tail: ProductTourTail): { edge: Edge; align: Align } => {
  const [edge, anchor] = tail.split('-') as [Edge, string | undefined];
  const align: Align =
    anchor === 'left' || anchor === 'top' ? 'start' : anchor === 'right' || anchor === 'bottom' ? 'end' : 'center';
  return { edge, align };
};

const Tail: React.FC<{ tail: ProductTourTail }> = ({ tail }) => {
  const { edge, align } = parseTail(tail);
  const horizontal = edge === 'up' || edge === 'down';

  // Triangle pointing OUTWARD from the card edge (RN border trick).
  const triangle =
    edge === 'up'
      ? { borderLeftWidth: TAIL_BASE, borderRightWidth: TAIL_BASE, borderBottomWidth: TAIL_DEPTH, borderBottomColor: TAIL_BG }
      : edge === 'down'
      ? { borderLeftWidth: TAIL_BASE, borderRightWidth: TAIL_BASE, borderTopWidth: TAIL_DEPTH, borderTopColor: TAIL_BG }
      : edge === 'left'
      ? { borderTopWidth: TAIL_BASE, borderBottomWidth: TAIL_BASE, borderRightWidth: TAIL_DEPTH, borderRightColor: TAIL_BG }
      : { borderTopWidth: TAIL_BASE, borderBottomWidth: TAIL_BASE, borderLeftWidth: TAIL_DEPTH, borderLeftColor: TAIL_BG };

  // `off` seats the triangle's base flush against the card edge.
  const off = -TAIL_DEPTH + 0.5;

  // Centered tails — a full-edge wrapper centers the triangle with flexbox so it
  // sits on the card's true mid-line. (A `left: '50%'` inset resolves against the
  // card's content box, i.e. inside the 20px padding, so the tail landed ~20px
  // off-centre on native. Symmetric padding ⇒ flex-centre = real card centre.)
  if (align === 'center') {
    const wrap: Record<string, number | string> = horizontal
      ? { left: 0, right: 0, [edge === 'up' ? 'top' : 'bottom']: off, flexDirection: 'row' }
      : { top: 0, bottom: 0, [edge === 'left' ? 'left' : 'right']: off, flexDirection: 'column' };
    return (
      <View
        style={[styles.tailWrap, wrap as object, { alignItems: 'center', justifyContent: 'center' }]}
        pointerEvents="none"
      >
        <View style={[styles.tail, { position: 'relative' }, triangle as object]} />
      </View>
    );
  }

  // Off-centre anchors — numeric absolute placement relative to the card.
  const pos: Record<string, number | string> = {};
  if (edge === 'up') pos.top = off;
  else if (edge === 'down') pos.bottom = off;
  else if (edge === 'left') pos.left = off;
  else pos.right = off;

  if (horizontal) {
    if (align === 'start') pos.left = TAIL_OFFSET;
    else pos.right = TAIL_OFFSET;
  } else {
    if (align === 'start') pos.top = TAIL_OFFSET;
    else pos.bottom = TAIL_OFFSET;
  }

  return <View style={[styles.tail, triangle as object, pos as object]} pointerEvents="none" />;
};

type TourButtonVariant = 'snooze' | 'back' | 'next';

const TourButton: React.FC<{ label: string; variant: TourButtonVariant; onPress?: () => void }> = ({
  label,
  variant,
  onPress,
}) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={label}
    style={({ pressed }) => [
      styles.btn,
      variant === 'back' && styles.btnBack,
      variant === 'next' && styles.btnNext,
      pressed && styles.btnPressed,
    ]}
  >
    <Text style={[styles.btnText, variant === 'next' ? styles.btnTextNext : styles.btnTextBrand]}>{label}</Text>
  </Pressable>
);

/**
 * ProductTour — the coach-mark / product-tour step card from Figma
 * (node 9451:3796). A white card (radius 8, padding 20, lg shadow) with a
 * directional tail in any of 12 positions, an optional media slot, a
 * title/description block and a snooze · progress · back · next footer.
 *
 * Width is responsive (stretches, capped at 320 like the spec). Position the
 * card next to its anchor in your screen and pick the matching `tail`.
 */
export const ProductTour: React.FC<ProductTourProps> = ({
  title,
  description,
  tail = 'up',
  showSlot = false,
  slot = null,
  nav = true,
  snooze = true,
  snoozeLabel = 'Snooze',
  onSnooze,
  progress = false,
  steps = 6,
  currentStep = 1,
  backButton = true,
  backLabel = 'Back',
  onBack,
  primaryButton = true,
  nextLabel = 'Next',
  onNext,
  style,
}) => (
  <View style={[styles.card, style]}>
    <Tail tail={tail} />

    {showSlot ? (
      <View style={styles.slot}>
        {slot ?? (
          <View style={styles.slotPlaceholder}>
            <ImageSquare size={32} color={colors.textMuted} weight="regular" />
          </View>
        )}
      </View>
    ) : null}

    <View style={styles.textBlock}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>

    {nav ? (
      <View style={styles.nav}>
        <View style={styles.navLeft}>
          {snooze ? <TourButton label={snoozeLabel} variant="snooze" onPress={onSnooze} /> : null}
        </View>
        <View style={styles.navRight}>
          {backButton ? <TourButton label={backLabel} variant="back" onPress={onBack} /> : null}
          {primaryButton ? <TourButton label={nextLabel} variant="next" onPress={onNext} /> : null}
        </View>
      </View>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  // Card — bg white, radius 8, padding 20, inner gap 12, lg shadow, max 320.
  card: {
    alignSelf: 'stretch',
    maxWidth: 320,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 20,
    gap: 12,
    ...shadow.lg,
  },

  // Tail — absolutely positioned 0×0 border triangle, seated on a card edge.
  tail: { position: 'absolute', width: 0, height: 0, backgroundColor: 'transparent', borderColor: 'transparent' },
  // Full-edge wrapper that flex-centres a tail on the card's mid-line.
  tailWrap: { position: 'absolute' },

  // Media slot — 140px tall placeholder area.
  slot: { height: 140, width: '100%', borderRadius: radius.md, overflow: 'hidden', backgroundColor: colors.surfaceMuted },
  slotPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // Text block — title 16/24/500, body 14/20/400.
  textBlock: { gap: 4 },
  title: { fontFamily: typography.fontFamily, fontSize: 16, lineHeight: 24, fontWeight: '500', color: colors.textHeading },
  description: { fontFamily: typography.fontFamily, fontSize: 14, lineHeight: 20, fontWeight: '400', color: colors.textBody },

  // Footer — space-between, but groups may shrink so buttons never overflow the card.
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  navLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1, minWidth: 0 },
  navRight: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 0 },

  // Buttons — 12/16 text, padding 12/8, radius 8. Content-sized so the footer
  // fits the 320px card even with snooze present.
  btn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  btnBack: { borderWidth: 1, borderColor: colors.brand, backgroundColor: colors.surface },
  btnNext: { backgroundColor: colors.brand },
  btnPressed: { opacity: 0.7 },
  btnText: { fontFamily: typography.fontFamily, fontSize: 12, lineHeight: 16, fontWeight: '400', textAlign: 'center' },
  btnTextBrand: { color: colors.brandPressed },
  btnTextNext: { color: colors.textOnBrand },
});
