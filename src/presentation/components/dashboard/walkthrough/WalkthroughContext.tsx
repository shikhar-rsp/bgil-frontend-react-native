import React, { createContext, useCallback, useContext, useMemo, useRef } from 'react';
import { View } from 'react-native';

/** Window-space rectangle of a tour target, as returned by `measureInWindow`. */
export type TargetRect = { x: number; y: number; width: number; height: number };

interface WalkthroughContextValue {
  /** Register a target's view under `id`. Returns an unregister callback. */
  register: (id: string, ref: React.RefObject<View | null>) => () => void;
  /**
   * Register the screen root that the tour overlay draws into. Measurements
   * are reported relative to it, so the overlay never has to reason about
   * status-bar or window insets.
   */
  registerRoot: (ref: React.RefObject<View | null>) => void;
  /**
   * Measure a registered target relative to the registered root, or null if
   * absent. Falls back to raw window coordinates when no root is registered.
   */
  measure: (id: string) => Promise<TargetRect | null>;
  /** Whether `id` currently has a mounted view — used to skip dead steps. */
  isRegistered: (id: string) => boolean;
}

const measureInWindow = (node: View) =>
  new Promise<TargetRect | null>((resolve) => {
    node.measureInWindow((x, y, width, height) => {
      // A view that is registered but not laid out yet measures as zero.
      if (!width || !height) {
        resolve(null);
        return;
      }
      resolve({ x, y, width, height });
    });
  });

const WalkthroughContext = createContext<WalkthroughContextValue | null>(null);

/**
 * Registry of walkthrough targets.
 *
 * The web tour finds its targets by regex-matching heading text and climbing to
 * the nearest rounded ancestor. There is no DOM here, so sections instead
 * register themselves by id via {@link WalkthroughTarget} and are measured with
 * `measureInWindow` — which reports window coordinates directly, so the overlay
 * needs no scroll-offset arithmetic.
 */
export const WalkthroughProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const targets = useRef<Record<string, React.RefObject<View | null>>>({});
  const root = useRef<React.RefObject<View | null> | null>(null);

  const registerRoot = useCallback((ref: React.RefObject<View | null>) => {
    root.current = ref;
  }, []);

  const register = useCallback((id: string, ref: React.RefObject<View | null>) => {
    targets.current[id] = ref;
    return () => {
      // Only clear if this ref still owns the id. A section that remounts
      // (tab switch) can register before the outgoing copy cleans up, and an
      // unconditional delete would drop the live target.
      if (targets.current[id] === ref) {
        delete targets.current[id];
      }
    };
  }, []);

  const measure = useCallback(async (id: string) => {
    const node = targets.current[id]?.current;
    if (!node) {
      return null;
    }
    const rect = await measureInWindow(node);
    if (!rect) {
      return null;
    }

    // Rebase onto the overlay's own container. `measureInWindow` is relative to
    // the app window, whose origin sits below the status bar unless the app is
    // edge-to-edge — so absolute window coordinates would be off by a
    // device-dependent inset. Subtracting the root's origin cancels whatever
    // that inset happens to be.
    const rootNode = root.current?.current;
    if (!rootNode) {
      return rect;
    }
    const rootRect = await measureInWindow(rootNode);
    if (!rootRect) {
      return rect;
    }
    return { ...rect, x: rect.x - rootRect.x, y: rect.y - rootRect.y };
  }, []);

  const isRegistered = useCallback((id: string) => Boolean(targets.current[id]?.current), []);

  const value = useMemo(
    () => ({ register, registerRoot, measure, isRegistered }),
    [register, registerRoot, measure, isRegistered],
  );

  return <WalkthroughContext.Provider value={value}>{children}</WalkthroughContext.Provider>;
};

/** Read the registry. Returns null outside a provider so targets stay inert. */
export const useWalkthrough = () => useContext(WalkthroughContext);

/**
 * Wraps a dashboard section so the tour can find it, keeping the section
 * components themselves free of tour concerns.
 *
 * `collapsable={false}` is required: without it Android flattens away a plain
 * View that draws nothing, and `measureInWindow` then reports zeros.
 */
export const WalkthroughTarget: React.FC<{
  id: string;
  children: React.ReactNode;
  style?: object;
}> = ({ id, children, style }) => {
  const ref = useRef<View | null>(null);
  const ctx = useWalkthrough();

  React.useEffect(() => {
    if (!ctx) {
      return;
    }
    return ctx.register(id, ref);
  }, [ctx, id]);

  return (
    <View ref={ref} collapsable={false} style={style}>
      {children}
    </View>
  );
};
