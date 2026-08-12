import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Radio, colors, spacing, radius, typography } from '@atlas-ds/react-native';
import { MotorCard, motorColors, SummaryRow } from './motorUi';
import type { NcbSlab } from './motorQuoteData';

interface NoClaimBonusCardProps {
  /** `null` until the agent answers — the discount row stays hidden till then. */
  claimMade: boolean | null;
  setClaimMade: (val: boolean) => void;
  slab: NcbSlab;
}

const OPTIONS = [
  { label: 'Yes', value: true },
  { label: 'No', value: false },
];

export const NoClaimBonusCard: React.FC<NoClaimBonusCardProps> = ({
  claimMade,
  setClaimMade,
  slab,
}) => (
  <MotorCard title="No Claim Bonus">
    <Text style={styles.question}>
      Claim made on the expiring policy? <Text style={styles.asterisk}>*</Text>
    </Text>

    <View style={styles.tiles}>
      {OPTIONS.map((option) => {
        const isSelected = claimMade === option.value;

        return (
          <Pressable
            key={option.label}
            onPress={() => setClaimMade(option.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected }}
            style={[
              styles.tile,
              isSelected ? styles.tileSelected : styles.tileDefault,
            ]}
          >
            {/* The tile is the touch target; the ring is decoration.
                `Radio` sets `alignSelf: flex-start` for the case where it owns
                a label — here it would override the tile's centring and pin the
                ring to the top of the row, so centre it back. */}
            <Radio selected={isSelected} size="md" style={styles.radio} />
            <Text style={styles.tileLabel}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>

    {claimMade !== null ? (
      <SummaryRow
        label="No claim bonus discount"
        caption={slab.label}
        value={`${slab.percent}%`}
      />
    ) : null}
  </MotorCard>
);

const styles = StyleSheet.create({
  question: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textBody,
  },
  asterisk: { color: colors.dangerText },
  tiles: { flexDirection: 'row', gap: spacing.md },
  tile: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: 40,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderRadius: radius.lg,
  },
  radio: { alignSelf: 'center' },
  tileDefault: { borderColor: colors.borderSubtle, backgroundColor: colors.surface },
  tileSelected: { borderColor: motorColors.selectedBorder, backgroundColor: motorColors.infoFill },
  tileLabel: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textHeading },
});
