import * as React from 'react';
import { View, Text, Image, Pressable, StyleSheet, Platform } from 'react-native';
import type { ViewStyle, StyleProp, ImageSourcePropType } from 'react-native';
import { UserCircle } from 'phosphor-react-native';
import { typography } from '../../theme';

// Active (hover/press) ring on the add button — the shared "prescribed" state
// CSS: a soft neutral-grey ring (mirrors OTP-input web `--otp-shadow-ring`).
const addActiveRing = Platform.select({
  web: { boxShadow: '0px 1px 2px 0px rgba(10, 13, 18, 0.05), 0px 0px 0px 4px #F1F5F9' },
  default: {
    shadowColor: '#0A0D12',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
}) as object;

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AvatarType = 'image' | 'text' | 'icon' | 'skeleton';

/* ===== Tokens — mirror of `@atlas-ds/css` avatar tokens ===== */
const SIZE: Record<AvatarSize, number> = { xs: 24, sm: 32, md: 40, lg: 48, xl: 56 };
const FONT: Record<AvatarSize, number> = { xs: 12, sm: 14, md: 16, lg: 20, xl: 24 };
const STATUS: Record<AvatarSize, number> = { xs: 6, sm: 10, md: 10, lg: 14, xl: 14 };
const ICON_PAD: Record<AvatarSize, number> = { xs: 1.5, sm: 1.87, md: 2.25, lg: 3, xl: 3.75 };
const ICON_SVG: Record<AvatarSize, number> = { xs: 13, sm: 16.25, md: 19.5, lg: 26, xl: 32.5 };

const COLOR = {
  bg: '#F8FAFC', // --color-bg-neutral-subtle
  textSubtle: '#475569', // --color-text-subtle
  icon: '#475569', // --color-icon
  border: '#E2E8F0', // --color-border
  borderInverse: '#FFFFFF', // --color-border-inverse
  statusSuccess: '#65A30D', // --color-icon-success
  skeleton: '#E2E8F0',
} as const;

const getInitials = (name: string): string =>
  name
    .split(' ')
    .map((n) => n[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2);

/** Default user silhouette drawn with Views (no icon dep), `--color-icon`. */
export const AvatarUserGlyph: React.FC<{ size: number; color?: string }> = ({
  size,
  color = COLOR.icon,
}) => {
  const head = size * 0.32;
  const body = size * 0.6;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: head,
          height: head,
          borderRadius: head / 2,
          backgroundColor: color,
          marginBottom: size * 0.07,
        }}
      />
      <View
        style={{
          width: body,
          height: body * 0.52,
          borderTopLeftRadius: body / 2,
          borderTopRightRadius: body / 2,
          backgroundColor: color,
        }}
      />
    </View>
  );
};

