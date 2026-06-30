import React, { useState } from 'react';
import { View, Text, Image, Pressable, Linking, StyleSheet } from 'react-native';
import { Phone } from 'phosphor-react-native';
import { Button, TextArea, colors, spacing, radius, typography } from '@atlas-ds/react-native';
import { AuthLayout } from '../../components/auth/AuthLayout';
import type { AuthScreenProps } from '../../../navigation';

const RM_PHONE = '+918687518745';

export const GetHelp: React.FC<AuthScreenProps<'GetHelp'>> = ({ navigation, route }) => {
  const persona = route.params?.persona ?? 'agent';
  const [query, setQuery] = useState('');

  return (
    <AuthLayout showBanner={false}>
      <Text style={styles.title}>Not able to login?</Text>

      {persona === 'agent' ? (
        <View style={styles.agentBlock}>
          <View>
            <Text style={styles.sectionLabel}>Your Relationship Manager Details</Text>
            <View style={styles.rmCard}>
              <View style={styles.rmInfo}>
                <Image
                  source={require('../../../../assets/images/rm-profile.png')}
                  style={styles.avatar}
                />
                <View>
                  <Text style={styles.rmName}>Manish Jain</Text>
                  <Text style={styles.rmCode}>RM9786185</Text>
                </View>
              </View>
              <Pressable
                style={styles.callBtn}
                onPress={() => Linking.openURL(`tel:${RM_PHONE}`)}
                accessibilityRole="button"
                accessibilityLabel="Call relationship manager"
              >
                <View style={styles.callIcon}>
                  <Phone size={16} color={colors.brand} />
                </View>
                <Text style={styles.callText}>+91 8687518745</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.separator}>
            <View style={styles.line} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.line} />
          </View>

          <View>
            <Text style={styles.sectionLabel}>Send a query</Text>
            <TextArea value={query} onChangeText={setQuery} placeholder="Enter a description..." />
          </View>
        </View>
      ) : (
        <View style={styles.rmBlock}>
          <Text style={styles.sectionLabelLg}>Send a query</Text>
          <TextArea
            value={query}
            onChangeText={setQuery}
            placeholder="Enter your query or issue here..."
          />
        </View>
      )}

      <View style={styles.actions}>
        <Button label="Send Query" fullWidth onPress={() => undefined} />
        <Button
          label="Back to Login"
          variant="secondaryGray"
          fullWidth
          onPress={() => navigation.navigate(persona === 'rm' ? 'RmLogin' : 'AgentLogin')}
        />
      </View>
    </AuthLayout>
  );
};

const styles = StyleSheet.create({
  title: {
    fontFamily: typography.fontFamily,
    fontSize: 30,
    fontWeight: '500',
    lineHeight: 36,
    color: colors.textHeading,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  agentBlock: { gap: spacing.lg },
  rmBlock: { gap: spacing.md },
  sectionLabel: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    color: colors.textBody,
    marginBottom: spacing.sm,
  },
  sectionLabelLg: {
    fontFamily: typography.fontFamily,
    fontSize: 18,
    color: colors.textBody,
    marginBottom: spacing.md,
  },
  rmCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  rmInfo: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: { width: 32, height: 32, borderRadius: 16 },
  rmName: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: '500',
    color: colors.textHeading,
  },
  rmCode: { fontFamily: typography.fontFamily, fontSize: 12, color: colors.textBody },
  callBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  callIcon: {
    width: 28,
    height: 28,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brandSubtle,
  },
  callText: { fontFamily: typography.fontFamily, fontSize: 13, color: colors.textBody },
  separator: { flexDirection: 'row', alignItems: 'center' },
  line: { flex: 1, height: 1, backgroundColor: colors.borderSubtle },
  orText: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    marginHorizontal: spacing.lg,
  },
  actions: { gap: spacing.lg, marginTop: spacing.xl },
});
