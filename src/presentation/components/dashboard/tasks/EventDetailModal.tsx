import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, Image, Modal as RNModal, StyleSheet } from 'react-native';
import type { ImageSourcePropType } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {
  At,
  Cake,
  Confetti,
  CrownSimple,
  EnvelopeSimple,
  Heartbeat,
  Info,
  Phone,
  ShieldPlus,
  ChatText,
  X,
} from 'phosphor-react-native';
import { dashboardImages } from '../images';
import {
  Badge,
  BottomSheet,
  Button,
  Checkbox,
  Radio,
  TextArea,
  Toggle,
  colors,
  fontFamilyForWeight,
  radius,
  spacing,
  typography,
  type AccentColor,
} from '@atlas-ds/react-native';

// ---------------------------------------------------------------------------
// Types + fixtures (mirrors the web EventModal)
// ---------------------------------------------------------------------------

export type OccasionKind = 'Birthday' | 'Member Birthday' | 'Multiple Birthday' | 'Anniversary';

export interface BirthdayMember {
  kind: 'Birthday' | 'Member Birthday' | 'Multiple Birthday';
  name: string;
  age: string;
  relation: string;
  dob: string;
}
export interface AnniversaryMember {
  kind: 'Anniversary';
  name: string;
  spouse: string;
  date: string;
  details: string;
}
export type EventMember = BirthdayMember | AnniversaryMember;

export interface EventDetail {
  name: string;
  occasions: OccasionKind[];
  members: EventMember[];
  customerId?: string;
  phone?: string;
  email?: string;
  product?: string;
  policyId?: string;
}

// Title badges match the Events table cell: all birthdays pink + cake,
// anniversary violet + confetti. Keep in sync with EVENT_TYPE_COLOR in TasksScreen.
const CAKE = <Cake size={12} color="#FFFFFF" weight="fill" />;
const CONFETTI = <Confetti size={12} color="#FFFFFF" weight="fill" />;
const OCCASION_BADGE: Record<OccasionKind, { color: AccentColor; icon: React.ReactNode }> = {
  Birthday: { color: 'pink', icon: CAKE },
  'Member Birthday': { color: 'pink', icon: CAKE },
  'Multiple Birthday': { color: 'pink', icon: CAKE },
  Anniversary: { color: 'violet', icon: CONFETTI },
};

const occasionWord = (occasions: OccasionKind[]) => {
  const hasBday = occasions.some((o) => o.includes('Birthday'));
  const hasAnniv = occasions.includes('Anniversary');
  if (hasBday && hasAnniv) return 'Birthday & Anniversary';
  return hasAnniv ? 'Anniversary' : 'Birthday';
};

const buildTemplates = (name: string, occasion: string) => {
  const first = name.split(' ')[0];
  return [
    {
      key: 'Warm & personal',
      color: 'orange' as AccentColor,
      text: `Happy ${occasion}, ${first} ji! Wishing you and your family many more years of health, joy and happiness. Have a wonderful day!`,
    },
    {
      key: 'Professional',
      color: 'blue' as AccentColor,
      text: `Dear ${name}, wishing you a very happy ${occasion.toLowerCase()}. May the year ahead bring you good health, success and prosperity.`,
    },
    {
      key: 'Sales-assisted',
      color: 'emerald' as AccentColor,
      text: `Happy ${occasion}, ${first} ji! Wishing you and your family a wonderful year. P.S. — it's a great time to review your cover for added peace of mind.`,
    },
  ];
};

const POLICIES = [
  { name: 'Health Prime Rider', desc: 'Enhance your health insurance with extra protection, including OPD and much more.', tile: '#4F46E5', border: '#C7D2FE', icon: <ShieldPlus size={16} weight="fill" color="#FFFFFF" /> },
  { name: 'Apke Liye', desc: 'State-Wise Health Insurance with GST Benefits - Local Coverage, National Standards', tile: '#DB2777', border: '#FECDD3', icon: <Heartbeat size={16} weight="fill" color="#FFFFFF" /> },
  { name: 'Personal Guard', desc: 'Covers you and your family against any accidental bodily injury, disability or death.', tile: '#16A34A', border: '#A7F3D0', icon: <CrownSimple size={16} weight="fill" color="#FFFFFF" /> },
];

