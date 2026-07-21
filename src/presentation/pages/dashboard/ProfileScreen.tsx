import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CaretLeft, CaretDown, CaretUp, User, GearSix, MonitorPlay, Headset, Phone, ArrowBendDownRight } from 'phosphor-react-native';
import {
  AvatarLabel,
  AvatarDropdownItem,
  Badge,
  BottomSheet,
  Button,
  colors,
  spacing,
  typography,
  radius,
  fontFamilyForWeight,
} from '@atlas-ds/react-native';
import { clearTokenValues } from '../../../utils/tokenStorage';
import type { AuthScreenProps, AgentViewTarget } from '../../../navigation';

type SubAgent = { id: string; name: string; code: string };
type AgentGroup = { id: string; name: string; tag?: string; children?: SubAgent[] };

/** Agents an RM can switch into. Groups expand to their sub-IMD agents. */
const AGENT_GROUPS: AgentGroup[] = [
  { id: 'g0', name: 'Rakesh Mishra' },
  {
    id: 'g1',
    name: 'Rakesh Mishra',
    tag: 'IMD',
    children: [
      { id: 's1', name: 'Manish Sharma', code: 'IMD97395' },
      { id: 's2', name: 'Priti Sinha', code: 'IMD97397' },
      { id: 's3', name: 'Simran Jain', code: 'IMD97399' },
    ],
  },
  {
    id: 'g2',
    name: 'Kamal Hassan',
    tag: 'IMD',
    children: [
      { id: 's4', name: 'Anita Rao', code: 'IMD97401' },
      { id: 's5', name: 'Vikram Shah', code: 'IMD97403' },
    ],
  },
  {
    id: 'g3',
    name: 'Panjak Tripathi',
    tag: 'IMD',
    children: [{ id: 's6', name: 'Neha Gupta', code: 'IMD97405' }],
  },
];

const MENU_ROWS = [
  { key: 'profile', label: 'View Profile', icon: <User size={20} color={colors.textBody} /> },
  { key: 'settings', label: 'Settings', icon: <GearSix size={20} color={colors.textBody} /> },
  { key: 'tour', label: 'Product Tour', icon: <MonitorPlay size={20} color={colors.textBody} /> },
  { key: 'support', label: 'Support', icon: <Headset size={20} color={colors.textBody} /> },
];

/**
 * Shared profile page for every persona. RMs additionally get an "Agent View"
 * picker — choosing an agent returns to the RM dashboard in view-as mode.
 */
