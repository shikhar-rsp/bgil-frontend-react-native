import React from 'react';
import { View, Text, Pressable, StyleSheet, Modal as RNModal } from 'react-native';
import { CheckCircle, Warning, Info, XCircle } from 'phosphor-react-native';
import { colors, radius, spacing, typography } from '../../theme';

/** Built-in featured icons — concentric tinted circle + Phosphor glyph. */
export type ModalIconName = 'success' | 'warning' | 'info' | 'danger';

const FEATURED_GLYPH_SIZE = 20;

const MODAL_ICON_PALETTES: Record<
  ModalIconName,
  { outer: string; inner: string; color: string }
> = {
  success: { outer: '#ECFCCB', inner: '#D9F99D', color: '#65A30D' },
  warning: { outer: '#FEF3C7', inner: '#FDE68A', color: '#D97706' },
  info: { outer: '#EFF6FF', inner: colors.brandSubtle, color: colors.brand },
  danger: { outer: '#FEF2F2', inner: '#FEE2E2', color: colors.danger },
};

export interface ModalAction {
  label: string;
  onPress: () => void;
  /**
   * Visual variant of the button.
   *  - Primary slot: `'brand'` (filled blue, default) or `'danger'` (filled red).
   *  - Secondary slot: `'brand'` (blue border + brand-pressed text, default)
   *    or `'neutral'` (slate border + slate text — used by the cancel modal
   *    "take me back" button).
   */
  tone?: 'brand' | 'danger' | 'neutral';
}

export interface ModalProps {
  /** Controls visibility — when false the modal is unmounted. */
  visible: boolean;
  /** Fired when the user taps the backdrop or a dismiss control. */
  onClose: () => void;

  /** Featured icon above the title. Overrides `iconName`. */
  icon?: React.ReactNode;
  /** Built-in featured icon (Phosphor, regular weight, tinted circles). */
  iconName?: ModalIconName;
  /** Title text — Heading 2 / Medium per Figma. */
  title?: string;
  /** Optional subtitle line below the title. */
  subtitle?: string;

  /** Free-form description rendered between the header and the footer. */
  children?: React.ReactNode;

  /** Primary action (filled brand button). */
  primaryAction?: ModalAction;
  /** Secondary action (outlined brand button). */
  secondaryAction?: ModalAction;

  /** Close when the backdrop is tapped. Default true. */
  closeOnBackdrop?: boolean;
  /** Style override on the modal surface itself (not the backdrop). */
  style?: object;
}

/**
 * Modal — centred dialog for confirmations, alerts, and success/error messages.
 *
 * Figma source: vHExm4J0Y43BZkLYswSKm8 node 2701:34525.
 *
 * Differences from BottomSheet:
 *   • Centred on screen (not docked to bottom).
 *   • Fixed 335px width — narrower than the full-width BottomSheet.
 *   • All four corners rounded 16px (BottomSheet rounds only the top).
 *   • Larger drop shadow (Figma "Shadow/lg").
 *   • Optional 44×44 "Featured Icon" centred above the title (`iconName` or `icon`).
 *   • Footer buttons stack VERTICALLY (column) — opposite of BottomSheet's
 *     row footer. Padding 20, gap 12 per Figma `layout_2D3G1R`.
 */
export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  icon,
  iconName,
  title,
  subtitle,
  children,
  primaryAction,
  secondaryAction,
  closeOnBackdrop = true,
  style,
}) => {
  const headerIcon = icon ?? (iconName ? builtInFeaturedIcon(iconName) : undefined);

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
    <View style={styles.root} pointerEvents="box-none">
      {/* Backdrop — full-bleed, dismisses on tap when closeOnBackdrop is true. */}
      <Pressable
        style={styles.backdrop}
        onPress={() => closeOnBackdrop && onClose()}
        accessibilityRole="button"
        accessibilityLabel="Dismiss dialog"
      />

      {/* Modal surface */}
      <View style={[styles.surface, style]} pointerEvents="auto">
        {/* Header — icon + title + subtitle (any subset). */}
        {(headerIcon || title || subtitle) && (
          <View style={styles.header}>
            {headerIcon && <View style={styles.iconSlot}>{headerIcon}</View>}
            {(title || subtitle) && (
              <View style={styles.textGroup}>
                {!!title && <Text style={styles.title}>{title}</Text>}
                {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
              </View>
            )}
          </View>
        )}

        {/* Body — description / custom content. */}
        {children && <View style={styles.body}>{children}</View>}

        {/* Footer — stacked column of buttons per Figma. */}
        {(primaryAction || secondaryAction) && (
          <View style={styles.footer}>
            {primaryAction && (() => {
              // Primary slot supports brand (default) or danger (destructive).
              const danger = primaryAction.tone === 'danger';
              return (
                <Pressable
                  style={({ pressed }) => [
                    styles.btn,
                    danger ? styles.btnDanger : styles.btnPrimary,
                    pressed && (danger ? styles.btnDangerPressed : styles.btnPrimaryPressed),
                  ]}
                  onPress={primaryAction.onPress}
                  accessibilityRole="button"
                >
                  <Text style={styles.btnPrimaryText}>{primaryAction.label}</Text>
                </Pressable>
              );
            })()}
            {secondaryAction && (() => {
              // Secondary slot supports brand (default) or neutral.
              const neutral = secondaryAction.tone === 'neutral';
              return (
                <Pressable
                  style={({ pressed }) => [
                    styles.btn,
                    neutral ? styles.btnNeutral : styles.btnSecondary,
                    pressed && (neutral ? styles.btnNeutralPressed : styles.btnSecondaryPressed),
                  ]}
                  onPress={secondaryAction.onPress}
                  accessibilityRole="button"
                >
                  <Text style={neutral ? styles.btnNeutralText : styles.btnSecondaryText}>
                    {secondaryAction.label}
                  </Text>
                </Pressable>
              );
            })()}
          </View>
        )}
      </View>
    </View>
    </RNModal>
  );
};

