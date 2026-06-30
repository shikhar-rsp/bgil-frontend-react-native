/**
 * Toast status icons — Phosphor regular weight, sized to match web toasts (20px
 * status, 16px close).
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import {
  Info,
  CheckCircle,
  Warning,
  XCircle,
  X,
  Sparkle,
  Hexagon,
} from 'phosphor-react-native';

export interface IconProps {
  color: string;
  size?: number;
}

const STATUS_SIZE = 20;
const CLOSE_SIZE = 16;

export const InfoIcon: React.FC<IconProps> = ({ color, size = STATUS_SIZE }) => (
  <View style={[styles.slot, { width: size, height: size }]} accessibilityElementsHidden>
    <Info size={size} color={color} weight="regular" />
  </View>
);

export const CheckCircleIcon: React.FC<IconProps> = ({ color, size = STATUS_SIZE }) => (
  <View style={[styles.slot, { width: size, height: size }]} accessibilityElementsHidden>
    <CheckCircle size={size} color={color} weight="regular" />
  </View>
);

/** Warning triangle — `bg` kept for API compat (unused with Phosphor). */
export const AlertTriangleIcon: React.FC<IconProps & { bg?: string }> = ({
  color,
  size = STATUS_SIZE,
}) => (
  <View style={[styles.slot, { width: size, height: size }]} accessibilityElementsHidden>
    <Warning size={size} color={color} weight="regular" />
  </View>
);

export const XCircleIcon: React.FC<IconProps> = ({ color, size = STATUS_SIZE }) => (
  <View style={[styles.slot, { width: size, height: size }]} accessibilityElementsHidden>
    <XCircle size={size} color={color} weight="regular" />
  </View>
);

/** @deprecated Use `XCircleIcon` — kept as alias for older call sites. */
export const AlertCircleIcon = XCircleIcon;

export const SparkleIcon: React.FC<IconProps> = ({ color, size = STATUS_SIZE }) => (
  <View style={[styles.slot, { width: size, height: size }]} accessibilityElementsHidden>
    <Sparkle size={size} color={color} weight="regular" />
  </View>
);

export const HexagonIcon: React.FC<IconProps> = ({ color, size = STATUS_SIZE }) => (
  <View style={[styles.slot, { width: size, height: size }]} accessibilityElementsHidden>
    <Hexagon size={size} color={color} weight="regular" />
  </View>
);

export const CloseIcon: React.FC<IconProps> = ({ color, size = CLOSE_SIZE }) => (
  <View style={[styles.slot, { width: size, height: size }]} accessibilityElementsHidden>
    <X size={size} color={color} weight="regular" />
  </View>
);

const styles = StyleSheet.create({
  slot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
