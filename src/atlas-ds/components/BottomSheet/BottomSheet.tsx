import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Animated,
  Pressable,
  StyleSheet,
  ScrollView,
  Modal as RNModal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'phosphor-react-native';
import { accent, colors, fontFamilyForWeight, radius, spacing, typography } from '../../theme';
import type { AccentColor } from '../../theme';

/** Outer size of the featured-icon badge in the header (Figma 9013:3460). */
export const BOTTOM_SHEET_HEADER_ICON_SIZE = 32;
/** Recommended glyph size inside the featured-icon badge (20px per Figma). */
export const BOTTOM_SHEET_HEADER_GLYPH_SIZE = 20;

export interface BottomSheetAction {
  label: string;
  onPress: () => void;
  /** Greys the button and blocks presses — e.g. an incomplete OTP. */
  disabled?: boolean;
}

/**
 * One step of a multi-step sheet. Carries the same header / content / footer a
 * single-page sheet declares via props.
 */
export interface BottomSheetPage {
  /** Stable identity for the step. */
  key: string;
  icon?: React.ReactNode;
  featuredIconColor?: AccentColor;
  title?: string;
  subtitle?: string;
  content?: React.ReactNode;
  contentSlot?: boolean;
  contentMinHeight?: number;
  primaryAction?: BottomSheetAction;
  secondaryAction?: BottomSheetAction;
}

/** How far the outgoing step travels before it's swapped out. */
const PAGE_SLIDE = 64;
const PAGE_OUT_MS = 160;
const PAGE_IN_MS = 200;

export interface BottomSheetProps {
  /** Controls visibility — when false the sheet is unmounted. */
  visible: boolean;
  /** Fired when the user taps the backdrop or a dismiss control. */
  onClose: () => void;

  /**
   * Featured icon above the title — pass the glyph node (~20px, e.g. a Phosphor
   * icon). It's wrapped in a "Light Featured icon" badge (Figma 9013:3460):
   * a light-tinted rounded square. Tint via `featuredIconColor`.
   */
  icon?: React.ReactNode;
  /** Accent tint of the featured-icon badge. Default `blue` (#EFF6FF). */
  featuredIconColor?: AccentColor;
  /** Title text — Heading 2 / SemiBold per Figma. */
  title?: string;
  /** Subtitle/supporting copy — Body 2 / Regular per Figma. */
  subtitle?: string;

  /** Free-form content slot rendered between header and footer. */
  children?: React.ReactNode;
  /**
   * Reserve the content slot between header and footer even when no `children`
   * are supplied, so every variant keeps a consistent space for content
   * (Figma node 9013:3465). Default true. Set false for a compact, content-less
   * sheet that collapses to just header + footer.
   */
  contentSlot?: boolean;
  /**
   * Minimum height of the content slot (Figma reserves 308px). Children scroll
   * within it; the sheet still caps at 90% of the screen. Default 308.
   */
  contentMinHeight?: number;

  /** Primary action (filled brand button). Hides if omitted. */
  primaryAction?: BottomSheetAction;
  /** Secondary action (outlined brand button). Hides if omitted. */
  secondaryAction?: BottomSheetAction;

  /**
   * Renders a back control in the sheet's top-left corner. Use when the sheet
   * is something the user can retreat from, rather than a dead-end
   * confirmation — it gives an explicit way back that the backdrop tap alone
   * doesn't advertise.
   *
   * On a multi-step sheet the control only appears from the second step on,
   * where it pops to the previous one. The first step has nothing behind it.
   */
  onBack?: () => void;
  /** Accessible label for the back control. Default 'Back'. */
  backAccessibilityLabel?: string;

  /**
   * Multi-step sheet. When set, `pages[pageIndex]` supplies the header, content
   * and footer in place of the single-page props, and moving between steps
   * glides the old one out and the new one in rather than cutting.
   *
   * Use this instead of closing one sheet to open another whenever the second
   * is a sub-step of the first — the two reads very differently to the user.
   */
  pages?: BottomSheetPage[];
  /** Active step. Increasing it pushes forward; decreasing pops back. */
  pageIndex?: number;

