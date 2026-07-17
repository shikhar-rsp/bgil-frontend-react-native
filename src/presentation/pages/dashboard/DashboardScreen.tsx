import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, User, SignOut } from 'phosphor-react-native';
import {
  Button,
  BottomNav,
  SegmentedControl,
  SearchBar,
  AvatarDropdown,
  AvatarDropdownItem,
  colors,
  spacing,
  typography,
  shadow,
  type BottomNavItem,
} from '@atlas-ds/react-native';
import { YourInsights } from '../../components/dashboard/sections/YourInsights';
import { QuickQuotes } from '../../components/dashboard/sections/QuickQuotes';
import { YourToolkit } from '../../components/dashboard/sections/YourToolkit';
import { AssistantInsights } from '../../components/dashboard/sections/AssistantInsights';
import { TodaysTasks } from '../../components/dashboard/sections/TodaysTasks';
import { ObboardingModal } from '../../components/dashboard/sections/ObboardingModal';
import { BusinessScreen } from './BusinessScreen';
import { clearTokenValues } from '../../../utils/tokenStorage';
import type { AuthScreenProps } from '../../../navigation';

/** Bottom-nav tabs — split 2 + 2 around the centre AI button. */
const NAV_ITEMS: BottomNavItem[] = [
  { key: 'Home', label: 'Home', iconName: 'home' },
  { key: 'Business', label: 'Business', iconName: 'bank' },
  { key: 'Customer', label: 'Customer', iconName: 'user' },
  { key: 'More', label: 'More', iconName: 'grid' },
];

/** Home sub-tabs, driven by the segmented control. */
const HOME_TABS = [
  { label: 'Tools', value: 'tools' },
  { label: 'Insights', value: 'insights' },
  { label: 'Tasks', value: 'tasks' },
];

/**
 * Agent dashboard. The top section is an avatar + search + notifications row
 * with a Tools / Insights / Tasks segmented control; the bottom nav switches
 * the primary surface (Home / Business / …). This layout is agent-only.
 */
export const DashboardScreen: React.FC<AuthScreenProps<'Dashboard'>> = ({ navigation }) => {
  const [selectedItem, setSelectedItem] = useState('Home');
  const [homeTab, setHomeTab] = useState('tools');
  const [search, setSearch] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [tourActive, setTourActive] = useState(false);

  const handleLogout = () => {
    clearTokenValues();
    navigation.reset({ index: 0, routes: [{ name: 'DesignationSelect' }] });
  };

  const startWalkthrough = () => {
    setShowOnboarding(false);
    setTourActive(true);
  };

  const handleSelectItem = (id: string) => {
    if (id === 'Home' && selectedItem !== 'Home') {
      setTourActive(false);
    }
    setSelectedItem(id);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Top section — avatar, search, notifications + Home segmented control. */}
      <View style={styles.header}>
        <View style={styles.topRow}>
          <AvatarDropdown avatarSize="md" avatarInitials="OR" avatarName="Rajesh Chaurasia" avatarSubtext="IMD10234">
            <AvatarDropdownItem icon={<User size={18} color={colors.textBody} />} onPress={() => undefined}>
              My Profile
            </AvatarDropdownItem>
            <AvatarDropdownItem icon={<SignOut size={18} color={colors.dangerText} />} danger onPress={handleLogout}>
              Log Out
            </AvatarDropdownItem>
          </AvatarDropdown>

          <View style={styles.searchWrap}>
            <SearchBar value={search} onChangeText={setSearch} placeholder="Search" />
          </View>

          <View style={styles.bellWrap}>
            <Button
              iconOnly
              variant="secondaryGray"
              size="md"
              label="Notifications"
              leadingIcon={<Bell size={20} color={colors.textBody} />}
              onPress={() => undefined}
            />
            <View style={styles.notifDot} />
          </View>
        </View>

        {selectedItem === 'Home' ? (
          <SegmentedControl options={HOME_TABS} value={homeTab} onChange={setHomeTab} />
        ) : null}
      </View>

      <View style={styles.body}>
        {selectedItem === 'Home' ? (
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {homeTab === 'tools' ? (
              <>
                <QuickQuotes onNavigateToQuote={() => setSelectedItem('Business')} />
                <YourToolkit />
                <AssistantInsights isWalkthroughActive={tourActive} />
              </>
            ) : homeTab === 'insights' ? (
              <YourInsights isWalkthroughActive={tourActive} />
            ) : (
              <TodaysTasks />
            )}
          </ScrollView>
        ) : selectedItem === 'Business' ? (
          <BusinessScreen />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderTitle}>{selectedItem}</Text>
            <Text style={styles.placeholderBody}>
              This section is part of a later porting phase.
            </Text>
            <Button label="Back to Home" variant="secondaryGray" onPress={() => handleSelectItem('Home')} />
          </View>
        )}
      </View>

      <BottomNav
        items={NAV_ITEMS}
        activeKey={selectedItem}
        onChange={handleSelectItem}
        center={{ onPress: () => handleSelectItem('MyAI'), accessibilityLabel: 'MyAI assistant' }}
      />

      <ObboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onStartWalkthrough={startWalkthrough}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceSubtle },
  // White header block (top row + segmented control) with a soft bottom lift.
  header: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
    ...shadow.lg,
    zIndex: 2,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  searchWrap: { flex: 1 },
  bellWrap: { position: 'relative' },
  // Unread indicator on the bell button.
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
  body: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xl },
  placeholderTitle: { fontFamily: typography.fontFamily, fontSize: 24, fontWeight: '600', color: colors.textHeading },
  placeholderBody: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textBody, textAlign: 'center' },
});
