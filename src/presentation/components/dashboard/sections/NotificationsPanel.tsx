import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  Animated,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
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

interface NotificationsPanelProps {
  visible: boolean;
  onClose: () => void;
}

/** Full-screen notifications panel that slides in from the right. */
export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ visible, onClose }) => {
  const { width } = useWindowDimensions();
  const translateX = useRef(new Animated.Value(width)).current;
  const [mounted, setMounted] = useState(visible);
  const [activeTab, setActiveTab] = useState('all');
  const [readAll, setReadAll] = useState(false);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.timing(translateX, { toValue: 0, duration: 250, useNativeDriver: true }).start();
    } else if (mounted) {
      Animated.timing(translateX, { toValue: width, duration: 200, useNativeDriver: true }).start(
        ({ finished }) => finished && setMounted(false),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, width]);

  const tabs: NotificationTab[] = useMemo(
    () => [
      { key: 'all', label: 'All', count: ITEMS.length },
      { key: 'general', label: 'General', count: ITEMS.filter((i) => i.category === 'general').length },
      { key: 'updates', label: 'Updates', count: ITEMS.filter((i) => i.category === 'updates').length },
    ],
    [],
  );

  const filtered = activeTab === 'all' ? ITEMS : ITEMS.filter((i) => i.category === activeTab);

  if (!mounted) return null;

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose}>
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          <NotificationsBase
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onBack={onClose}
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
    </Modal>
  );
};

const styles = StyleSheet.create({
  panel: { flex: 1, backgroundColor: colors.surface },
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
  itemTitle: {
    fontFamily: fontFamilyForWeight('500'),
    fontSize: 15,
    color: colors.textHeading,
  },
  itemDesc: {
    fontFamily: typography.fontFamily,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textBody,
  },
  itemMeta: { alignItems: 'flex-end', gap: spacing.sm },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.brand },
  itemTime: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    color: colors.textMuted,
  },
});
