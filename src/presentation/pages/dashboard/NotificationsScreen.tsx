import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CaretLeft } from 'phosphor-react-native';
import {
  NotificationsBase,
  colors,
  spacing,
  typography,
  fontFamilyForWeight,
  type NotificationTab,
} from '@atlas-ds/react-native';
import type { AuthScreenProps } from '../../../navigation';

type NotificationCategory = 'general' | 'updates';

type NotificationEntry = {
  id: string;
  category: NotificationCategory;
  title: string;
  description: string;
  time?: string;
  unread?: boolean;
};

const ITEMS: NotificationEntry[] = [
  {
    id: '1',
    category: 'general',
    title: 'Policy Application Rejected',
    description: 'Policy application BAGIC/HLT/2024/001789 for customer Amit Kumar has been rejected.',
  },
  {
    id: '2',
    category: 'updates',
    title: 'Policy Amendment: Health Plus',
    description: 'Updated terms for Advantage Health Plus. Effective for Feb 1, 2025.',
  },
  {
    id: '3',
    category: 'updates',
    title: 'New Campaign: Shubharambh 2025',
    description:
      'Exciting new incentive program launched! Earn up to 25% extra commission. Valid till March 31, 2025.',
  },
  {
    id: '4',
    category: 'general',
    title: '15 Policies Due for Renewal',
    description: 'You have 15 policies expiring in the next 7 days',
    time: '6mins',
    unread: true,
  },
  {
    id: '5',
    category: 'general',
    title: 'Claim Approved',
    description: 'Claim BAGIC/CLM/HLT/2024/001 for ₹85,000 has been approved. Settlement in progress.',
    time: '6mins',
    unread: true,
  },
  {
    id: '6',
    category: 'updates',
    title: 'Policy Amendment: Apke Liye',
    description: 'Updated terms for Apke Liye - Health insurance. Effective from Feb 1, 2025.',
    time: '6mins',
    unread: true,
  },
  {
    id: '7',
    category: 'general',
    title: 'Claim Approved',
    description: 'Claim BAGIC/CLM/HLT/2024/001 for ₹85,000 has been approved. Settlement in progress.',
    time: '5 min',
    unread: true,
  },
  {
    id: '8',
    category: 'updates',
    title: 'New Campaign: Refer & Earn',
    description: 'Refer a fellow agent and earn bonus rewards. Limited period offer.',
  },
];

/** Full-screen notifications route, opened from the dashboard bell. */
export const NotificationsScreen: React.FC<AuthScreenProps<'Notifications'>> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [readAll, setReadAll] = useState(false);

  const tabs: NotificationTab[] = useMemo(
    () => [
      { key: 'all', label: 'All', count: ITEMS.length },
      { key: 'general', label: 'General', count: ITEMS.filter((i) => i.category === 'general').length },
      { key: 'updates', label: 'Updates', count: ITEMS.filter((i) => i.category === 'updates').length },
    ],
    [],
  );

  const filtered = activeTab === 'all' ? ITEMS : ITEMS.filter((i) => i.category === activeTab);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <NotificationsBase
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onBack={() => navigation.goBack()}
        backIcon={<CaretLeft size={22} color={colors.textHeading} />}
        onMarkAsRead={() => setReadAll(true)}
      >
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {filtered.map((item) => (
            <View key={item.id} style={styles.item}>
              <View style={styles.itemText}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemDesc}>{item.description}</Text>
              </View>
              {(item.time || (item.unread && !readAll)) && (
                <View style={styles.itemMeta}>
                  {item.unread && !readAll ? <View style={styles.unreadDot} /> : null}
                  {item.time ? <Text style={styles.itemTime}>{item.time}</Text> : null}
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      </NotificationsBase>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  list: { paddingBottom: spacing.xl },
  item: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  itemText: { flex: 1, gap: spacing.xs },
  itemTitle: { fontFamily: fontFamilyForWeight('500'), fontSize: 15, color: colors.textHeading },
  itemDesc: {
    fontFamily: typography.fontFamily,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textBody,
  },
  itemMeta: { alignItems: 'flex-end', gap: spacing.sm },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.brand },
  itemTime: { fontFamily: typography.fontFamily, fontSize: 12, color: colors.textMuted },
});
