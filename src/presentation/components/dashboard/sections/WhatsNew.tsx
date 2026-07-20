import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { colors, spacing, radius, typography, shadow, fontFamilyForWeight } from '@atlas-ds/react-native';
import { dashboardImages } from '../images';

const SLIDE_COUNT = 4;
/** Promo.png intrinsic size (349×371) — full width keeps the head uncropped. */
const PROMO_ASPECT = 349 / 371;

/** "What's new" promo card with an auto-advancing banner + pagination dots. */
export const WhatsNew: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % SLIDE_COUNT);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.shadow}>
      <View style={styles.card}>
        {/* Full-width promo art behind everything (person top-right + wave). */}
        <Image source={dashboardImages.whatsNewPromo} style={styles.promo} resizeMode="contain" />

        <View style={styles.textBlock}>
          <Text style={styles.heading}>What's new</Text>
          <Text style={styles.subtitle}>Stay updated with latest news and updates from Bajaj!</Text>
        </View>

        <View style={styles.bannerWrap}>
          <Image source={dashboardImages.whatsNewBanner} style={styles.banner} resizeMode="cover" />
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
  banner: { width: '100%', height: '100%' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: spacing.xs },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.borderSubtle },
  dotActive: { width: 18, backgroundColor: colors.brand },
});
