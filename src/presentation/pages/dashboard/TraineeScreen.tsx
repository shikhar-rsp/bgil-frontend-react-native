import React, { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '@atlas-ds/react-native';
import { DashboardHeader } from '../../components/dashboard/sections/DashboardHeader';
import { DashboardSidebarNav } from '../../components/dashboard/sections/DashboardSidebarNav';
import { QuickQuotes } from '../../components/dashboard/sections/QuickQuotes';
import { YourToolkit } from '../../components/dashboard/sections/YourToolkit';
import { AssistantInsights } from '../../components/dashboard/sections/AssistantInsights';
import {
  TraineeInsights,
  Leaderboard,
  TrainingSchedule,
  ResourcesAndBrochures,
  TraineeBusinessInsights,
} from '../../components/dashboard/trainee/TraineeSections';
import { BookTraining } from '../../components/dashboard/trainee/BookTraining';
import type { AuthScreenProps } from '../../../navigation';

/**
 * Trainee dashboard. Ports the web TraineeLayout: trainee insights gauge,
 * leaderboard, training schedule (+ book-a-training sheet), quick quotes,
 * toolkit, assistant, resources, and business insights.
 */
export const TraineeScreen: React.FC<AuthScreenProps<'Trainee'>> = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [bookOpen, setBookOpen] = useState(false);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <DashboardHeader onMenuClick={() => setDrawerOpen(true)} search={search} onSearchChange={setSearch} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TraineeInsights />
        <Leaderboard />
        <TrainingSchedule onScheduleSession={() => setBookOpen(true)} />
        <QuickQuotes />
        <YourToolkit />
        <AssistantInsights />
        <ResourcesAndBrochures />
        <TraineeBusinessInsights />
      </ScrollView>

      <DashboardSidebarNav
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        selectedItem="Home"
        onSelectItem={() => setDrawerOpen(false)}
      />

      <BookTraining isOpen={bookOpen} onClose={() => setBookOpen(false)} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceSubtle },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
});