  /**
   * Ref to the content slot's scroll view, so a consumer can bring newly
   * revealed content into view (e.g. `scrollToEnd` after expanding a section).
   */
  contentRef?: React.Ref<ScrollView>;

  /** Show the small grab handle at the top. Default true. */
  showHandle?: boolean;
  /** Close when the backdrop is tapped. Default true. */
  closeOnBackdrop?: boolean;
  /** Style override on the sheet itself (not the backdrop). */
  style?: object;
}

/**
 * BottomSheet — modal sheet that docks at the bottom of the screen.
 *
 * Figma source: vHExm4J0Y43BZkLYswSKm8 node 9013:3454.
 *
 * Visual contract:
 *   • Backdrop overlay rgba(26,26,26,0.36).
 *   • Sheet docked to the bottom, white surface, top-only radius 20px.
 *   • Optional header (`icon` + title + subtitle), content slot, footer (primary + secondary buttons).
 *
 * Implementation note: the surface is hosted in a native React Native
 * <Modal> (transparent, animationType="slide") so on iOS/Android it overlays
 * the whole screen, slides up, and handles the Android hardware back button —
 * while still rendering as a full-screen portal under react-native-web. Add
 * react-native-reanimated/PanResponder on top if you want drag-to-dismiss.
 */
export const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  icon,
  featuredIconColor = 'blue',
  title,
  subtitle,
  children,
  contentSlot = true,
  contentMinHeight = 308,
  primaryAction,
  secondaryAction,
  onBack,
  backAccessibilityLabel = 'Back',
  pages,
  pageIndex = 0,
  contentRef,
  showHandle = true,
  closeOnBackdrop = true,
  style,
}) => {
  const paged = !!pages && pages.length > 0;

  // The sheet docks to the screen edge, so its footer lands in the space iOS
  // reserves for the home indicator and the display's rounded corners clip.
  // Add the inset to the design's own bottom padding rather than replacing it,
  // so the gap under the buttons reads the same on every device.
  const insets = useSafeAreaInsets();

  // The step currently painted. It trails `pageIndex` until the outgoing
  // animation finishes, so the swap happens while the content is off to one
  // side rather than under the user's eyes.
  const [shownPage, setShownPage] = useState(pageIndex);
  const slide = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!paged || pageIndex === shownPage) {
      return;
    }
    const forward = pageIndex > shownPage;
    Animated.parallel([
      Animated.timing(slide, {
        toValue: forward ? -PAGE_SLIDE : PAGE_SLIDE,
        duration: PAGE_OUT_MS,
        useNativeDriver: true,
      }),
      Animated.timing(fade, { toValue: 0, duration: PAGE_OUT_MS, useNativeDriver: true }),
    ]).start(({ finished }) => {
      if (!finished) {
        return;
      }
      setShownPage(pageIndex);
      // Drop the incoming step in on the far side, then bring it home.
      slide.setValue(forward ? PAGE_SLIDE : -PAGE_SLIDE);
      Animated.parallel([
        Animated.timing(slide, { toValue: 0, duration: PAGE_IN_MS, useNativeDriver: true }),
        Animated.timing(fade, { toValue: 1, duration: PAGE_IN_MS, useNativeDriver: true }),
      ]).start();
    });
  }, [paged, pageIndex, shownPage, slide, fade]);

  // Re-opening a sheet should start from its first step, not wherever the last
  // visit left off mid-animation.
  useEffect(() => {
    if (!visible) {
      setShownPage(pageIndex);
      slide.setValue(0);
      fade.setValue(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const page = paged ? pages[Math.min(shownPage, pages.length - 1)] : undefined;

  // A step's own fields win; the single-page props remain the fallback so both
  // APIs can coexist on one instance.
  const pIcon = page ? page.icon : icon;
  const pIconColor = page?.featuredIconColor ?? featuredIconColor;
  const pTitle = page ? page.title : title;
  const pSubtitle = page ? page.subtitle : subtitle;
  const pContent = page ? page.content : children;
  const pContentSlot = page ? page.contentSlot !== false : contentSlot;
  const pContentMinHeight = page?.contentMinHeight ?? contentMinHeight;
  const pPrimary = page ? page.primaryAction : primaryAction;
  const pSecondary = page ? page.secondaryAction : secondaryAction;

  // Only where there is somewhere to go back TO: a pushed step, or a
  // single-page sheet whose consumer opted in. The first step of a multi-step
  // sheet has nothing behind it, so an arrow there would just be a second
  // close button.
  const showBack = !!onBack && (!paged || shownPage > 0);

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
    <View style={styles.root} pointerEvents="box-none">
      {/* Backdrop — full-bleed, dismisses on tap. */}
      <Pressable
        style={styles.backdrop}
        onPress={() => closeOnBackdrop && onClose()}
        accessibilityRole="button"
        accessibilityLabel="Dismiss bottom sheet"
      />

      {/* The sheet itself. */}
      <View
        style={[styles.sheet, { paddingBottom: insets.bottom + spacing.sm }, style]}
        pointerEvents="auto"
      >
        {showHandle && (
          <View style={styles.handleWrap}>
            <View style={styles.handle} />
          </View>
        )}

        {/* Absolutely positioned so it never shifts the centred header text. */}
        {showBack && (
          <Pressable
            style={styles.backControl}
            onPress={onBack}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={backAccessibilityLabel}
          >
            <ArrowLeft size={20} color={colors.textBody} />
          </Pressable>
        )}

        {/* `overflow: hidden` keeps the gliding step inside the sheet. It sits
            here rather than on the sheet so the sheet's shadow isn't clipped. */}
        <View style={styles.pageClip}>
        <Animated.View
          style={[
            styles.pageInner,
            paged ? { opacity: fade, transform: [{ translateX: slide }] } : null,
          ]}
        >
        {(pIcon || pTitle || pSubtitle) && (
          <View style={styles.headerRow}>
            {pIcon && (
              <View style={[styles.iconBadge, { backgroundColor: accent[pIconColor].lightBg }]}>
                {pIcon}
              </View>
            )}
            {(pTitle || pSubtitle) && (
              <View style={styles.textGroup}>
                {!!pTitle && <Text style={styles.title}>{pTitle}</Text>}
                {!!pSubtitle && <Text style={styles.subtitle}>{pSubtitle}</Text>}
              </View>
            )}
          </View>
        )}

        {pContentSlot && (
          <ScrollView
            ref={contentRef}
            style={[styles.contentScroll, { minHeight: pContentMinHeight }]}
            contentContainerStyle={styles.contentInner}
            showsVerticalScrollIndicator={false}
            // Sheets carrying inputs would otherwise spend the first tap
            // dismissing the keyboard instead of hitting the control.
            keyboardShouldPersistTaps="handled"
          >
            {pContent}
          </ScrollView>
        )}

        {(pPrimary || pSecondary) && (
          // Secondary first so the dismissive action sits on the left and the
          // confirming one on the right, which is where a user reaches for it.
          <View style={styles.footer}>
            {pSecondary && (
              <Pressable
                style={({ pressed }) => [
                  styles.btn,
                  styles.btnSecondary,
                  pressed && !pSecondary.disabled && styles.btnSecondaryPressed,
                  pSecondary.disabled && styles.btnDisabled,
                ]}
                onPress={pSecondary.onPress}
                disabled={pSecondary.disabled}
                accessibilityRole="button"
                accessibilityState={{ disabled: !!pSecondary.disabled }}
              >
                <Text style={[styles.btnSecondaryText, pSecondary.disabled && styles.btnTextDisabled]}>
                  {pSecondary.label}
                </Text>
              </Pressable>
            )}
            {pPrimary && (
              <Pressable
                style={({ pressed }) => [
                  styles.btn,
                  styles.btnPrimary,
                  pressed && !pPrimary.disabled && styles.btnPrimaryPressed,
                  pPrimary.disabled && styles.btnDisabled,
                ]}
                onPress={pPrimary.onPress}
                disabled={pPrimary.disabled}
                accessibilityRole="button"
                accessibilityState={{ disabled: !!pPrimary.disabled }}
              >
                <Text style={[styles.btnPrimaryText, pPrimary.disabled && styles.btnTextDisabled]}>
                  {pPrimary.label}
                </Text>
              </Pressable>
            )}
          </View>
        )}
        </Animated.View>
        </View>
      </View>
    </View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(26, 26, 26, 0.36)',
  },
  // Figma spec: rounded top 20px, white surface, Elevation-1 shadow
  // (0 2 8 0 rgba(0,0,0,0.08)), outer padding 0 0 8 0.
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    // paddingBottom is applied inline — the design's 8px plus the safe-area inset.
    maxHeight: '90%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  handleWrap: {
    paddingVertical: spacing.sm,     // 8 top + 8 bottom per Figma
    paddingHorizontal: 20,           // Figma drag-handle row padding
    alignItems: 'center',
    justifyContent: 'center',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 999,
    backgroundColor: colors.surfaceMuted,
  },
  // Clips the gliding step. On the sheet itself this would clip the shadow.
  //
  // Both this and `pageInner` must be allowed to shrink: they sit between the
  // sheet's `maxHeight` and the content ScrollView's `flexShrink`, and a rigid
  // link anywhere in that chain lets tall content push the footer out of view.
  pageClip: { flexShrink: 1, overflow: 'hidden' },
  pageInner: { flexShrink: 1 },
  backControl: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.lg,
    zIndex: 1,
    padding: spacing.xs,
  },
  headerRow: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,

  },
  // Light Featured icon (Figma 9013:3460): 32×32 rounded square, 6px radius,
  // 6px padding around a 20px glyph, light-tinted bg (set per `featuredIconColor`).
  iconBadge: {
    width: BOTTOM_SHEET_HEADER_ICON_SIZE,
    height: BOTTOM_SHEET_HEADER_ICON_SIZE,
    borderRadius: radius.md, // 6
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  textGroup: {
    alignSelf: 'stretch',
  },
  // Figma calls for SemiBold. Only Regular/Medium/Bold are bundled, so the
  // helper rounds 600 up to Bold — naming the face is what makes the title
  // render heavy at all on Android, which can't synthesise it from `Rubik`.
  title: {
    fontFamily: fontFamilyForWeight('600'),
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '600',
    color: colors.textHeading,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    color: colors.textBody,
    textAlign: 'center',
  },
  contentScroll: {
    flexGrow: 0,
    flexShrink: 1,
  },
  // Figma content padding: px 16, py 8.
  contentInner: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg, // 16
    paddingVertical: spacing.sm,   // 8
  },
  // Footer per Figma: row layout, padding 16 × 20, gap 16 between buttons.
  // Each button gets `flex: 1` below so they share the row width equally.
  // Order is secondary then primary — see the note at the render site.
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: spacing.lg, // 16
    gap: spacing.lg,             // 16
  },
  // `flex: 1` so each button takes 50% of the footer's available width
  // (after subtracting padding + gap). Padding 8 × 16, radius 8.
  btn: {
    flex: 1,
    // 8px of padding alone leaves a 36px control. `minHeight` lifts it to the
    // 44px minimum touch target without changing the padding the design specifies.
    minHeight: 44,
    paddingVertical: spacing.sm,    // 8
    paddingHorizontal: spacing.lg,  // 16
    borderRadius: radius.lg,        // 8
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimary: {
    backgroundColor: colors.brand,
  },
  btnPrimaryPressed: {
    backgroundColor: colors.brandPressed,
  },
  btnPrimaryText: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textOnBrand,
  },
  btnSecondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.brand,
  },
  btnSecondaryPressed: {
    backgroundColor: '#EFF6FF',
  },
  btnSecondaryText: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    color: colors.brandPressed,
  },
  // Applied over either variant, so it has to override both the brand fill and
  // the outlined border.
  btnDisabled: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.borderSubtle,
  },
  btnTextDisabled: {
    color: colors.textDisabled,
  },
});
