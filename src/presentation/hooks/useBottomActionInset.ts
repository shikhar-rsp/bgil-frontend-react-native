import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing } from '@atlas-ds/react-native';

/**
 * Bottom padding for an action bar docked to the screen edge.
 *
 * The safe-area inset is unusable space — iOS reserves it for the home
 * indicator and the display's rounded corners eat into it — so a bar that only
 * carries its own padding ends up with its buttons clipped or sitting under the
 * indicator. The inset is *added to* the design's padding rather than swapped
 * for it, so the gap between the buttons and the screen edge looks the same on
 * a notched iPhone as on a device that reports no inset at all.
 *
 * Only for bars that actually touch the bottom edge. A bar sitting above the
 * BottomNav does not need it — the nav already spans the inset.
 */
export const useBottomActionInset = (base: number = spacing.lg): number => {
  const { bottom } = useSafeAreaInsets();
  return bottom + base;
};
