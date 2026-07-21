import React, { useEffect, useRef, useState } from 'react';
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
  useWindowDimensions,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, radius, typography } from '@atlas-ds/react-native';

const SUPPORT_EMAIL = 'bajajhelp@gmail.com';
const SUPPORT_PHONE = '9666845326';

/** Promo slides for the auth banner carousel — the original banner, repeated. */
const BANNER_IMAGE = require('../../../../assets/images/whats-new-carousal.png');
const BANNER_SLIDES = [BANNER_IMAGE, BANNER_IMAGE, BANNER_IMAGE];

/** Auto-advance interval, matching the dashboard "What's new" carousel. */
const AUTO_ADVANCE_MS = 3500;

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
  const { width } = useWindowDimensions();
  // Slide width = viewport minus the layout's horizontal gutters.
  const slideWidth = width - spacing.lg * 2;
  const carouselRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-advance the banner, wrapping back to the first slide.
  useEffect(() => {
    if (!showBanner || BANNER_SLIDES.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % BANNER_SLIDES.length;
        carouselRef.current?.scrollTo({ x: next * slideWidth, animated: true });
        return next;
      });
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [showBanner, slideWidth]);

  // Keep the dots in sync when the user swipes manually.
  const onBannerScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / slideWidth);
    if (idx !== activeIndex) setActiveIndex(idx);
  };

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
          <View style={styles.carousel}>
            <View style={[styles.carouselTrack, { width: slideWidth }]}>
              <ScrollView
                ref={carouselRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={onBannerScrollEnd}
              >
                {BANNER_SLIDES.map((src, i) => (
                  <Image
                    key={i}
                    source={src}
                    style={[styles.banner, { width: slideWidth }]}
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>
            </View>
            <View style={styles.dots}>
              {BANNER_SLIDES.map((_, i) => (
                <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
              ))}
            </View>
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
  carousel: {
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  carouselTrack: {
    height: 180,
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: colors.brandPressed,
    alignSelf: 'center',
  },
  banner: { height: 180 },
  // Pagination dots — mirrors the dashboard "What's new" carousel.
  dots: { flexDirection: 'row', justifyContent: 'center', gap: spacing.xs },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.borderSubtle },
  dotActive: { width: 18, backgroundColor: colors.brand },
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
