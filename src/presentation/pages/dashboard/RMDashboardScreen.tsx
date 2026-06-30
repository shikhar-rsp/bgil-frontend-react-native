import React, { useState } from 'react';
import { Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '@atlas-ds/react-native';
import { DashboardHeader } from '../../components/dashboard/sections/DashboardHeader';
import { DashboardSidebarNav } from '../../components/dashboard/sections/DashboardSidebarNav';
import { WhatsNew } from '../../components/dashboard/sections/WhatsNew';
import { YourToolkit } from '../../components/dashboard/sections/YourToolkit';
import { AssistantInsights } from '../../components/dashboard/sections/AssistantInsights';
import {
  GoalsSheet,
  ConsolidatedPremium,
  FocusLOBs,
  AgentsData,
  AgentInsights,
} from '../../components/dashboard/rm/RmSections';
import type { AuthScreenProps } from '../../../navigation';

/**
 * Relationship Manager dashboard. Ports the web RMDashboardLayout: RM header,
 * "Your Dashboard" title, and the RM section stack (goals, consolidated premium,
 * focus LOBs, agents data, what's new, toolkit, assistant, agent insights).
 */
export const RMDashboardScreen: React.FC<AuthScreenProps<'RMDashboard'>> = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState('');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <DashboardHeader
        onMenuClick={() => setDrawerOpen(true)}
        search={search}
        onSearchChange={setSearch}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Your Dashboard</Text>
        <GoalsSheet />
        <ConsolidatedPremium />
        <FocusLOBs />
        <AgentsData />
        <WhatsNew />
        <YourToolkit />
        <AssistantInsights />
        <AgentInsights />
      </ScrollView>

      <DashboardSidebarNav
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        selectedItem="Home"
        onSelectItem={() => setDrawerOpen(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceSubtle },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  title: { fontFamily: typography.fontFamily, fontSize: 28, fontWeight: '600', color: colors.textHeading },
});
