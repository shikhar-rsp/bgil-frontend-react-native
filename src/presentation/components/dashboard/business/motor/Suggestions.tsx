import React, { useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { HandHeart, ShieldPlus, CrownSimple, type IconProps } from 'phosphor-react-native';
import { Badge, colors, spacing, radius, typography, shadow, fontFamilyForWeight } from '@atlas-ds/react-native';
import { dashboardImages } from '../../images';

type Suggestion = {
  id: string;
  title: string;
  body: string;
  Icon: React.ComponentType<IconProps>;
  iconBg: string;
  border: string;
  borderSel: string;
  tint: string;
  bestSeller?: boolean;
};

const SUGGESTIONS: Suggestion[] = [
  { id: 'apke-liye', title: 'Apke Liye', body: 'State-Wise Health Insurance with GST Benefits - Local Coverage, National Standards', Icon: HandHeart, iconBg: '#DB2777', border: '#FECDD3', borderSel: '#FB7185', tint: '#FDF2F8' },
  { id: 'health-prime', title: 'Health Prime Rider', body: 'Enhance your health insurance with extra protection, including OPD and much more.', Icon: ShieldPlus, iconBg: '#4F46E5', border: '#C7D2FE', borderSel: '#818CF8', tint: '#EEF2FF', bestSeller: true },
  { id: 'personal-guard', title: 'Personal Guard', body: 'Covers you and your family against any accidental bodily injury, disability or death.', Icon: CrownSimple, iconBg: '#059669', border: '#A7F3D0', borderSel: '#34D399', tint: '#ECFDF5' },
];

export const Suggestions: React.FC = () => {
  const [selected, setSelected] = useState('');

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Image source={dashboardImages.aiIcon2} style={styles.aiIcon} />
        <Text style={styles.heading}>Suggest these to your customers</Text>
      </View>

      <View style={styles.cards}>
        {SUGGESTIONS.map((s) => {
          const isSel = selected === s.id;
          return (
            <Pressable
              key={s.id}
              onPress={() => setSelected(s.id)}
              style={[styles.suggestion, { borderColor: isSel ? s.borderSel : s.border }]}
              accessibilityRole="button"
            >
              {/* Selected: white → tint gradient. Unselected stays flat white. */}
              {isSel ? (
                <LinearGradient colors={['#FFFFFF', s.tint]} style={StyleSheet.absoluteFill} />
              ) : null}

              <View style={[styles.sIcon, { backgroundColor: s.iconBg }]}>
                <s.Icon size={20} color="#FFFFFF" weight="fill" />
              </View>
              <View style={styles.titleRow}>
                <Text style={styles.sTitle}>{s.title}</Text>
                {s.bestSeller ? <Badge variant="solid" size="sm" color="orange" label="Best seller" /> : null}
              </View>
              <Text style={styles.sBody}>{s.body}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.xl, padding: spacing.lg, gap: spacing.lg, ...shadow.lg },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  aiIcon: { width: 36, height: 36, borderRadius: 18 },
  heading: { flex: 1, fontFamily: fontFamilyForWeight('500'), fontSize: 20, fontWeight: '500', color: colors.textHeading },
  cards: { gap: spacing.md },
  // overflow:hidden keeps the selected gradient inside the rounded border.
  suggestion: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.md,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  sIcon: { width: 40, height: 40, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  sTitle: { fontFamily: typography.fontFamily, fontSize: 16, color: colors.textHeading },
  sBody: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textBody },
});
