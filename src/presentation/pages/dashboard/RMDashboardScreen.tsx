import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { ArrowLeft, ListChecks } from 'phosphor-react-native';
import {
  BottomNav,
  Button,
  MoreMenu,
  ToastGlobal,
  colors,
  spacing,
  typography,
  type BottomNavItem,
} from '@atlas-ds/react-native';
import { DashboardTopBar, HEADER_GRADIENTS } from '../../components/dashboard/sections/DashboardTopBar';
import { WhatsNew } from '../../components/dashboard/sections/WhatsNew';
import { YourToolkit } from '../../components/dashboard/sections/YourToolkit';
import { QuickQuotes } from '../../components/dashboard/sections/QuickQuotes';
import { YourInsights } from '../../components/dashboard/sections/YourInsights';
import { AssistantInsights } from '../../components/dashboard/sections/AssistantInsights';
import { TodaysTasks } from '../../components/dashboard/sections/TodaysTasks';
import { SearchPanel } from '../../components/dashboard/sections/SearchPanel';
import { buildMoreMenuItems } from '../../components/dashboard/sections/moreMenuItems';
import {
  GoalsSheet,
  ConsolidatedPremium,
  FocusLOBs,
  AgentsData,
} from '../../components/dashboard/rm/RmSections';
import type { AuthScreenProps } from '../../../navigation';

/** RM's own sub-tabs. */
const RM_TABS = [
  { label: 'Goals', value: 'goals' },
  { label: 'Insights', value: 'insights' },
];

/** Agent-view sub-tabs — identical to the agent dashboard. */
const AGENT_TABS = [
  { label: 'Tools', value: 'tools' },
  { label: 'Insights', value: 'insights' },
  { label: 'Tasks', value: 'tasks' },
];

/** RM toolkit shortcuts — same as the agent set minus "Learning". */
const RM_TOOLS = ['Brochures', 'Calculators', 'Campaigns', 'Query Tracker'];

/** Bottom nav is only shown while viewing an agent's dashboard. */
const NAV_ITEMS: BottomNavItem[] = [
  { key: 'Home', label: 'Home', iconName: 'home' },
  { key: 'Business', label: 'Business', iconName: 'bank' },
  // Phosphor override — BottomNav has no built-in tasks glyph, and custom
  // icons are rendered without recolouring, so both states are supplied.
  {
    key: 'Tasks',
    label: 'Tasks',
    icon: <ListChecks size={24} color={colors.textBody} weight="regular" />,
    activeIcon: <ListChecks size={24} color={colors.brand} weight="fill" />,
  },
  { key: 'More', label: 'More', iconName: 'grid' },
];

/**
 * Relationship Manager dashboard.
 *
 * Default: Goals (goal sheet + what's new + toolkit) and Insights (consolidated
 * premium, focus LOBs, agent data), with no bottom navigation.
 *
 * Picking an agent on the profile page switches to "viewing agent" mode, which
 * mirrors the agent dashboard exactly — Tools / Insights / Tasks plus the bottom
 * nav — differing only in the toolkit's customise / manage-tool / Learning bits.
 */
