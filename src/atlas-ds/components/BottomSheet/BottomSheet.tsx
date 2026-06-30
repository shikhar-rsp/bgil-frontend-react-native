import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Modal as RNModal,
} from 'react-native';
import { accent, colors, radius, spacing, typography } from '../../theme';
import type { AccentColor } from '../../theme';

/** Outer size of the featured-icon badge in the header (Figma 9013:3460). */
export const BOTTOM_SHEET_HEADER_ICON_SIZE = 32;
/** Recommended glyph size inside the featured-icon badge (20px per Figma). */
export const BOTTOM_SHEET_HEADER_GLYPH_SIZE = 20;

export interface BottomSheetAction {
  label: string;
  onPress: () => void;
}

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
  showHandle = true,
  closeOnBackdrop = true,
  style,
}) => {
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
      <View style={[styles.sheet, style]} pointerEvents="auto">
        {showHandle && (
          <View style={styles.handleWrap}>
            <View style={styles.handle} />
          </View>
        )}

        {(icon || title || subtitle) && (
          <View style={styles.headerRow}>
            {icon && (
              <View style={[styles.iconBadge, { backgroundColor: accent[featuredIconColor].lightBg }]}>
                {icon}
              </View>
            )}
            {(title || subtitle) && (
              <View style={styles.textGroup}>
                {!!title && <Text style={styles.title}>{title}</Text>}
                {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
              </View>
            )}
          </View>
        )}

        {contentSlot && (
          <ScrollView
            style={[styles.contentScroll, { minHeight: contentMinHeight }]}
            contentContainerStyle={styles.contentInner}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        )}

        {(primaryAction || secondaryAction) && (
          <View style={styles.footer}>
            {primaryAction && (
              <Pressable
                style={({ pressed }) => [
                  styles.btn,
                  styles.btnPrimary,
                  pressed && styles.btnPrimaryPressed,
                ]}
                onPress={primaryAction.onPress}
                accessibilityRole="button"
              >
                <Text style={styles.btnPrimaryText}>{primaryAction.label}</Text>
              </Pressable>
            )}
            {secondaryAction && (
              <Pressable
                style={({ pressed }) => [
                  styles.btn,
                  styles.btnSecondary,
                  pressed && styles.btnSecondaryPressed,
                ]}
                onPress={secondaryAction.onPress}
                accessibilityRole="button"
              >
                <Text style={styles.btnSecondaryText}>{secondaryAction.label}</Text>
              </Pressable>
            )}
          </View>
        )}
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
    paddingBottom: spacing.sm, // 8
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
  title: {
    fontFamily: typography.fontFamily,
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
  // Footer per Figma: row layout, primary LEFT + secondary RIGHT, padding
  // 16 × 20, gap 16 between buttons. Each button gets `flex: 1` below so
  // they share the row width equally.
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
});