// Share channels: colored border (always) + a light selected-bg tint; `img` is a
// bundled logo, SMS a blue tile. Matches the meeting modal's confirm sheet.
const CHANNELS: { key: string; img: ImageSourcePropType | null; border: string; tint: string }[] = [
  { key: 'WhatsApp', img: dashboardImages.whatsapp, border: '#A7F3D0', tint: '#ECFDF5' },
  { key: 'Email', img: dashboardImages.mail, border: '#FED7AA', tint: '#FFF7ED' },
  { key: 'SMS', img: null, border: '#BFDBFE', tint: '#EFF6FF' },
];

/** The member card(s) a single occasion contributes to the modal. */
const membersForOccasion = (customer: string, occasion: OccasionKind): EventMember[] => {
  switch (occasion) {
    case 'Anniversary':
      return [{ kind: 'Anniversary', name: customer, spouse: 'Sarita Kumar', date: '24/06/2026', details: '20th Anniversary' }];
    case 'Member Birthday':
      return [{ kind: 'Member Birthday', name: 'Priti Kumar', age: '25 yrs', relation: 'Daughter', dob: '24/06/2026' }];
    case 'Multiple Birthday':
      return [
        { kind: 'Multiple Birthday', name: 'Priti Kumar', age: '25 yrs', relation: 'Daughter', dob: '24/06/2026' },
        { kind: 'Multiple Birthday', name: 'Sarita Kumar', age: '55 yrs', relation: 'Spouse', dob: '24/06/2026' },
      ];
    case 'Birthday':
    default:
      return [{ kind: 'Birthday', name: customer, age: '55 yrs', relation: 'Self', dob: '24/06/2026' }];
  }
};

/**
 * Build a demo event detail from a customer + one or more occasions. The title
 * badges and member cards are derived from `occasions`, so a combined event
 * (e.g. Member Birthday + Anniversary) renders both a birthday and an
 * anniversary card.
 */
export const buildEventDetail = (customer: string, occasions: OccasionKind | OccasionKind[]): EventDetail => {
  const list = Array.isArray(occasions) ? occasions : [occasions];
  const first = customer.split(' ')[0].toLowerCase();
  return {
    name: customer,
    occasions: list,
    members: list.flatMap((o) => membersForOccasion(customer, o)),
    customerId: '23627533453',
    phone: '+91 897863736',
    email: `${first}@gmail.com`,
    product: 'Health Guard Floater',
    policyId: '28686-8728387',
  };
};

