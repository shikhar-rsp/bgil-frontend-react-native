import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, colors, spacing, typography } from '@atlas-ds/react-native';
import { DashboardHeader } from '../../components/dashboard/sections/DashboardHeader';
import { DashboardSidebarNav } from '../../components/dashboard/sections/DashboardSidebarNav';
import { YourInsights } from '../../components/dashboard/sections/YourInsights';
import { WhatsNew } from '../../components/dashboard/sections/WhatsNew';
import { QuickQuotes } from '../../components/dashboard/sections/QuickQuotes';
import { YourToolkit } from '../../components/dashboard/sections/YourToolkit';
import { AssistantInsights } from '../../components/dashboard/sections/AssistantInsights';
import { ObboardingModal } from '../../components/dashboard/sections/ObboardingModal';
import { BusinessScreen } from './BusinessScreen';
import { clearTokenValues } from '../../../utils/tokenStorage';
import type { AuthScreenProps } from '../../../navigation';

/**
 * Agent dashboard — Home view. Ports the web DashboardLayout's "Home" surface
 * (header, nav drawer, insights/whats-new/quick-quotes/toolkit/assistant) plus
 * the onboarding modal. The "Business" tab (quote-creation wizards) is a separate
 * follow-on vertical; selecting it shows a placeholder for now.
 *
 * The walkthrough/coach-mark tour is represented as a demo toggle that fills the
 * insight cards with sample figures (`isWalkthroughActive`), matching the web's
 * populated walkthrough state without the positioned coach-marks.
 */
export const DashboardScreen: React.FC<AuthScreenProps<'Dashboard'>> = ({ navigation }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState('Home');
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
      <DashboardHeader
        onMenuClick={() => setDrawerOpen(true)}
        search={search}
        onSearchChange={setSearch}
        onLogout={handleLogout}
      />

      {selectedItem === 'Home' ? (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <YourInsights isWalkthroughActive={tourActive} />
          <WhatsNew />
          <QuickQuotes onNavigateToQuote={() => setSelectedItem('Business')} />
          <YourToolkit />
          <AssistantInsights isWalkthroughActive={tourActive} />
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

      <DashboardSidebarNav
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        selectedItem={selectedItem}
        onSelectItem={handleSelectItem}
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
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xl },
  placeholderTitle: { fontFamily: typography.fontFamily, fontSize: 24, fontWeight: '600', color: colors.textHeading },
  placeholderBody: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textBody, textAlign: 'center' },
});
