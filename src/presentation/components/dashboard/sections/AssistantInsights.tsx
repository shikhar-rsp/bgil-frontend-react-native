import React, { useState } from 'react';
import { View, Text, Image, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';
import { PaperPlaneRight, Sparkle } from 'phosphor-react-native';
import { colors, spacing, radius, typography, shadow } from '@atlas-ds/react-native';
import { dashboardImages } from '../images';
import { AISuggestions } from './AISuggestions';

type Message = { type: 'ai' | 'user'; text: string };

const STARTER_CHIPS = ['Share a quote', 'Check a policy', 'Renewals due'];

interface AssistantInsightsProps {
  isWalkthroughActive?: boolean;
  showTasks?: boolean;
  showAISuggestions?: boolean;
}

/**
 * "MyAI" assistant panel. The web version was a large chat + business-insights
 * surface; this ports the home chat experience (greeting, quick-reply chips, a
 * working message thread) and delegates the empty-state variant to AISuggestions.
 */
export const AssistantInsights: React.FC<AssistantInsightsProps> = ({ showAISuggestions = false }) => {
  const [messages, setMessages] = useState<Message[]>([
    { type: 'ai', text: "Hi! I'm MyAI, your business buddy. How can I help you today?" },
  ]);
  const [input, setInput] = useState('');

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) {
      return;
    }
    setMessages((prev) => [
      ...prev,
      { type: 'user', text: trimmed },
      { type: 'ai', text: "Got it — I'm on it. (Demo response.)" },
    ]);
    setInput('');
  };

  if (showAISuggestions) {
    return <AISuggestions />;
  }

  return (
    <View style={styles.card}>
      <View style={styles.gradientHeader}>
        <Text style={styles.headerText}>
          Hey I'm <Text style={styles.headerAccent}>My AI</Text>
        </Text>
        <Sparkle size={20} color={colors.textOnBrand} weight="fill" />
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        {messages.map((msg, index) => (
          <View
            key={index}
            style={[styles.bubbleRow, msg.type === 'user' ? styles.rowEnd : styles.rowStart]}
          >
            {msg.type === 'ai' ? (
              <Image source={dashboardImages.aiLogo} style={styles.aiAvatar} />
            ) : null}
            <View style={[styles.bubble, msg.type === 'ai' ? styles.aiBubble : styles.userBubble]}>
              <Text style={msg.type === 'ai' ? styles.aiText : styles.userText}>{msg.text}</Text>
            </View>
          </View>
        ))}

        {messages.length <= 1 ? (
          <View style={styles.chips}>
            {STARTER_CHIPS.map((chip) => (
              <Pressable key={chip} style={styles.chip} onPress={() => send(chip)} accessibilityRole="button">
                <Text style={styles.chipText}>{chip}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.inputRow}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Ask me anything"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          onSubmitEditing={() => send(input)}
          returnKeyType="send"
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Send"
          hitSlop={8}
          onPress={() => send(input)}
        >
          <PaperPlaneRight size={18} color={colors.brand} weight="fill" />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...shadow.lg,
  },
  gradientHeader: {
    height: 54,
    backgroundColor: colors.brand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  headerText: { fontFamily: typography.fontFamily, fontSize: 20, fontWeight: '500', color: colors.textOnBrand },
  headerAccent: { color: '#B1A6FF' },
  body: { maxHeight: 360 },
  bodyContent: { padding: spacing.lg, gap: spacing.sm },
  bubbleRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm },
  rowStart: { justifyContent: 'flex-start' },
  rowEnd: { justifyContent: 'flex-end' },
  aiAvatar: { width: 32, height: 32 },
  bubble: { maxWidth: '75%', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderWidth: 1 },
  aiBubble: {
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 0,
    borderTopRightRadius: radius.xl,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  userBubble: {
    borderColor: colors.border,
    backgroundColor: '#0F4C81',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  aiText: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textHeading },
  userText: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textOnBrand },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceSubtle,
  },
  chipText: { fontFamily: typography.fontFamily, fontSize: 13, color: colors.textBody },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    margin: spacing.lg,
    marginTop: 0,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  input: { flex: 1, fontFamily: typography.fontFamily, fontSize: 15, color: colors.textHeading, padding: 0 },
});
