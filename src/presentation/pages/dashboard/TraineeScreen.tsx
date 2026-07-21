import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Button, BottomNav, colors, spacing, typography, type BottomNavItem } from '@atlas-ds/react-native';
import { DashboardTopBar, HEADER_GRADIENTS } from '../../components/dashboard/sections/DashboardTopBar';
import { QuickQuotes } from '../../components/dashboard/sections/QuickQuotes';
import { YourToolkit } from '../../components/dashboard/sections/YourToolkit';
import { NotificationsPanel } from '../../components/dashboard/sections/NotificationsPanel';
import { SearchPanel } from '../../components/dashboard/sections/SearchPanel';
import {
  TraineeInsights,
  Leaderboard,
  TrainingSchedule,
  ResourcesAndBrochures,
  TraineeBusinessInsights,
} from '../../components/dashboard/trainee/TraineeSections';
import { BookTraining } from '../../components/dashboard/trainee/BookTraining';
import type { AuthScreenProps } from '../../../navigation';

/** Bottom-nav tabs — split 2 + 2 around the centre AI button. */
const NAV_ITEMS: BottomNavItem[] = [
  { key: 'Home', label: 'Home', iconName: 'home' },
  { key: 'Business', label: 'Business', iconName: 'bank' },
  { key: 'Customer', label: 'Customer', iconName: 'user' },
  { key: 'More', label: 'More', iconName: 'grid' },
];

/** Home sub-tabs — trainee swaps the agent's "Tasks" for "Training". */
const HOME_TABS = [
  { label: 'Tools', value: 'tools' },
  { label: 'Insights', value: 'insights' },
  { label: 'Training', value: 'training' },
];

/**
 * Trainee dashboard. Shares the agent header (silver gradient instead of
 * platinum) and reuses existing sections — trainee insights + leaderboard,
 * training schedule, quick quotes, toolkit, and resources.
 */
export const TraineeScreen: React.FC<AuthScreenProps<'Trainee'>> = ({ navigation }) => {
  const [selectedItem, setSelectedItem] = useState('Home');
  const [homeTab, setHomeTab] = useState('tools');
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [bookOpen, setBookOpen] = useState(false);

  const openProfile = () =>
    navigation.navigate('Profile', {
      persona: 'trainee',
      userName: 'Trainee Agent',
      userId: 'TR-2024',
      userInitials: 'OR',
    });

  return (
    <View style={styles.safe}>
      <DashboardTopBar
        gradientColors={HEADER_GRADIENTS.silver}
        onProfilePress={openProfile}
        onSearchPress={() => setSearchOpen(true)}
        onNotificationsPress={() => setNotifOpen(true)}
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
                <YourToolkit />
                <ResourcesAndBrochures />
              </>
            ) : homeTab === 'insights' ? (
              <>
                <TraineeInsights />
                <Leaderboard />
              </>
            ) : (
              <TrainingSchedule onScheduleSession={() => setBookOpen(true)} />
            )}
          </ScrollView>
        ) : selectedItem === 'Business' ? (
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <TraineeBusinessInsights />
          </ScrollView>
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderTitle}>{selectedItem}</Text>
            <Text style={styles.placeholderBody}>This section is part of a later porting phase.</Text>
            <Button label="Back to Home" variant="secondaryGray" onPress={() => setSelectedItem('Home')} />
          </View>
        )}
      </View>

      <BottomNav
        items={NAV_ITEMS}
        activeKey={selectedItem}
        onChange={setSelectedItem}
        center={{ onPress: () => setSelectedItem('MyAI'), accessibilityLabel: 'MyAI assistant' }}
      />

      <NotificationsPanel visible={notifOpen} onClose={() => setNotifOpen(false)} />

      <SearchPanel visible={searchOpen} onClose={() => setSearchOpen(false)} />

      <BookTraining isOpen={bookOpen} onClose={() => setBookOpen(false)} />
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
