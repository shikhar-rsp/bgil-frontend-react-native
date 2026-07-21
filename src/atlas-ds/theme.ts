import { Platform } from 'react-native';

/**
 * Atlas (BGIL) design tokens — React Native edition.
 *
 * Source of truth: `@atlas-ds/tokens` (CSS custom properties). Because RN cannot
 * read CSS variables, we mirror the relevant subset of tokens as plain JS values
 * here. When a token changes upstream, mirror it here too.
 *
 * Hex codes below match the Figma calendar spec (node 6527:8293) which is the
 * canonical brand palette. They intentionally differ from some legacy CSS
 * variable values in `@atlas-ds/css` (e.g. older `--color-blue-600`).
 */

export const colors = {
  // Surfaces
  surface:        '#FFFFFF',
  surfaceSubtle:  '#F8FAFC',
  surfaceMuted:   '#F1F5F9',

  // Borders
  border:         '#CBD5E1',
  borderSubtle:   '#E2E8F0',

  // Text
  textHeading:    '#1E293B',
  textBody:       '#475569',
  textMuted:      '#94A3B8',
  textDisabled:   '#CBD5E1',
  textOnBrand:    '#FFFFFF',

  // Brand (Bajaj blue)
  brand:          '#005DAC',
  brandPressed:   '#004E91',
  brandSubtle:    '#E8F4FF',
  brandBlue400:   '#4D8FC8', // CSS --brandblue400 / --color-blue-400

  // Status
  danger:         '#DC2626', // color.background/border.danger.bold
  dangerText:     '#B91C1C', // color.text.danger — danger text on outlined/text buttons
  success:        '#16A34A',
  warning:        '#D97706',
} as const;

export const radius = {
  none: 0,
  xs:   2,
  sm:   4,
  md:   6,
  lg:   8,
  xl:   12,
  full: 9999,
} as const;

export const spacing = {
  xxs: 2,
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  24,
  xxl: 32,
} as const;

/**
 * Rubik (per Figma). Apps must register the family at app boot
 * (e.g. Expo `useFonts({ Rubik_400Regular, ... })`). If a weight is unavailable
 * RN will fall back to the system font — visually close but not identical.
 */
export const typography = {
  fontFamily: 'Rubik',
  body1: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
  body2: { fontSize: 14, lineHeight: 20, fontWeight: '400' as const },
  body3: { fontSize: 12, lineHeight: 16, fontWeight: '400' as const },
  heading: { fontSize: 14, lineHeight: 20, fontWeight: '500' as const },
} as const;

/**
 * Map a numeric/string fontWeight to the matching bundled Rubik face.
 *
 * Android can't synthesise intermediate weights (e.g. Medium/500) from the base
 * `Rubik` family — `fontFamily: 'Rubik'` + `fontWeight: '500'` silently falls
 * back to Regular. Referencing the weight's own font file by name loads the
 * correct face on Android and is also the right PostScript name on iOS.
 *
 * Prefer this over a bare `fontWeight` whenever the weight is 500+:
 *   { fontFamily: fontFamilyForWeight('500'), fontSize: 20 }
 *
 * Only three Rubik faces are bundled (400/500/700), so weights round the way
 * CSS font-matching would: 500 → Medium, and anything above 500 (e.g. semibold
 * 600) rounds up to Bold since there is no face between Medium and Bold.
 */
export const fontFamilyForWeight = (weight?: string | number): string => {
  const w = typeof weight === 'string' ? parseInt(weight, 10) || 400 : weight ?? 400;
  if (w > 500) return 'Rubik-Bold';
  if (w >= 500) return 'Rubik-Medium';
  return 'Rubik-Regular';
};

export const shadow = {
  /**
   * Card shadow — Figma "Shadow/Small", which stacks two layers:
   *   0 1 2 0 #0A0D12 @ 6%   +   0 1 4 0 #0A0D12 @ 10%
   *
   * React Native draws a single shadow per view, so this takes the dominant
   * layer's offset/blur and folds both opacities together.
   */
  lg: {
    shadowColor: '#0A0D12',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2, // Android
  },
} as const;

/**
 * Removes the browser's focus outline ("black box" on click) that
 * react-native-web puts on the underlying `<input>`/`<textarea>`. Spread this
 * onto any `TextInput` style: `style={[styles.input, noFocusOutline]}`.
 *
 * `outline*` are web-only style keys, so we guard behind `Platform.OS` — on
 * native this resolves to an empty object and is a no-op (no invalid-style
 * warning). Native focus rings, where they exist, are controlled separately.
 */
export const noFocusOutline = Platform.OS === 'web'
  ? ({ outlineStyle: 'none', outlineWidth: 0 } as any)
  : ({} as any);

/** Default input shadow — 0px 1px 2px #0A0D120D */
export const inputShadowDefault = Platform.select({
  web: { boxShadow: '0px 1px 2px 0px rgba(10, 13, 18, 0.05)' },
  default: {
    shadowColor: '#0A0D12',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
}) as object;

/** Focus/active — same border + base shadow plus 4px #F1F5F9 ring (--slateneutrals100). */
export const inputShadowFocus = Platform.select({
  web: {
    boxShadow: `0px 1px 2px 0px rgba(10, 13, 18, 0.05), 0px 0px 0px 4px ${colors.surfaceMuted}`,
  },
  default: {
    shadowColor: '#0A0D12',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 3,
  },
}) as object;

/** Focus-visible ring shared by OtpInput, Tag, etc. Border stays #CBD5E1; ring shows focus. */
export const inputFocusVisibleRing = Platform.select({
  web: {
    boxShadow: `0px 0px 0px 1px ${colors.surface}, 0px 0px 0px 4px ${colors.brandBlue400}`,
  },
  default: {
    shadowColor: colors.brandBlue400,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
  },
}) as object;

/**
 * Accent palette for status/label components (Badge, BadgeDot, Tag, Lozenge).
 * Mirrors `@atlas-ds/css` badge tokens: `solidBg` = `<color>-600`, `lightBg` =
 * `<color>-50`, `lightText` = `<color>-600`. Solid text is always white.
 */
export const accent = {
  red:     { solidBg: '#DC2626', lightBg: '#FEF2F2' },
  amber:   { solidBg: '#D97706', lightBg: '#FFFBEB' },
  lime:    { solidBg: '#65A30D', lightBg: '#F7FEE7' },
  blue:    { solidBg: '#2563EB', lightBg: '#EFF6FF' },
  neutral: { solidBg: '#334155', lightBg: '#F1F5F9' },
  brand:   { solidBg: '#005DAC', lightBg: '#E8F4FF' },
  indigo:  { solidBg: '#4F46E5', lightBg: '#EEF2FF' },
  emerald: { solidBg: '#059669', lightBg: '#ECFDF5' },
  teal:    { solidBg: '#0D9488', lightBg: '#F0FDFA' },
  orange:  { solidBg: '#C35F09', lightBg: '#FEF1E7' },
  pink:    { solidBg: '#DB2777', lightBg: '#FDF2F8' },
  violet:  { solidBg: '#7C3AED', lightBg: '#F5F3FF' },
  rose:    { solidBg: '#E11D48', lightBg: '#FFF1F2' },
} as const;

export type AccentColor = keyof typeof accent;

export const theme = { colors, radius, spacing, typography, shadow, accent };
export type Theme = typeof theme;
