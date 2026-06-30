import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Linking,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, radius, typography } from '@atlas-ds/react-native';

const SUPPORT_EMAIL = 'bajajhelp@gmail.com';
const SUPPORT_PHONE = '9666845326';

type AuthLayoutProps = {
  children: React.ReactNode;
  /** Hide the promotional banner (e.g. on the success screen). */
  showBanner?: boolean;
};

/**
 * Auth shell — the React Native equivalent of the web `Layout` (which used a
 * react-router `<Outlet/>`). Renders the brand logo, an optional promo banner,
 * the screen content, and the support footer. Mobile-first: the web's desktop
 * split-pane / CSS radial gradients are chrome that doesn't apply on device.
 */
export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  showBanner = true,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.lg },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Image
          source={require('../../../../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
          accessibilityLabel="Bajaj General Insurance"
        />

        {showBanner ? (
          <View style={styles.bannerCard}>
            <Image
              source={require('../../../../assets/images/whats-new-carousal.png')}
              style={styles.banner}
              resizeMode="cover"
            />
          </View>
        ) : null}

        <View style={styles.screen}>{children}</View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Questions? Reach us at </Text>
          <Pressable onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}`)}>
            <Text style={styles.footerLink}>{SUPPORT_EMAIL}</Text>
          </Pressable>
          <Text style={styles.footerText}> or </Text>
          <Pressable onPress={() => Linking.openURL(`tel:${SUPPORT_PHONE}`)}>
            <Text style={styles.footerLink}>+91 {SUPPORT_PHONE}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.surface },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
  },
  logo: {
    width: 150,
    height: 56,
    marginBottom: spacing.lg,
  },
  bannerCard: {
    height: 180,
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: colors.brandPressed,
    marginBottom: spacing.lg,
  },
  banner: { width: '100%', height: '100%' },
  screen: { flex: 1, justifyContent: 'center' },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  footerText: {
    fontFamily: typography.fontFamily,
    fontSize: 13,
    color: colors.textBody,
  },
  footerLink: {
    fontFamily: typography.fontFamily,
    fontSize: 13,
    color: colors.brand,
    textDecorationLine: 'underline',
  },
});
