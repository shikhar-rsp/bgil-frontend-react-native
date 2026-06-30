import React from 'react';
import { View, Image, Pressable, StyleSheet } from 'react-native';
import { List, Bell } from 'phosphor-react-native';
import { Avatar, SearchBar, colors, spacing, shadow } from '@atlas-ds/react-native';
import { dashboardImages } from '../images';

interface DashboardHeaderProps {
  onMenuClick: () => void;
  search: string;
  onSearchChange: (text: string) => void;
}

/** Top app bar: menu, logo, search, notifications, avatar. */
export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onMenuClick,
  search,
  onSearchChange,
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
      <Avatar size="sm" type="image" source={dashboardImages.rmProfile} name="Agent" />
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
