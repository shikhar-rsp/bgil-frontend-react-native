import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';
import {
  InfoIcon,
  XCircleIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  CloseIcon,
} from '../Toast/icons';

export type ToastGlobalVariant = 'success' | 'error' | 'warning' | 'info' | 'neutral';

// Mirrors web toast tokens (@atlas-ds/css toast/tokens.css):
//   bg   = --color-background-<variant>
//   rail = --color-background-<variant>-bold (left strip)
//   icon = --color-icon-<variant>
const TOAST_COLORS: Record<ToastGlobalVariant, { bg: string; rail: string; icon: string }> = {
  success: { bg: '#F7FEE7', rail: '#65A30D', icon: '#65A30D' },
  error:   { bg: '#FEF2F2', rail: '#DC2626', icon: '#DC2626' },
  warning: { bg: '#FFFBEB', rail: '#F59E0B', icon: '#D97706' },
  info:    { bg: '#EFF6FF', rail: '#1D4ED8', icon: '#2563EB' },
  neutral: { bg: '#F8FAFC', rail: '#334155', icon: '#475569' },
};

/** Default status icon per variant (Phosphor, matches web toasts). */
function defaultIcon(variant: ToastGlobalVariant, color: string): React.ReactNode {
  switch (variant) {
    case 'success': return <CheckCircleIcon color={color} />;
    case 'error':   return <XCircleIcon color={color} />;
    case 'warning': return <AlertTriangleIcon color={color} />;
    case 'info':    return <InfoIcon color={color} />;
    case 'neutral': return <CheckCircleIcon color={color} />;
    default:        return <InfoIcon color={color} />;
  }
}

export interface ToastGlobalProps {
  /** Bold first line. */
  title: string;
  /** Optional supporting line (renders inline after the title, like web). */
  message?: string;
  /** Semantic colour. Default `neutral`. */
  variant?: ToastGlobalVariant;
  /** Custom leading icon (defaults to the variant status icon). */
  icon?: React.ReactNode;
  /** Optional action button label (e.g. "Undo"), mirrors web `<ToastAction>`. */
  actionLabel?: string;
  /** Called when the action button is pressed. */
  onAction?: () => void;
  /** Shows an × dismiss button when provided. */
  onClose?: () => void;
  style?: object;
}

/**
 * ToastGlobal — an inline notification banner with a coloured accent rail,
 * status icon, optional action and dismiss. Mirrors `@atlas-ds/react`
 * `<Toast>` 1:1. Render it inside your own timed container/queue.
 */
export const ToastGlobal: React.FC<ToastGlobalProps> = ({
  title,
  message,
  variant = 'neutral',
  icon,
  actionLabel,
  onAction,
  onClose,
  style,
}) => {
  const c = TOAST_COLORS[variant];
  return (
    <View style={[styles.toast, { backgroundColor: c.bg, borderLeftColor: c.rail }, style]}>
      <View style={styles.iconWrap}>{icon ?? defaultIcon(variant, c.icon)}</View>

      {/* Web .toast-content: inline title + description, wrapping. */}
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {message ? <Text style={styles.description}>{message}</Text> : null}
      </View>

      {actionLabel ? (
        <Pressable onPress={onAction} accessibilityRole="button" style={styles.action}>
          <Text style={styles.actionText}>{actionLabel}</Text>
        </Pressable>
      ) : null}

      {onClose ? (
        <Pressable onPress={onClose} hitSlop={8} accessibilityRole="button" accessibilityLabel="Dismiss" style={styles.close}>
          <CloseIcon color={colors.textBody} size={16} />
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  // Web: padding 8/12, radius 8 (radius-md), 3px accent rail, subtle shadow.
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm, // 8
    borderRadius: radius.lg, // 8
    borderLeftWidth: 3,
    paddingVertical: spacing.sm, // 8
    paddingHorizontal: spacing.md, // 12
    alignSelf: 'stretch',
    // Web --shadow-toast: 0 1px 4px rgba(10,13,18,0.05)
    shadowColor: '#0A0D12',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  // Web .toast-icon: 24×24 box.
  iconWrap: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  // Web .toast-content: flex row, gap 4, wrap.
  content: { flex: 1, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4 },
  // Figma: title + description are Body 2 (Rubik 14/20) #1E293B; title medium (500).
  title: { flexShrink: 1, fontFamily: typography.fontFamily, fontSize: 14, lineHeight: 20, fontWeight: '500', color: colors.textHeading },
  description: { flexShrink: 1, fontFamily: typography.fontFamily, fontSize: 14, lineHeight: 20, fontWeight: '400', color: colors.textHeading },
  // Web .toast-action: bordered pill, subtle text.
  action: {
    paddingVertical: spacing.sm, // 8
    paddingHorizontal: spacing.md, // 12
    borderRadius: radius.lg, // 8
    borderWidth: 1,
    borderColor: colors.border, // --color-border-bold #CBD5E1
    backgroundColor: colors.surface, // --color-background-neutral #FFFFFF
  },
  actionText: { fontFamily: typography.fontFamily, fontSize: 12, lineHeight: 16, color: colors.textBody },
  // Web .toast-close: 20×20 hit area, --color-icon #475569.
  close: { width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
});
