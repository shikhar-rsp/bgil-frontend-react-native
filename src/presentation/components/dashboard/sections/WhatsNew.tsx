import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { colors, spacing, radius, typography, shadow, fontFamilyForWeight } from '@atlas-ds/react-native';
import { dashboardImages } from '../images';

const SLIDE_COUNT = 4;
/** Promo.png intrinsic size (349×371) — full width keeps the head uncropped. */
const PROMO_ASPECT = 349 / 371;

/** "What's new" promo card with an auto-advancing banner + pagination dots. */
export const WhatsNew: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [slideWidth, setSlideWidth] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  // Auto-advance the banner itself (not just the dots), wrapping at the end.
  useEffect(() => {
    if (!slideWidth) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % SLIDE_COUNT;
        scrollRef.current?.scrollTo({ x: next * slideWidth, animated: true });
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [slideWidth]);

  // Keep the dots in sync when the user swipes.
  const onBannerScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!slideWidth) return;
    const idx = Math.round(e.nativeEvent.contentOffset.x / slideWidth);
    if (idx !== activeIndex) setActiveIndex(idx);
  };

  return (
    <View style={styles.shadow}>
      <View style={styles.card}>
        {/* Full-width promo art behind everything (person top-right + wave). */}
        <Image source={dashboardImages.whatsNewPromo} style={styles.promo} resizeMode="contain" />

        <View style={styles.textBlock}>
          <Text style={styles.heading}>What's new</Text>
          <Text style={styles.subtitle}>Stay updated with latest news and updates from Bajaj!</Text>
        </View>

        <View
          style={styles.bannerWrap}
          onLayout={(e) => setSlideWidth(e.nativeEvent.layout.width)}
        >
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onBannerScrollEnd}
          >
            {Array.from({ length: SLIDE_COUNT }).map((_, i) => (
              <Image
                key={i}
                source={dashboardImages.whatsNewBanner}
                style={[styles.banner, { width: slideWidth }]}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
        </View>

        <View style={styles.dots}>
          {Array.from({ length: SLIDE_COUNT }).map((_, i) => (
            <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Shadow lives on an outer wrapper so the card's overflow:hidden (which clips
  // the promo) doesn't clip the shadow.
  shadow: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    ...shadow.lg,
  },
  card: {
    position: 'relative',
    borderRadius: radius.xl,
    overflow: 'hidden',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.lg,
    paddingBottom: spacing.md,
  },
  // Full-bleed, full-width promo anchored to the top; height follows the
  // intrinsic aspect ratio so nothing is cropped.
  promo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: '100%',
    aspectRatio: PROMO_ASPECT,
  },
  // Constrained so the copy never runs under the promo figure on the right.
  textBlock: { gap: spacing.sm, maxWidth: '58%' },
  heading: { fontFamily: fontFamilyForWeight('500'), fontSize: 20, color: colors.textHeading },
  subtitle: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textBody },
  bannerWrap: { marginTop: 63, height: 150, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.brandPressed },
  banner: { height: '100%' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: spacing.xs },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.borderSubtle },
  dotActive: { width: 34, backgroundColor: colors.brand },
});
