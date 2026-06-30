import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, typography } from '../../theme';
import { Button } from '../Button';

export interface CoachMarkProps {
  /** Heading (Heading 2 / 20px). */
  heading: string;
  /** Body copy. */
  text: string;
  /** Step indicator shown on the left of the footer, e.g. "1 of 4". */
  step?: string;
  /** Left-aligned skip action. Replaces `step` when set. */
  onSnooze?: () => void;
  snoozeLabel?: string;
  /** Back action — hidden when omitted. */
  onBack?: () => void;
  /** Next/primary action. */
  onNext?: () => void;
  backLabel?: string;
  nextLabel?: string;
  style?: object;
}

/**
 * CoachMark — a product-tour step card (Figma Coach marks): heading, body and
 * a Skip/Back/Next footer. Radius 8, soft shadow, 20/24 heading #1E293B,
 * 14/20 body #475569, brand Next button.
 */
export const CoachMark: React.FC<CoachMarkProps> = ({
  heading,
  text,
  step,
  onSnooze,
  snoozeLabel = 'Snooze',
  onBack,
  onNext,
  backLabel = 'Back',
  nextLabel = 'Next',
  style,
}) => (
  <View style={[styles.card, style]}>
    <Text style={styles.heading}>{heading}</Text>
    <Text style={styles.text}>{text}</Text>
    <View style={styles.footer}>
      <View style={styles.actionsLeft}>
        {onSnooze ? (
          <Button
            label={snoozeLabel}
            variant="tertiary"
            size="sm"
            onPress={onSnooze}
            labelStyle={styles.footerBtnLabel}
          />
        ) : step ? (
          <Text style={styles.step}>{step}</Text>
        ) : null}
      </View>
      <View style={styles.actions}>
        {onBack ? (
          <Button
            label={backLabel}
            variant="secondary"
            size="sm"
            onPress={onBack}
            style={styles.backBtn}
            labelStyle={styles.footerBtnLabel}
          />
        ) : null}
        {onNext ? (
          <Button
            label={nextLabel}
            variant="primary"
            size="sm"
            onPress={onNext}
            style={styles.primaryBtn}
            labelStyle={styles.footerBtnLabel}
          />
        ) : null}
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    alignSelf: 'stretch',
    maxWidth: 340,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 20,
    gap: 12,
    shadowColor: '#0A0D12',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  heading: { fontFamily: typography.fontFamily, fontSize: 20, lineHeight: 24, fontWeight: '400', color: colors.textHeading },
  text: { fontFamily: typography.fontFamily, fontSize: 14, lineHeight: 20, color: colors.textBody },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  actionsLeft: { flexDirection: 'row', alignItems: 'center' },
  step: { fontFamily: typography.fontFamily, fontSize: 12, lineHeight: 16, color: colors.textMuted },
  actions: { flexDirection: 'row', gap: 8 },
  footerBtnLabel: { fontFamily: typography.fontFamily, ...typography.body3 },
  backBtn: { borderRadius: radius.lg, borderColor: colors.brand },
  primaryBtn: { minWidth: 88, borderRadius: radius.lg, backgroundColor: colors.brand },
});
