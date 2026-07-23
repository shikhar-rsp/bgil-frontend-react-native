import React from 'react';
import { View, Pressable, StatusBar, Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { Bell } from 'phosphor-react-native';
import {
  Button,
  SegmentedControl,
  SearchBar,
  Avatar,
  colors,
  spacing,
  shadow,
  type SegmentedOption,
} from '@atlas-ds/react-native';

/** Gradient colour stops for the dashboard header, keyed by persona. */
export const HEADER_GRADIENTS = {
  /** Agent — "platinum" (cool blue tint). */
  platinum: ['#FFFFFF', '#EFF6FF', '#E0E7FF', '#EFF6FF'],
  /** Trainee — "silver" (neutral grey). */
  silver: ['#FFFFFF', '#F1F5F9', '#CBD5E1', '#F1F5F9'],
} as const;

const GRADIENT_LOCATIONS = [0, 0.2816, 0.6073, 1];

interface DashboardTopBarProps {
  /** Gradient colour stops (see {@link HEADER_GRADIENTS}). */
  gradientColors: readonly string[];
  avatarInitials?: string;
  onProfilePress: () => void;
  onSearchPress: () => void;
  onNotificationsPress: () => void;
  /** Segmented control options — omit to hide the strip (e.g. off the Home tab). */
  tabs?: SegmentedOption[];
  activeTab?: string;
  onTabChange?: (value: string) => void;
}

/**
 * Shared dashboard header: a gradient block (behind the status bar) with an
 * avatar, a search trigger, a notifications button, and an optional Home
 * segmented control. Agent and Trainee share it — only the gradient differs.
 */
export const DashboardTopBar: React.FC<DashboardTopBarProps> = ({
  gradientColors,
  avatarInitials = 'OR',
  onProfilePress,
  onSearchPress,
  onNotificationsPress,
  tabs,
  activeTab,
  onTabChange,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
      {/* Background-only: on iOS/Fabric a LinearGradient that owns its own
          children can paint its native gradient layer over them, leaving the
          content invisible. Keeping it as an absolutely-positioned sibling
          behind a plain content View sidesteps that paint-order issue. */}
      <LinearGradient
        useAngle
        angle={104}
        colors={gradientColors as string[]}
        locations={GRADIENT_LOCATIONS}
        style={StyleSheet.absoluteFillObject}
      />

      {/* `translucent` / `backgroundColor` are Android-only. On iOS the gradient
          reaches the status bar because this view starts at y=0 and pads its
          content by the safe-area inset instead. */}
      <StatusBar
        barStyle="dark-content"
        {...(Platform.OS === 'android' ? { translucent: true, backgroundColor: 'transparent' } : null)}
      />

      <View style={styles.topRow}>
        <Pressable onPress={onProfilePress} accessibilityRole="button" accessibilityLabel="Profile" hitSlop={6}>
          {/* Opaque backing so the gradient doesn't tint the avatar. */}
          <View style={styles.avatarBacking}>
            <Avatar size="md" type="text" initials={avatarInitials} />
          </View>
        </Pressable>

        <Pressable
          style={styles.searchWrap}
          onPress={onSearchPress}
          accessibilityRole="button"
          accessibilityLabel="Search"
        >
          <View pointerEvents="none">
            <SearchBar value="" onChangeText={() => undefined} placeholder="Search" />
          </View>
        </Pressable>

        <View style={styles.bellWrap}>
          <Button
            iconOnly
            variant="secondaryGray"
            size="md"
            label="Notifications"
            leadingIcon={<Bell size={20} color={colors.textBody} />}
            onPress={onNotificationsPress}
            style={styles.bellButton}
          />
          <View style={styles.notifDot} />
        </View>
      </View>

      {tabs ? (
        <SegmentedControl size="sm" options={tabs} value={activeTab ?? tabs[0]?.value} onChange={onTabChange} />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.md,
    ...shadow.lg,
    zIndex: 2,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatarBacking: { backgroundColor: colors.surfaceSubtle, borderRadius: 20, borderColor: colors.borderSubtle, },
  searchWrap: { flex: 1 },
  bellWrap: { position: 'relative' },
  bellButton: { backgroundColor: colors.surface },
  notifDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.danger,
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
});
