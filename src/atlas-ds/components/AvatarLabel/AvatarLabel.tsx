import * as React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import type { ViewStyle, StyleProp, ImageSourcePropType } from 'react-native';
import { typography } from '../../theme';
import { Avatar } from '../Avatar';

export type AvatarLabelSize = 'sm' | 'md' | 'lg' | 'xl';

/* ===== Tokens — mirror of `@atlas-ds/css` avatar-label tokens ===== */
const SPEC: Record<AvatarLabelSize, { height: number; text: number; subtext: number }> = {
  sm: { height: 36, text: 14, subtext: 12 },
  md: { height: 40, text: 14, subtext: 12 },
  lg: { height: 48, text: 16, subtext: 14 },
  xl: { height: 56, text: 20, subtext: 16 },
};
const AVATAR_SIZE: Record<AvatarLabelSize, number> = { sm: 32, md: 40, lg: 48, xl: 56 };

const COLOR = {
  name: '#1E293B', // --avatar-label-font-primary
  email: '#475569', // --avatar-label-font-secondary
  skeleton: '#F1F5F9', // --avatar-label-loading-bg
} as const;

export interface AvatarLabelProps {
  size?: AvatarLabelSize;
  /** Skeleton loading state. */
  loading?: boolean;
  /** Image URL (web `avatarUrl`). */
  avatarUrl?: string;
  /** RN-native image source — alias for `avatarUrl`. */
  avatarSource?: ImageSourcePropType;
  name?: string;
  initials?: string;
  avatarIcon?: React.ReactNode;
  /** Primary line. Falls back to `name`. */
  text?: string;
  /** Secondary line (e.g. email). */
  subtext?: string;
  showStatus?: boolean;
  statusColor?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * AvatarLabel — avatar + name/email row, sizes sm–xl, with a skeleton loading
 * state. A port of `@atlas-ds/react` `<AvatarLabel>`.
 */
export const AvatarLabel: React.FC<AvatarLabelProps> = ({
  size = 'md',
  loading = false,
  avatarUrl,
  avatarSource,
  name,
  initials,
  avatarIcon,
  text,
  subtext,
  showStatus,
  statusColor,
  onPress,
  style,
}) => {
  const spec = SPEC[size];
  const av = AVATAR_SIZE[size];
  const Wrapper: React.ElementType = onPress && !loading ? Pressable : View;
  const primary = text || name;

  if (loading) {
    return (
      <View style={[styles.root, { height: spec.height }, style]}>
        <View style={[styles.skeletonAvatar, { width: av, height: av, borderRadius: av / 2 }]} />
        <View style={styles.info}>
          <View style={[styles.skeletonPill, { width: 96, height: spec.text - 2 }]} />
          <View style={[styles.skeletonPill, { width: 64, height: spec.subtext - 2, marginTop: 6 }]} />
        </View>
      </View>
    );
  }

  return (
    <Wrapper
      {...(onPress ? { onPress, accessibilityRole: 'button' } : {})}
      style={[styles.root, { height: spec.height }, style]}
    >
      <Avatar
        size={size}
        src={avatarUrl}
        source={avatarSource}
        name={name || primary}
        initials={initials}
        icon={avatarIcon}
        type={avatarIcon ? 'icon' : undefined}
        showStatus={showStatus}
        statusColor={statusColor}
      />
      {(primary || subtext) && (
        <View style={styles.info}>
          {primary ? (
            <Text style={[styles.name, { fontSize: spec.text }]} numberOfLines={1}>
              {primary}
            </Text>
          ) : null}
          {subtext ? (
            <Text style={[styles.email, { fontSize: spec.subtext }]} numberOfLines={1}>
              {subtext}
            </Text>
          ) : null}
        </View>
      )}
    </Wrapper>
  );
};

AvatarLabel.displayName = 'AvatarLabel';

const styles = StyleSheet.create({
  root: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 8 },
  info: { flexDirection: 'column', justifyContent: 'center' },
  name: { color: COLOR.name, fontFamily: typography.fontFamily, fontWeight: '500', lineHeight: 20 },
  email: { color: COLOR.email, fontFamily: typography.fontFamily, fontWeight: '400', lineHeight: 16 },
  skeletonAvatar: { backgroundColor: COLOR.skeleton },
  skeletonPill: { backgroundColor: COLOR.skeleton, borderRadius: 100 },
});