function builtInFeaturedIcon(name: ModalIconName): React.ReactNode {
  const palette = MODAL_ICON_PALETTES[name];
  const glyphProps = { size: FEATURED_GLYPH_SIZE, color: palette.color, weight: 'regular' as const };
  const glyph = (() => {
    switch (name) {
      case 'success':
        return <CheckCircle {...glyphProps} />;
      case 'warning':
        return <Warning {...glyphProps} />;
      case 'info':
        return <Info {...glyphProps} />;
      case 'danger':
        return <XCircle {...glyphProps} />;
    }
  })();

  return (
    <View style={[styles.featuredOuter, { backgroundColor: palette.outer }]}>
      <View style={[styles.featuredInner, { backgroundColor: palette.inner }]}>{glyph}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl, // breathing room on very small screens
  },
  // Figma: rgba(26, 26, 26, 0.36) — same scrim as BottomSheet.
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(26, 26, 26, 0.36)',
  },
  // Figma `layout_72QCWB`: fixed width 335, hug height, radius 16, Shadow/lg.
  surface: {
    width: 335,
    maxWidth: '100%',
    backgroundColor: colors.surface,
    borderRadius: radius.xl + 4, // 16px
    overflow: 'hidden',
    // Figma "Shadow/lg" — two stacked offsets for soft + tight elevation.
    shadowColor: '#0A0D12',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 12,
  },
  // Header column — icon centred at top, title below, gap 16 per `layout_L0KVPO`.
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: spacing.lg, // 16
  },
  // 44×44 slot for the featured icon (built-in or custom).
  iconSlot: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredOuter: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textGroup: {
    alignSelf: 'stretch',
    alignItems: 'center',
    gap: spacing.xs, // 4
  },
  // Heading 2/Medium — Rubik 500, 20/24, #1E293B
  title: {
    fontFamily: typography.fontFamily,
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '500',
    color: colors.textHeading,
    textAlign: 'center',
  },
  // Body 1/Regular subtitle when present
  subtitle: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    color: colors.textBody,
    textAlign: 'center',
  },
  // Body — Figma `layout_U053RQ`: padding 8 20 0, gap 16.
  body: {
    paddingHorizontal: 20,
    paddingTop: spacing.sm, // 8
    gap: spacing.lg,
    alignItems: 'center',
  },
  // Footer — column stack of buttons per Figma `layout_2D3G1R`
  // (padding 20, gap 12). Different from BottomSheet's row footer.
  footer: {
    padding: 20,
    gap: spacing.md, // 12
  },
  btn: {
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

  // ---- Danger (destructive) primary — Figma `70:1522 Color=Danger` ----
  // Used for irreversible actions (Cancel changes, Delete, etc.).
  btnDanger: {
    backgroundColor: colors.danger, // #DC2626
  },
  btnDangerPressed: {
    backgroundColor: '#B91C1C', // red-700 — darker on press
  },

  // ---- Neutral secondary — Figma `70:1544 Color=Neutral` ----
  // Secondary button without the brand-blue accent; pairs with the danger
  // primary to keep visual emphasis on the destructive action.
  btnNeutral: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border, // #CBD5E1
  },
  btnNeutralPressed: {
    backgroundColor: colors.surfaceSubtle,
  },
  btnNeutralText: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textBody, // #475569
  },
});
