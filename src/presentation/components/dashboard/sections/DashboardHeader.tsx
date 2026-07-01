import React from 'react';
import { View, Image, Pressable, StyleSheet } from 'react-native';
import { List, Bell, SignOut, User } from 'phosphor-react-native';
import {
  AvatarDropdown,
  AvatarDropdownItem,
  SearchBar,
  colors,
  spacing,
  shadow,
} from '@atlas-ds/react-native';
import { dashboardImages } from '../images';

interface DashboardHeaderProps {
  onMenuClick: () => void;
  search: string;
  onSearchChange: (text: string) => void;
  /** Called when the user taps "Log Out" in the avatar menu. */
  onLogout: () => void;
  /** Name shown in the avatar menu header. */
  userName?: string;
  userSubtext?: string;
}

/** Top app bar: menu, logo, search, notifications, avatar menu (with logout). */
export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onMenuClick,
  search,
  onSearchChange,
  onLogout,
  userName = 'Rajesh Chaurasia',
  userSubtext = 'IMD10234',
}) => (
  <View style={styles.header}>
    <View style={styles.left}>
      <Pressable onPress={onMenuClick} accessibilityRole="button" accessibilityLabel="Open menu" hitSlop={8}>
        <List size={24} color={colors.textBody} />
      </Pressable>
      <Image source={dashboardImages.logo} style={styles.logo} resizeMode="contain" />
    </View>

    <View style={styles.search}>
      <SearchBar value={search} onChangeText={onSearchChange} placeholder="Search" />
    </View>

    <View style={styles.right}>
      <Pressable accessibilityRole="button" accessibilityLabel="Notifications" hitSlop={8}>
        <Bell size={22} color={colors.textBody} />
      </Pressable>
      <AvatarDropdown
        avatarSize="sm"
        avatarSource={dashboardImages.rmProfile}
        avatarName={userName}
        avatarSubtext={userSubtext}
      >
        <AvatarDropdownItem icon={<User size={18} color={colors.textBody} />} onPress={() => undefined}>
          My Profile
        </AvatarDropdownItem>
        <AvatarDropdownItem icon={<SignOut size={18} color={colors.dangerText} />} danger onPress={onLogout}>
          Log Out
        </AvatarDropdownItem>
      </AvatarDropdown>
    </View>
  </View>
);

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    ...shadow.lg,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  logo: { width: 96, height: 32 },
  search: { flex: 1 },
  right: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
});
