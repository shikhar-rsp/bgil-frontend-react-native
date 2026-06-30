import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Check, X } from 'phosphor-react-native';

const ICON_SLOT = 14;
const CLOSE_SIZE = 12;
const CHECK_SIZE = 12;

type IconProps = { color: string };

/** Remove (×) — Phosphor X, regular weight. */
export const TagCloseIcon: React.FC<IconProps> = ({ color }) => (
  <View style={styles.slot} accessibilityElementsHidden>
    <X size={CLOSE_SIZE} color={color} weight="regular" />
  </View>
);

/** Selected (✓) — Phosphor Check, bold for legibility at small size. */
export const TagTickIcon: React.FC<IconProps> = ({ color }) => (
  <View style={styles.slot} accessibilityElementsHidden>
    <Check size={CHECK_SIZE} color={color} weight="bold" />
  </View>
);

const styles = StyleSheet.create({
  slot: {
    width: ICON_SLOT,
    height: ICON_SLOT,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});