export const RMDashboardScreen: React.FC<AuthScreenProps<'RMDashboard'>> = ({ navigation, route }) => {
  const viewAgent = route.params?.viewAgent;
  const [rmTab, setRmTab] = useState('goals');
  const [agentNav, setAgentNav] = useState('Home');
  const [agentTab, setAgentTab] = useState('tools');
  const [searchOpen, setSearchOpen] = useState(false);
  // The "More" tab opens a popup above the nav instead of switching surface.
  const [moreOpen, setMoreOpen] = useState(false);
  // Agent view is read-only here, so every tile just dismisses the popup.
  const moreItems = buildMoreMenuItems(() => setMoreOpen(false));

  const openProfile = () =>
    navigation.navigate('Profile', {
      persona: 'rm',
      userName: 'Manish Jain',
      userId: 'BA78631498',
      userInitials: 'MJ',
    });

  const exitAgentView = () => navigation.setParams({ viewAgent: undefined });

  // --- Viewing an agent: the agent dashboard, with RM-specific toolkit rules ---
  if (viewAgent) {
    return (
      <View style={styles.safe}>
        <DashboardTopBar
          gradientColors={HEADER_GRADIENTS.platinum}
          avatarInitials="MJ"
          onProfilePress={openProfile}
          onSearchPress={() => setSearchOpen(true)}
          onNotificationsPress={() => navigation.navigate('Notifications')}
          tabs={agentNav === 'Home' ? AGENT_TABS : undefined}
          activeTab={agentTab}
          onTabChange={setAgentTab}
        />

        <View style={styles.viewNotice}>
          <ToastGlobal
            variant="info"
            title={`You are viewing ${viewAgent.name}'s Dashboard`}
            onClose={exitAgentView}
          />
          <Button
            label="Back to main dashboard"
            variant="secondary"
            fullWidth
            leadingIcon={<ArrowLeft size={16} color={colors.brandPressed} />}
            onPress={exitAgentView}
          />
        </View>

        <View style={styles.body}>
          {agentNav === 'Home' ? (
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
              {agentTab === 'tools' ? (
                <>
                  <QuickQuotes />
                  <WhatsNew />
                  <YourToolkit />
                  <AssistantInsights />
                </>
              ) : agentTab === 'insights' ? (
                <>
                <YourInsights />
                <WhatsNew />
                </>
                
              ) : (
                <>
                <TodaysTasks />
                <WhatsNew />
                </>
                
              )}
            </ScrollView>
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderTitle}>{agentNav}</Text>
              <Text style={styles.placeholderBody}>
                {agentNav === 'Business'
                  ? 'Quotes and proposals are read-only in agent view.'
                  : 'This section is part of a later porting phase.'}
              </Text>
              <Button label="Back to Home" variant="secondaryGray" onPress={() => setAgentNav('Home')} />
            </View>
          )}
        </View>

        {/* Rendered before the nav so the bar stays above the popup's scrim. */}
        <MoreMenu visible={moreOpen} onClose={() => setMoreOpen(false)} items={moreItems} />

        <BottomNav
          items={NAV_ITEMS}
          activeKey={moreOpen ? 'More' : agentNav}
          onChange={(id) => {
            if (id === 'More') {
              setMoreOpen((open) => !open);
              return;
            }
            setMoreOpen(false);
            setAgentNav(id);
          }}
          center={{
            onPress: () => {
              setMoreOpen(false);
              setAgentNav('MyAI');
            },
            accessibilityLabel: 'MyAI assistant',
          }}
        />

        <SearchPanel visible={searchOpen} onClose={() => setSearchOpen(false)} />
      </View>
    );
  }

  // --- Default RM dashboard (no bottom navigation) ---
  return (
    <View style={styles.safe}>
      <DashboardTopBar
        gradientColors={HEADER_GRADIENTS.platinum}
        avatarInitials="MJ"
        onProfilePress={openProfile}
        onSearchPress={() => setSearchOpen(true)}
        onNotificationsPress={() => navigation.navigate('Notifications')}
        tabs={RM_TABS}
        activeTab={rmTab}
        onTabChange={setRmTab}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {rmTab === 'goals' ? (
          <>
            <GoalsSheet />
            <WhatsNew />
            <YourToolkit showCustomise={false} showManageTile={false} tools={RM_TOOLS} />
          </>
        ) : (
          <>
            <ConsolidatedPremium />
            <FocusLOBs />
            <AgentsData />
          </>
        )}
      </ScrollView>

      <SearchPanel visible={searchOpen} onClose={() => setSearchOpen(false)} />
    </View>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceSubtle },
  body: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  // Pinned above the body so the RM can always exit agent view.
  viewNotice: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, gap: spacing.sm },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xl },
  placeholderTitle: { fontFamily: typography.fontFamily, fontSize: 24, fontWeight: '600', color: colors.textHeading },
  placeholderBody: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textBody, textAlign: 'center' },
});
