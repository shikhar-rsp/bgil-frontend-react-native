import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { colors, spacing, radius, typography, shadow, fontFamilyForWeight } from '@atlas-ds/react-native';
import { dashboardImages } from '../images';

const SLIDE_COUNT = 4;

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
    <View style={styles.card}>
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
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.lg,
    ...shadow.lg,
  },
  textBlock: { gap: spacing.sm },
  heading: { fontFamily: fontFamilyForWeight('500'), fontSize: 20, fontWeight: '500', color: colors.textHeading },
  subtitle: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textBody },
  bannerWrap: { height: 150, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.brandPressed },
  banner: { width: '100%', height: '100%' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: spacing.xs },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.borderSubtle },
  dotActive: { width: 18, backgroundColor: colors.brand },
});