export interface AvatarProps {
  /** Image URL (web `src`). */
  src?: string;
  /** RN-native image source — alias for `src`. */
  source?: ImageSourcePropType;
  alt?: string;
  /** Full name — derives initials + a11y label. */
  name?: string;
  /** Explicit initials, overriding those from `name`. */
  initials?: string;
  /** Icon node (defaults to a user glyph when `type` is `icon`). */
  icon?: React.ReactNode;
  /** Preset size. Default `md` (40). */
  size?: AvatarSize;
  /** Visual type. Inferred from content when omitted. */
  type?: AvatarType;
  /** Show the status dot. */
  showStatus?: boolean;
  /** Status-dot colour. Default `#65A30D`. */
  statusColor?: string;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * Avatar — circular image / initials / icon / skeleton with an optional status
 * dot. A 1:1 port of `@atlas-ds/react` `<Avatar>`.
 */
export const Avatar: React.FC<AvatarProps> = ({
  src,
  source,
  alt,
  name,
  initials,
  icon,
  size = 'md',
  type,
  showStatus,
  statusColor,
  children,
  style,
}) => {
  const d = SIZE[size];
  const label = alt || name || 'Avatar';

  const resolvedType: AvatarType =
    type ??
    (src || source ? 'image' : initials || name ? 'text' : icon ? 'icon' : 'image');

  const renderInner = () => {
    if (children) return children;
    if (resolvedType === 'image' && (src || source)) {
      return (
        <Image
          source={source ?? { uri: src as string }}
          style={styles.image}
          resizeMode="cover"
          accessibilityLabel={label}
        />
      );
    }
    if (resolvedType === 'icon') {
      return icon ?? <UserCircle size={ICON_SVG[size]} color={COLOR.icon} weight="regular" />;
    }
    if (initials || name) {
      return (
        <Text style={[styles.initials, { fontSize: FONT[size], lineHeight: FONT[size] }]}>
          {initials || (name ? getInitials(name) : '')}
        </Text>
      );
    }
    return null;
  };

  // Status dot: colour centre = STATUS token, with a 2px white ring around it.
  const dot = STATUS[size] + 4;

  return (
    <View style={[{ width: d, height: d }, style]}>
      <View
        style={[
          styles.circle,
          { width: d, height: d, borderRadius: d / 2 },
          resolvedType === 'icon' && [styles.icon, { padding: ICON_PAD[size] }],
          resolvedType === 'skeleton' && styles.skeleton,
        ]}
        accessibilityLabel={label}
      >
        {renderInner()}
      </View>
      {showStatus ? (
        <View
          style={[
            styles.status,
            {
              width: dot,
              height: dot,
              borderRadius: dot / 2,
              backgroundColor: statusColor || COLOR.statusSuccess,
            },
          ]}
        />
      ) : null}
    </View>
  );
};

Avatar.displayName = 'Avatar';

export interface AvatarGroupProps {
  size?: AvatarSize;
  /** Overflow count rendered as a `+N` circle after the avatars. */
  more?: number;
  /** Renders a dashed `+` add circle (set a handler to make it interactive). */
  onAdd?: () => void;
  /** Renders the add circle in its disabled (faded) state. */
  addDisabled?: boolean;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * AvatarGroup — overlapping row of avatars with an optional `+N` overflow circle
 * and a dashed `+` add button. Figma node 73:33514.
 *
 * Sizing (border-box, all circles share one diameter): xs 24 / sm 32 / md 40 …
 * Overlap scales with size — `(d-16)/2` → 4 / 8 / 12 (Figma `mr-[-4/-8/-12]`).
 * The `+N` circle carries a white ring + `#E2E8F0` border on `#F8FAFC`, text
 * sized to the avatar's own font. The `+` add button (set `onAdd`) is unchanged.
 */
export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  size = 'md',
  more,
  onAdd,
  addDisabled = false,
  children,
  style,
}) => {
  const d = SIZE[size];
  const overlap = Math.max(0, (d - 16) / 2); // 24→4, 32→8, 40→12 per Figma
  const addGap = Math.round(d * 0.25); // small gap before the dashed add button
  const plusLen = Math.round(d * 0.4); // plus glyph scales with the circle
  const round = { borderRadius: d / 2 };
  return (
    <View style={[styles.group, style]}>
      {React.Children.toArray(children).map((child, i) => {
        if (!React.isValidElement(child)) return child;
        const el = child as React.ReactElement<AvatarProps>;
        return (
          <View
            key={i}
            style={[styles.avatarItem, { width: d, height: d }, round, i > 0 && { marginLeft: -overlap }]}
          >
            {React.cloneElement(el, { size })}
          </View>
        );
      })}
      {more && more > 0 ? (
        <View style={[styles.moreOuter, { width: d, height: d, marginLeft: -overlap }, round]}>
          <View style={[styles.moreInner, round]}>
            <Text style={[styles.moreText, { fontSize: FONT[size] }]}>+{more}</Text>
          </View>
        </View>
      ) : null}
      {onAdd ? (
        <View style={{ marginLeft: addGap }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add"
            accessibilityState={{ disabled: addDisabled }}
            disabled={addDisabled}
            onPress={onAdd}
            style={(state) => {
              // react-native-web exposes `hovered`/`focused` too — show the ring
              // on hover or press (default) and fade when disabled.
              const st = state as { pressed: boolean; hovered?: boolean; focused?: boolean };
              const active = !addDisabled && (st.pressed || st.hovered || st.focused);
              return [
                styles.add,
                { width: d, height: d },
                round,
                active && addActiveRing,
                addDisabled && styles.addDisabled,
              ];
            }}
          >
            <View style={[styles.plusH, { width: plusLen }, addDisabled && styles.plusDisabled]} />
            <View style={[styles.plusV, { height: plusLen }, addDisabled && styles.plusDisabled]} />
          </Pressable>
        </View>
      ) : null}
    </View>
  );
};

AvatarGroup.displayName = 'AvatarGroup';

const styles = StyleSheet.create({
  circle: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: COLOR.bg,
  },
  image: { width: '100%', height: '100%' },
  initials: {
    color: COLOR.textSubtle,
    textAlign: 'center',
    fontFamily: typography.fontFamily,
    fontWeight: '400',
  },
  icon: { borderWidth: 1, borderColor: COLOR.border },
  skeleton: { backgroundColor: COLOR.skeleton },
  // Status dot sits at the lower-right edge, with a white ring (matches design).
  status: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    borderWidth: 2,
    borderColor: COLOR.borderInverse,
  },

  group: { flexDirection: 'row', alignSelf: 'flex-start', alignItems: 'center' },
  // Each avatar sits in a 1.5px white ring (Figma border.inverse). overflow:hidden
  // clips the avatar to the ring so the overlap reads cleanly.
  avatarItem: {
    borderWidth: 1.5,
    borderColor: COLOR.borderInverse,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // +N overflow — white ring (outer) over a #F8FAFC fill with a #E2E8F0 border.
  moreOuter: {
    borderWidth: 1.5,
    borderColor: COLOR.borderInverse,
    overflow: 'hidden',
  },
  moreInner: {
    flex: 1,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLOR.bg, // #F8FAFC
    borderWidth: 1,
    borderColor: COLOR.border, // #E2E8F0
  },
  moreText: { fontFamily: typography.fontFamily, fontWeight: '400', color: COLOR.textSubtle },
  // Dashed add circle — 1px #CBD5E1 dashed, white fill, plus scales with size.
  add: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1', // --color-border-bold
    backgroundColor: '#FFFFFF',
  },
  plusH: { position: 'absolute', height: 1.5, backgroundColor: '#1E293B' },
  plusV: { position: 'absolute', width: 1.5, backgroundColor: '#1E293B' },
  // Disabled add circle — faded border + light plus.
  addDisabled: { borderColor: '#E2E8F0', opacity: 0.6 },
  plusDisabled: { backgroundColor: '#CBD5E1' },
});