export const ProfileScreen: React.FC<AuthScreenProps<'Profile'>> = ({ navigation, route }) => {
  const { persona, userName, userId, userInitials } = route.params;
  const [sheetOpen, setSheetOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>('g1');
  const [selectedAgent, setSelectedAgent] = useState<AgentViewTarget | null>(null);

  const handleLogout = () => {
    clearTokenValues();
    navigation.reset({ index: 0, routes: [{ name: 'DesignationSelect' }] });
  };

  // Going back with an agent chosen drops the RM dashboard into view-as mode.
  const handleBack = () => {
    if (persona === 'rm' && selectedAgent) {
      navigation.navigate('RMDashboard', { viewAgent: selectedAgent });
      return;
    }
    navigation.goBack();
  };

  const pickAgent = (agent: AgentViewTarget) => {
    setSelectedAgent(agent);
    setSheetOpen(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Button
          iconOnly
          variant="tertiaryGray"
          size="md"
          label="Back"
          leadingIcon={<CaretLeft size={22} color={colors.textBody} />}
          onPress={handleBack}
        />
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <AvatarLabel
          size="md"
          initials={userInitials}
          text={userName}
          subtext={userId}
          showStatus
          statusColor={colors.success}
        />

        <View style={styles.divider} />

        <View style={styles.rowList}>
          {MENU_ROWS.map((row) => (
            <AvatarDropdownItem key={row.key} icon={row.icon} onPress={() => undefined}>
              {row.label}
            </AvatarDropdownItem>
          ))}
        </View>

        <View style={styles.divider} />

        {persona === 'rm' ? (
          <>
            <Text style={styles.sectionLabel}>Agent View</Text>
            <Pressable
              style={styles.agentField}
              onPress={() => setSheetOpen(true)}
              accessibilityRole="button"
              accessibilityLabel="Select agent"
            >
              <View style={[styles.agentIcon, selectedAgent && styles.agentIconActive]}>
                <User size={18} color={selectedAgent ? colors.brand : colors.success} />
              </View>
              <View style={styles.agentFieldText}>
                <Text style={styles.agentFieldName}>{selectedAgent ? selectedAgent.name : 'Select Agent'}</Text>
                {selectedAgent ? <Text style={styles.agentFieldCode}>{selectedAgent.code}</Text> : null}
              </View>
              <CaretDown size={18} color={colors.textMuted} />
            </Pressable>
          </>
        ) : persona === 'agent' ? (
          <>
            <Text style={styles.sectionLabel}>Your Relation Manager</Text>
            <AvatarLabel size="md" initials="MJ" text="Manish Jain" subtext="RM ID: RM982732863" />
          </>
        ) : null}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        {persona === 'rm' ? null : (
          <Button
            label="Call Relationship Manager"
            variant="secondaryGray"
            fullWidth
            leadingIcon={<Phone size={18} color={colors.textBody} />}
            onPress={() => undefined}
          />
        )}
        <Button label="Log out" variant="secondaryDestructive" fullWidth onPress={handleLogout} />
      </View>

      {/* Agent picker */}
      <BottomSheet visible={sheetOpen} onClose={() => setSheetOpen(false)} title="Select Agent" contentSlot>
        <View style={styles.sheetList}>
          {AGENT_GROUPS.map((group) => {
            const isOpen = expanded === group.id;
            const hasChildren = !!group.children?.length;
            return (
              <View key={group.id}>
                <Pressable
                  style={[styles.groupRow, isOpen && hasChildren && styles.groupRowOpen]}
                  onPress={() =>
                    hasChildren
                      ? setExpanded(isOpen ? null : group.id)
                      : pickAgent({ name: group.name, code: '' })
                  }
                  accessibilityRole="button"
                >
                  <Text style={styles.groupName}>{group.name}</Text>
                  {group.tag ? <Badge label={group.tag} variant="light" size="sm" color="emerald" /> : null}
                  {hasChildren ? (
                    isOpen ? (
                      <CaretUp size={16} color={colors.textMuted} />
                    ) : (
                      <CaretDown size={16} color={colors.textMuted} />
                    )
                  ) : null}
                </Pressable>

                {isOpen && hasChildren
                  ? group.children!.map((child) => (
                      <Pressable
                        key={child.id}
                        style={[styles.childRow, selectedAgent?.code === child.code && styles.childRowActive]}
                        onPress={() => pickAgent({ name: child.name, code: child.code })}
                        accessibilityRole="button"
                      >
                        <ArrowBendDownRight size={14} color={colors.textMuted} />
                        <Text style={styles.childName}>{child.name}</Text>
                        <Badge label="Sub-IMD" variant="light" size="sm" color="blue" />
                      </Pressable>
                    ))
                  : null}
              </View>
            );
          })}
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: { fontFamily: fontFamilyForWeight('500'), fontSize: 18, color: colors.textHeading },
  headerSpacer: { width: 40 },
  body: { padding: spacing.lg, gap: spacing.md },
  divider: { height: 1, backgroundColor: colors.borderSubtle, marginHorizontal: -spacing.lg },
  rowList: { gap: spacing.lg, marginVertical: spacing.xs },
  sectionLabel: { fontFamily: typography.fontFamily, fontSize: 13, color: colors.textMuted },
  // Agent picker field
  agentField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  agentIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  agentIconActive: { backgroundColor: colors.brandSubtle },
  agentFieldText: { flex: 1 },
  agentFieldName: { fontFamily: fontFamilyForWeight('500'), fontSize: 15, color: colors.textHeading },
  agentFieldCode: { fontFamily: typography.fontFamily, fontSize: 12, color: colors.textBody },
  footer: {
    padding: spacing.lg,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  // Agent sheet
  sheetList: { gap: spacing.xxs },
  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.lg,
  },
  groupRowOpen: { backgroundColor: colors.surfaceSubtle },
  groupName: { flex: 1, fontFamily: typography.fontFamily, fontSize: 15, color: colors.textHeading },
  childRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingLeft: spacing.xl,
    paddingRight: spacing.sm,
    borderRadius: radius.lg,
  },
  childRowActive: { backgroundColor: colors.brandSubtle },
  childName: { flex: 1, fontFamily: typography.fontFamily, fontSize: 14, color: colors.textHeading },
});
