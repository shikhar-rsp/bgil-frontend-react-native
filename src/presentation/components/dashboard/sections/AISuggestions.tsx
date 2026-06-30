import React, { useState } from 'react';
import { View, Text, Image, TextInput, Pressable, StyleSheet } from 'react-native';
import { Sparkle, PaperPlaneRight } from 'phosphor-react-native';
import { colors, spacing, radius, typography } from '@atlas-ds/react-native';
import { dashboardImages } from '../images';

/** Empty-state "AI Suggestions" panel with an ask-anything input. */
export const AISuggestions: React.FC = () => {
  const [text, setText] = useState('');

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Sparkle size={20} color={colors.textBody} />
        <Text style={styles.headerText}>AI Suggestions</Text>
      </View>

      <View style={styles.empty}>
        <Image source={dashboardImages.agent} style={styles.illustration} resizeMode="contain" />
        <Text style={styles.emptyText}>
          See all your urgent tasks here! Get a quick overview for the day!
        </Text>
      </View>

      <View style={styles.inputRow}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Ask me anything"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
        />
        <Pressable accessibilityRole="button" accessibilityLabel="Send" hitSlop={8}>
          <PaperPlaneRight size={18} color={colors.brand} weight="fill" />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  headerText: { fontFamily: typography.fontFamily, fontSize: 15, fontWeight: '500', color: colors.textHeading },
  empty: {
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  illustration: { width: 110, height: 110 },
  emptyText: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: '500',
    color: colors.textBody,
    textAlign: 'center',
    maxWidth: 240,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  input: { flex: 1, fontFamily: typography.fontFamily, fontSize: 15, color: colors.textHeading, padding: 0 },
});
