import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, BackHandler, InteractionManager, useWindowDimensions, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProductTour, spacing } from '@atlas-ds/react-native';
import { Spotlight } from './Spotlight';
import { useWalkthrough, type TargetRect } from './WalkthroughContext';
import type { WalkthroughStep, WalkthroughSurface } from './walkthroughSteps';

interface DashboardWalkthroughProps {
  isOpen: boolean;
  onClose: () => void;
  steps: WalkthroughStep[];
  /** Host switches bottom-nav / sub-tab so the step's target is mounted. */
  onSurfaceChange: (surface: WalkthroughSurface) => void;
  /** Host scrolls its active list so `rect` is comfortably on screen. */
  onScrollIntoView?: (rect: TargetRect) => void;
}

/** A freshly-switched tab needs a beat to mount and lay out before measuring. */
const MEASURE_ATTEMPTS = 8;
const MEASURE_INTERVAL = 70;

/** Distance between the spotlight cutout and the coach-mark card. */
const CARD_GAP = spacing.md;
/** Minimum breathing room between the card and a screen edge. */
const CARD_EDGE = spacing.lg;
/** Used only until the card reports its real height via onLayout. */
const CARD_HEIGHT_ESTIMATE = 190;

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

/**
 * Spotlight + coach-mark tour over the dashboard.
 *
 * Unlike the web version — where every target sits on one scrolling page — the
 * targets here are spread across bottom-nav tabs and Home sub-tabs, so each
 * step first asks the host to switch surface, then polls for the target to
 * mount before measuring it. A target that never appears is skipped rather
 * than stalling the tour on a blank overlay.
 */
export const DashboardWalkthrough: React.FC<DashboardWalkthroughProps> = ({
  isOpen,
  onClose,
  steps,
  onSurfaceChange,
  onScrollIntoView,
}) => {
  const registry = useWalkthrough();
  const { height: screenH } = useWindowDimensions();
  // The overlay spans the whole screen, including the notch / Dynamic Island /
  // punch-hole and the home indicator, so the card is kept inside these rather
  // than inside the raw screen bounds.
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<TargetRect | null>(null);
  // Measured from the card itself; the estimate only governs the first frame's
  // below/above choice, which self-corrects once the real height arrives.
  const [cardHeight, setCardHeight] = useState(CARD_HEIGHT_ESTIMATE);
  // Bumped on every step change; async resolution from a superseded step is
  // discarded rather than painting a stale spotlight.
  const runId = useRef(0);

  useEffect(() => {
    if (isOpen) {
      setIndex(0);
      setRect(null);
    }
  }, [isOpen]);

  const finish = useCallback(() => {
    runId.current += 1;
    setRect(null);
    onClose();
  }, [onClose]);

  // The overlay is no longer a Modal, so Android back needs handling here.
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      finish();
      return true;
    });
    return () => sub.remove();
  }, [isOpen, finish]);

  useEffect(() => {
    if (!isOpen || !registry) {
      return;
    }
    const step = steps[index];
    if (!step) {
      finish();
      return;
    }

    runId.current += 1;
    const run = runId.current;
    const isStale = () => run !== runId.current;

    setRect(null);
    onSurfaceChange(step.surface);

    let cancelled = false;
    const resolveTarget = async () => {
      await new Promise<void>((resolve) => InteractionManager.runAfterInteractions(() => resolve()));

      for (let attempt = 0; attempt < MEASURE_ATTEMPTS; attempt += 1) {
        if (cancelled || isStale()) {
          return;
        }
        const measured = await registry.measure(step.targetId);
        if (measured) {
          // Bring it on screen, then re-measure — scrolling moves the rect.
          if (step.autoScroll !== false) {
            onScrollIntoView?.(step.focus ? step.focus(measured) : measured);
          }
          await nextFrame();
          await wait(MEASURE_INTERVAL);
          if (cancelled || isStale()) {
            return;
          }
          const settled = (await registry.measure(step.targetId)) ?? measured;
          setRect(step.focus ? step.focus(settled) : settled);
          return;
        }
        await wait(MEASURE_INTERVAL);
      }

      if (cancelled || isStale()) {
        return;
      }
      // Target never mounted — advance rather than stall on an empty overlay.
      if (index < steps.length - 1) {
        setIndex((i) => i + 1);
      } else {
        finish();
      }
    };

    resolveTarget();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, index, steps, registry]);

  if (!isOpen) {
    return null;
  }

  const step = steps[index];
  if (!step) {
    return null;
  }

  const isLast = index === steps.length - 1;

  // Sit the card directly against the target — below it by preference, above it
  // when there isn't room below. Anything that doesn't fit either side falls
  // back to the roomier one, clamped on screen.
  const topLimit = insets.top + CARD_EDGE;
  const bottomLimit = screenH - insets.bottom - CARD_EDGE;
  const belowTop = rect ? rect.y + rect.height + CARD_GAP : 0;
  const aboveTop = rect ? rect.y - CARD_GAP - cardHeight : 0;
  const cardTop = !rect
    ? 0
    : belowTop + cardHeight <= bottomLimit
      ? belowTop
      : aboveTop >= topLimit
        ? aboveTop
        : Math.max(
            topLimit,
            Math.min(
              screenH - (rect.y + rect.height) >= rect.y ? belowTop : aboveTop,
              bottomLimit - cardHeight,
            ),
          );
  const isBelow = rect ? cardTop >= rect.y : true;

  return (
    <View style={styles.root} pointerEvents="box-none">
      {/* Both are gated on `rect`: placing the card before the target is
          measured would park it somewhere arbitrary and then jump. */}
      {rect ? (
        <>
          <Spotlight rect={rect} radius={step.radius} onPressOutside={finish} />

          <View
            style={[
              styles.cardSlot,
              // Horizontal insets matter in landscape, where the notch eats
              // into one side.
              { top: cardTop, left: spacing.md + insets.left, right: spacing.md + insets.right },
            ]}
            pointerEvents="box-none"
            onLayout={(e) => setCardHeight(e.nativeEvent.layout.height)}
          >
            <ProductTour
              title={step.title}
              description={step.description}
              tail={isBelow ? 'up' : 'down'}
              progress
              steps={steps.length}
              currentStep={index + 1}
              onSnooze={finish}
              // Hidden rather than disabled on the first step — ProductTour has
              // no disabled state, and a dead-looking button reads as a bug.
              backButton={index > 0}
              onBack={() => setIndex((i) => Math.max(0, i - 1))}
              nextLabel={isLast ? 'Finish' : 'Next'}
              onNext={() => (isLast ? finish() : setIndex((i) => i + 1))}
            />
          </View>
        </>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  // Absolute fill over the screen root rather than a Modal, so the overlay
  // shares a coordinate space with the measured targets.
  root: { ...StyleSheet.absoluteFillObject, zIndex: 50, elevation: 50 },
  // `box-none` lets taps fall through the slot to the dim layer, while the card
  // itself still receives them.
  cardSlot: { position: 'absolute', left: spacing.md, right: spacing.md, alignItems: 'center' },
});
