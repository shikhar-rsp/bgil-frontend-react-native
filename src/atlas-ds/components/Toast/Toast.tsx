import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { typography } from '../../theme';
import {
  InfoIcon,
  XCircleIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  SparkleIcon,
  HexagonIcon,
  CloseIcon,
} from './icons';

export type ToastVariant = 'error' | 'warning' | 'info' | 'success' | 'ai' | 'neutral' | 'brand';
export type ToastFill = 'light' | 'solid';
export type ToastLayout = 'inline' | 'stacked';

// `solidBar` = the 3px left "Color Indicator Bar" (Figma node 2616:9594) shown
// on SOLID toasts — a contrasting tint of the fill so the rail reads against the
// dark surface. brand → #C1DBF1; neutral → #334155 (color.background.neutral.bold).
type VariantSpec = { bg: string; bold: string; icon: string; solid: string; solidBar: string };

// Variant palette — error/warning/info/success/neutral mirror the web toast
// tokens; ai (indigo) and brand (Bajaj #005DAC) extend the set per the design.
const VARIANT: Record<ToastVariant, VariantSpec> = {
  error:   { bg: '#FEE2E2', bold: '#DC2626', icon: '#DC2626', solid: '#DC2626', solidBar: '#FCA5A5' },
  warning: { bg: '#FFFBEB', bold: '#F59E0B', icon: '#D97706', solid: '#D97706', solidBar: '#FCD34D' },
  info:    { bg: '#EFF6FF', bold: '#2563EB', icon: '#2563EB', solid: '#1D4ED8', solidBar: '#93C5FD' },
  success: { bg: '#F7FEE7', bold: '#65A30D', icon: '#65A30D', solid: '#65A30D', solidBar: '#BEF264' },
  ai:      { bg: '#EEF2FF', bold: '#6366F1', icon: '#6366F1', solid: '#4F46E5', solidBar: '#A5B4FC' },
  neutral: { bg: '#F8FAFC', bold: '#334155', icon: '#475569', solid: '#1E293B', solidBar: '#334155' },
  brand:   { bg: '#EFF6FF', bold: '#005DAC', icon: '#005DAC', solid: '#005DAC', solidBar: '#C1DBF1' },
};

function defaultIcon(variant: ToastVariant, color: string): React.ReactNode {
  switch (variant) {
    case 'error':   return <XCircleIcon color={color} />;
    case 'warning': return <AlertTriangleIcon color={color} />;
    case 'info':    return <InfoIcon color={color} />;
    case 'success': return <CheckCircleIcon color={color} />;
    case 'ai':      return <SparkleIcon color={color} />;
    case 'brand':   return <HexagonIcon color={color} />;
    default:        return <HexagonIcon color={color} />;
  }
}

export interface ToastProps {
  /** Bold heading. */
  title: string;
  /** Supporting body line. */
  message?: string;
  /** Semantic colour. Default `neutral`. */
  variant?: ToastVariant;
  /** `light` (tinted) or `solid` (filled, white text). Default `light`. */
  fill?: ToastFill;
  /** `inline` (icon beside heading) or `stacked` (icon above). Default `inline`. */
  layout?: ToastLayout;
  /** Custom leading icon (defaults to the variant icon). */
  icon?: React.ReactNode;
  /** Shows an × dismiss button when provided. */
  onClose?: () => void;
  style?: object;
}

/**
 * Toast — notification banner with a status icon, coloured accent rail (light)
 * or filled surface (solid), heading + body, and a dismiss button. Supports
 * `inline` and `stacked` layouts. Render inside your own timed queue/container.
 */
export const Toast: React.FC<ToastProps> = ({
  title,
  message,
  variant = 'neutral',
  fill = 'light',
  layout = 'inline',
  icon,
  onClose,
  style,
}) => {
  const v = VARIANT[variant];
  const solid = fill === 'solid';
  const surface = solid ? v.solid : v.bg;
  const iconColor = solid ? '#FFFFFF' : v.icon;
  const titleColor = solid ? '#FFFFFF' : '#1E293B';
  const bodyColor = solid ? 'rgba(255,255,255,0.85)' : '#475569';
  const closeColor = solid ? '#FFFFFF' : '#475569';

  const iconNode = (
    <View style={styles.iconWrap}>{icon ?? defaultIcon(variant, iconColor)}</View>
  );
  const closeNode = onClose ? (
    <Pressable
      onPress={onClose}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel="Dismiss"
      style={styles.close}
    >
      <CloseIcon color={closeColor} size={16} />
    </Pressable>
  ) : null;

  const heading = <Text style={[styles.title, { color: titleColor }]}>{title}</Text>;
  const body = message ? (
    <Text style={[styles.body, { color: bodyColor }]}>{message}</Text>
  ) : null;

  return (
    <View style={[styles.toast, { backgroundColor: surface }, style]}>
      {/* Left colour-indicator bar — shown for BOTH fills (Figma "Color
          Indicator Bar"). Light uses the bold accent; solid uses a contrasting
          tint (solidBar) so the rail stays visible on the filled surface. */}
      <View style={[styles.rail, { backgroundColor: solid ? v.solidBar : v.bold }]} />

      {layout === 'inline' ? (
        <View style={styles.inlineRow}>
          {iconNode}
          <View style={styles.inlineContent}>
            {heading}
            {body}
          </View>
          {closeNode}
        </View>
      ) : (
        <View style={styles.stacked}>
          {closeNode ? <View style={styles.stackedClose}>{closeNode}</View> : null}
          {iconNode}
          {heading}
          {body}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  toast: {
    alignSelf: 'stretch',
    borderRadius: 8,
    overflow: 'hidden',
    paddingVertical: 14,
    paddingHorizontal: 16,
    // Web --shadow-toast: 0 1px 4px rgba(10,13,18,0.05).
    shadowColor: '#0A0D12',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  rail: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3 },

  // Inline: icon column + content + close, top-aligned.
  inlineRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  inlineContent: { flex: 1, gap: 4, paddingTop: 1 },

  // Stacked: icon, heading, body in a column; close pinned top-right.
  stacked: { gap: 6 },
  stackedClose: { position: 'absolute', top: 0, right: 0, zIndex: 1 },

  iconWrap: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: typography.fontFamily, fontSize: 16, lineHeight: 24, fontWeight: '500' },
  body: { fontFamily: typography.fontFamily, fontSize: 14, lineHeight: 20, fontWeight: '400' },
  close: { width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
});
