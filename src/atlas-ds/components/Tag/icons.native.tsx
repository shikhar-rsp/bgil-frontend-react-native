/**
 * Native (iOS/Android) Tag icons.
 *
 * The web sibling (`icons.tsx`) draws these as an SVG data-URI inside an
 * <Image>, which works under react-native-web (→ <img>) but renders blank on
 * native — RN's <Image> can't decode SVG. Metro picks THIS `.native.tsx` file
 * on iOS/Android, so native gets real vector icons via react-native-svg while
 * web is left byte-for-byte unchanged.
 *
 * Paths are identical to the web version so the two platforms match pixel-for-
 * pixel.
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const CLOSE_PATH =
  'M7.39052 6.8599C7.42536 6.89474 7.453 6.9361 7.47186 6.98162C7.49071 7.02714 7.50042 7.07594 7.50042 7.12521C7.50042 7.17448 7.49071 7.22327 7.47186 7.2688C7.453 7.31432 7.42536 7.35568 7.39052 7.39052C7.35568 7.42536 7.31432 7.453 7.2688 7.47186C7.22327 7.49071 7.17448 7.50042 7.12521 7.50042C7.07594 7.50042 7.02714 7.49071 6.98162 7.47186C6.9361 7.453 6.89474 7.42536 6.8599 7.39052L3.75021 4.28036L0.640521 7.39052C0.570156 7.46089 0.47472 7.50042 0.375208 7.50042C0.275697 7.50042 0.180261 7.46089 0.109896 7.39052C0.0395308 7.32016 1.96161e-09 7.22472 0 7.12521C-1.96161e-09 7.0257 0.0395308 6.93026 0.109896 6.8599L3.22005 3.75021L0.109896 0.640521C0.0395308 0.570156 0 0.47472 0 0.375208C0 0.275697 0.0395308 0.180261 0.109896 0.109896C0.180261 0.0395308 0.275697 0 0.375208 0C0.47472 0 0.570156 0.0395308 0.640521 0.109896L3.75021 3.22005L6.8599 0.109896C6.93026 0.0395308 7.0257 -1.96161e-09 7.12521 0C7.22472 1.96161e-09 7.32016 0.0395308 7.39052 0.109896C7.46089 0.180261 7.50042 0.275697 7.50042 0.375208C7.50042 0.47472 7.46089 0.570156 7.39052 0.640521L4.28036 3.75021L7.39052 6.8599Z';

const TICK_PATH =
  'M9.26552 0.640521L3.26552 6.64052C3.23069 6.67539 3.18934 6.70305 3.14381 6.72192C3.09829 6.74079 3.04949 6.7505 3.00021 6.7505C2.95093 6.7505 2.90213 6.74079 2.85661 6.72192C2.81108 6.70305 2.76972 6.67539 2.7349 6.64052L0.109896 4.01552C0.0395308 3.94516 0 3.84972 0 3.75021C0 3.6507 0.0395308 3.55526 0.109896 3.4849C0.180261 3.41453 0.275697 3.375 0.375208 3.375C0.47472 3.375 0.570156 3.41453 0.640521 3.4849L3.00021 5.84505L8.7349 0.109896C8.80526 0.0395306 8.9007 -7.41418e-10 9.00021 0C9.09972 7.41419e-10 9.19516 0.0395306 9.26552 0.109896C9.33589 0.180261 9.37542 0.275697 9.37542 0.375208C9.37542 0.47472 9.33589 0.570156 9.26552 0.640521Z';

type IconProps = { color: string };

/** 8×8 close — Figma tag remove icon. */
export const TagCloseIcon: React.FC<IconProps> = ({ color }) => (
  <View style={styles.slot} accessibilityElementsHidden>
    <Svg width={8} height={8} viewBox="0 0 8 8" fill="none">
      <Path d={CLOSE_PATH} fill={color} />
    </Svg>
  </View>
);

/** 10×7 check — Figma tag selected icon. */
export const TagTickIcon: React.FC<IconProps> = ({ color }) => (
  <View style={styles.slot} accessibilityElementsHidden>
    <Svg width={10} height={7} viewBox="0 0 10 7" fill="none">
      <Path d={TICK_PATH} fill={color} />
    </Svg>
  </View>
);

const styles = StyleSheet.create({
  slot: {
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});
