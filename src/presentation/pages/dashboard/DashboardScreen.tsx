import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Button, BottomNav, colors, spacing, typography, type BottomNavItem } from '@atlas-ds/react-native';
import { DashboardTopBar, HEADER_GRADIENTS } from '../../components/dashboard/sections/DashboardTopBar';
import { YourInsights } from '../../components/dashboard/sections/YourInsights';
import { QuickQuotes } from '../../components/dashboard/sections/QuickQuotes';
import { YourToolkit } from '../../components/dashboard/sections/YourToolkit';
import { AssistantInsights } from '../../components/dashboard/sections/AssistantInsights';
import { TodaysTasks } from '../../components/dashboard/sections/TodaysTasks';
import { WhatsNew } from '../../components/dashboard/sections/WhatsNew';
import { SearchPanel } from '../../components/dashboard/sections/SearchPanel';
import { ObboardingModal } from '../../components/dashboard/sections/ObboardingModal';
import { BusinessScreen } from './BusinessScreen';
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
  const [searchOpen, setSearchOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [tourActive, setTourActive] = useState(false);

  const openProfile = () =>
    navigation.navigate('Profile', {
      persona: 'agent',
      userName: 'Rajesh Chaurasia',
      userId: 'BA78631498',
      userInitials: 'RC',
    });

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
    <View style={styles.safe}>
      <DashboardTopBar
        gradientColors={HEADER_GRADIENTS.platinum}
        onProfilePress={openProfile}
        onSearchPress={() => setSearchOpen(true)}
        onNotificationsPress={() => navigation.navigate('Notifications')}
        tabs={selectedItem === 'Home' ? HOME_TABS : undefined}
        activeTab={homeTab}
        onTabChange={setHomeTab}
      />

      <View style={styles.body}>
        {selectedItem === 'Home' ? (
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {homeTab === 'tools' ? (
              <>
                <QuickQuotes onNavigateToQuote={() => setSelectedItem('Business')} />
                <WhatsNew />
                <YourToolkit />
                {/* <AssistantInsights isWalkthroughActive={tourActive} /> */}
              </>
            ) : homeTab === 'insights' ? (
              <>
              <YourInsights isWalkthroughActive={tourActive} />
              <WhatsNew />
              </>
              
            ) : (
              <>
              <TodaysTasks />
              <WhatsNew />
              </>
              
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


      <SearchPanel visible={searchOpen} onClose={() => setSearchOpen(false)} />

      <ObboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onStartWalkthrough={startWalkthrough}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceSubtle },
  body: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xl },
  placeholderTitle: { fontFamily: typography.fontFamily, fontSize: 24, fontWeight: '600', color: colors.textHeading },
  placeholderBody: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textBody, textAlign: 'center' },
});