/** Concentric double-ring badge (outer #EFF6FF / inner #DBEAFE) around a glyph. */
const RoundedIconBadge: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <View style={styles.ringOuter}>
    <View style={styles.ringInner}>{children}</View>
  </View>
);

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export interface EventDetailModalProps {
  visible: boolean;
  onClose: () => void;
  detail?: EventDetail;
  onConfirm?: () => void;
  onComplete?: () => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({ visible, onClose, detail, onConfirm, onComplete }) => {
  const insets = useSafeAreaInsets();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [markComplete, setMarkComplete] = useState(false);
  const [showSendConfirm, setShowSendConfirm] = useState(false);
  const [channels, setChannels] = useState<string[]>(['WhatsApp']);

  useEffect(() => {
    if (!visible) return;
    setSelectedTemplate(null);
    setMessage('');
    setMarkComplete(false);
    setShowSendConfirm(false);
    setChannels(['WhatsApp']);
  }, [visible, detail]);

  const toggleChannel = (key: string) =>
    setChannels((prev) => (prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key]));

  const finish = (confirmed: boolean) => {
    if (markComplete) onComplete?.();
    if (confirmed) onConfirm?.();
    setShowSendConfirm(false);
    onClose();
  };

  if (!detail) return null;

  const occasion = occasionWord(detail.occasions);
  const templates = buildTemplates(detail.name, occasion);
  const first = detail.name.split(' ')[0];
  const canConfirm = message.trim().length > 0 || selectedTemplate !== null;

  const selectTemplate = (key: string, text: string) => {
    setSelectedTemplate(key);
    setMessage(text);
  };

  return (
    <RNModal visible={visible} animationType="slide" statusBarTranslucent onRequestClose={() => finish(false)}>
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Event</Text>
          <Pressable onPress={() => finish(false)} hitSlop={8} accessibilityRole="button" accessibilityLabel="Close">
            <X size={22} color={colors.textBody} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          {/* Banner */}
          <View style={styles.banner}>
            <View style={styles.bannerTop}>
              <Text style={styles.bannerName}>{detail.name}</Text>
              {detail.occasions.map((o) => (
                <Badge
                  key={o}
                  label={o}
                  variant="solid"
                  size="sm"
                  color={OCCASION_BADGE[o].color}
                  icon={OCCASION_BADGE[o].icon}
                />
              ))}
            </View>

            <View style={styles.bannerActions}>
              <View style={styles.completeRow}>
                <Text style={styles.completeLabel}>Mark as complete</Text>
                <Toggle value={markComplete} onValueChange={setMarkComplete} size="sm" />
              </View>
              <Button
                label="Call"
                variant="secondaryGray"
                size="sm"
                leadingIcon={<Phone size={16} color={colors.textBody} />}
                onPress={() => undefined}
              />
            </View>

            <View style={styles.contactRow}>
              <View style={styles.contactItem}>
                <At size={14} color={colors.textMuted} />
                <Text style={styles.contactText}>{detail.customerId}</Text>
              </View>
              <View style={styles.contactItem}>
                <Phone size={14} color={colors.textMuted} />
                <Text style={styles.contactText}>{detail.phone}</Text>
              </View>
              <View style={styles.contactItem}>
                <EnvelopeSimple size={14} color={colors.textMuted} />
                <Text style={styles.contactText}>{detail.email}</Text>
              </View>
              <Text style={styles.contactText}>{detail.product}</Text>
              <Text style={styles.contactText}>{detail.policyId}</Text>
            </View>
          </View>

          {/* Member cards */}
          {detail.members.map((m, i) => {
            const anniv = m.kind === 'Anniversary';
            return (
              <View key={`${m.name}-${i}`} style={styles.memberCard}>
                <View style={[styles.memberIcon, { backgroundColor: anniv ? '#EDE9FE' : '#FCE7F3' }]}>
                  {anniv ? <Confetti size={18} color="#7C3AED" /> : <Cake size={18} color="#DB2777" />}
                </View>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{m.name}</Text>
                  <Text style={styles.memberMeta}>
                    {m.kind === 'Anniversary'
                      ? `Spouse: ${m.spouse}   Date: ${m.date}   Details: ${m.details}`
                      : `Age: ${m.age}   Relation: ${m.relation}   DOB: ${m.dob}`}
                  </Text>
                </View>
              </View>
            );
          })}

          {/* Templates */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Choose a message template</Text>
            {templates.map((t) => {
              const sel = selectedTemplate === t.key;
              return (
                <Pressable
                  key={t.key}
                  style={[styles.templateCard, sel && styles.templateCardSelected]}
                  onPress={() => selectTemplate(t.key, t.text)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: sel }}
                >
                  <View style={styles.templateTop}>
                    <Badge label={t.key} variant="light" size="sm" color={t.color} />
                    <Radio selected={sel} onPress={() => selectTemplate(t.key, t.text)} size="sm" />
                  </View>
                  <Text style={styles.templateText} numberOfLines={3}>
                    "{t.text}"
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Own message */}
          <TextArea
            value={message}
            onChangeText={(text) => {
              setMessage(text);
              setSelectedTemplate(null);
            }}
            placeholder="Write your own message…"
            rows={5}
          />

          {/* AI suggestions */}
          <View style={styles.aiPanel}>
            <View style={styles.aiHeaderCard}>
              <View style={styles.aiTitleRow}>
                <Text style={styles.aiMyAi}>My AI</Text>
                <Text style={styles.aiSug}>Suggestions</Text>
              </View>
              <Text style={styles.aiIntro}>
                It's {first}'s {occasion.toLowerCase()}! Use this as an opportunity to pitch new policies to them!
              </Text>
            </View>
            <View style={styles.aiPolicies}>
              {POLICIES.map((p) => (
                <View key={p.name} style={[styles.policyCard, { borderColor: p.border }]}>
                  <View style={[styles.policyIcon, { backgroundColor: p.tile }]}>{p.icon}</View>
                  <View style={styles.policyInfo}>
                    <Text style={styles.policyName}>{p.name}</Text>
                    <Text style={styles.policyDesc}>{p.desc}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
          <Button label="Cancel" variant="secondaryGray" onPress={() => finish(false)} />
          <Button
            label="Confirm"
            variant="primary"
            disabled={!canConfirm}
            onPress={() => setShowSendConfirm(true)}
            style={styles.footerPrimary}
          />
        </View>
      </View>

      {/* Send-message confirmation */}
      <BottomSheet
        visible={showSendConfirm}
        onClose={() => setShowSendConfirm(false)}
        primaryAction={{ label: 'Confirm', onPress: () => finish(true) }}
        secondaryAction={{ label: 'Cancel', onPress: () => setShowSendConfirm(false) }}
      >
        <View style={styles.confirmBody}>
          <RoundedIconBadge>
            <Info size={22} color={colors.brand} />
          </RoundedIconBadge>
          <Text style={styles.confirmTitle}>Send message to customer?</Text>
          <Text style={styles.confirmText}>
            This message will be sent to the customer as a personal message by you. Review the message before sending.
          </Text>
          {message.trim() ? (
            <View style={styles.messagePreview}>
              <Text style={styles.messagePreviewText}>"{message}"</Text>
            </View>
          ) : null}
          <View style={styles.shareVia}>
            <Text style={styles.shareViaLabel}>Share message via</Text>
            <View style={styles.channelRow}>
              {CHANNELS.map((ch) => {
                const sel = channels.includes(ch.key);
                return (
                  <Pressable
                    key={ch.key}
                    style={[styles.channelCard, { borderColor: ch.border }]}
                    onPress={() => toggleChannel(ch.key)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: sel }}
                  >
                    {sel ? (
                      <LinearGradient
                        colors={['#FFFFFF', ch.tint]}
                        start={{ x: 0.5, y: 0 }}
                        end={{ x: 0.5, y: 1 }}
                        style={StyleSheet.absoluteFill}
                      />
                    ) : null}
                    <View style={styles.channelCheck}>
                      <Checkbox size="sm" checked={sel} onChange={() => toggleChannel(ch.key)} />
                    </View>
                    {ch.img ? (
                      <Image source={ch.img} style={styles.channelImg} resizeMode="contain" />
                    ) : (
                      <View style={styles.channelTile}>
                        <ChatText size={18} color="#FFFFFF" />
                      </View>
                    )}
                    <Text style={styles.channelLabel}>{ch.key}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </BottomSheet>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  headerTitle: { fontFamily: fontFamilyForWeight('600'), fontSize: 18, fontWeight: '600', color: colors.textHeading },

  body: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },

  // Banner
  banner: { backgroundColor: '#FDF2F8', borderRadius: radius.xl, padding: spacing.lg, gap: spacing.md },
  bannerTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  bannerName: { fontFamily: fontFamilyForWeight('700'), fontSize: 18, fontWeight: '700', color: colors.textHeading },
  bannerActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md, flexWrap: 'wrap' },
  completeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  completeLabel: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textBody },
  contactRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: spacing.lg, rowGap: spacing.xs },
  contactItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  contactText: { fontFamily: typography.fontFamily, fontSize: 12, lineHeight: 16, color: colors.textMuted },

  // Member card
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  memberIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  memberInfo: { flex: 1, gap: 2 },
  memberName: { fontFamily: fontFamilyForWeight('600'), fontSize: 14, fontWeight: '600', color: colors.textHeading },
  memberMeta: { fontFamily: typography.fontFamily, fontSize: 12, lineHeight: 17, color: colors.textMuted },

  field: { gap: spacing.sm },
  fieldLabel: { fontFamily: typography.fontFamily, fontSize: 14, lineHeight: 20, color: colors.textBody },

  // Template cards
  templateCard: {
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  templateCardSelected: { borderColor: colors.brand, backgroundColor: colors.brandSubtle },
  templateTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  templateText: { fontFamily: typography.fontFamily, fontSize: 13, lineHeight: 18, color: colors.textHeading },

  // AI panel
  aiPanel: { backgroundColor: '#003460', borderRadius: radius.xl, padding: spacing.sm, gap: spacing.sm },
  aiHeaderCard: { backgroundColor: '#14446D', borderRadius: radius.lg, padding: spacing.md, gap: spacing.xs },
  aiTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  aiMyAi: { fontFamily: fontFamilyForWeight('500'), fontSize: 14, fontWeight: '500', color: '#B1A6FF' },
  aiSug: { fontFamily: fontFamilyForWeight('500'), fontSize: 14, fontWeight: '500', color: '#FFFFFF' },
  aiIntro: { fontFamily: typography.fontFamily, fontSize: 12, lineHeight: 18, color: '#FFFFFF' },
  aiPolicies: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm },
  policyCard: { flexDirection: 'row', gap: spacing.sm, borderWidth: 1, borderRadius: radius.lg, padding: spacing.md },
  policyIcon: { width: 28, height: 28, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  policyInfo: { flex: 1, gap: 2 },
  policyName: { fontFamily: fontFamilyForWeight('600'), fontSize: 13, fontWeight: '600', color: colors.textHeading },
  policyDesc: { fontFamily: typography.fontFamily, fontSize: 12, lineHeight: 17, color: colors.textMuted },

  // Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  footerPrimary: { minWidth: 120 },

  // Send-confirm sheet body
  ringOuter: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' },
  ringInner: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#DBEAFE', alignItems: 'center', justifyContent: 'center' },
  confirmBody: { gap: spacing.md, alignItems: 'center' },
  confirmTitle: { fontFamily: fontFamilyForWeight('500'), fontSize: 18, lineHeight: 24, fontWeight: '500', color: colors.textHeading, textAlign: 'center' },
  confirmText: { fontFamily: typography.fontFamily, fontSize: 14, lineHeight: 20, color: colors.textBody, textAlign: 'center' },
  messagePreview: {
    alignSelf: 'stretch',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceSubtle,
    padding: spacing.md,
  },
  messagePreviewText: { fontFamily: typography.fontFamily, fontSize: 13, lineHeight: 19, color: colors.textHeading },
  shareVia: { gap: spacing.sm, alignSelf: 'stretch' },
  shareViaLabel: { fontFamily: fontFamilyForWeight('500'), fontSize: 13, fontWeight: '500', color: colors.textHeading },
  channelRow: { flexDirection: 'row', gap: spacing.sm },
  channelCard: {
    flex: 1,
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  channelImg: { width: 32, height: 32 },
  channelTile: { width: 32, height: 32, borderRadius: radius.md, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center' },
  channelCheck: { position: 'absolute', top: spacing.sm, right: spacing.sm, zIndex: 1 },
  channelLabel: { fontFamily: typography.fontFamily, fontSize: 12, lineHeight: 16, color: colors.textBody },
});
