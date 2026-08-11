import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import {
  Checkbox,
  Badge,
  DatePicker,
  colors,
  spacing,
  radius,
  typography,
  shadow,
  fontFamilyForWeight,
} from '@atlas-ds/react-native';
import { NumberStepper } from './NumberStepper';
import { RequiredField } from './RequiredField';
import {
  coverageGroupsFor,
  countCovered,
  maxMembersFor,
  type Coverage,
  type CoverageItem,
} from './healthData';

interface WhoIsCoveredProps {
  planType: string;
  coverage: Coverage;
  /** Set one relation's count; toggles pass 0 or 1. */
  setCoverageCount: (id: string, count: number) => void;
  /** Floater only — the age the whole floater is priced on. */
  oldestMemberDOB: Date | null;
  setOldestMemberDOB: (date: Date | null) => void;
}

/**
 * "Who is covered?" — the relation picker that replaces the old adults /
 * senior-citizens / children counters. Checkbox chips for one-per-household
 * relations, number-stepper chips for the rest; the selection drives the
 * member accordions on this step and the per-member add-ons later.
 *
 * A floater sees the immediate family only (Self & Spouse, Children, Parents
 * & In-laws) plus the oldest-member DOB the policy is priced on — it has no
 * per-member accordions, since one sum insured covers everyone. Individual
 * adds Extended family. The "N can be added" hint is a static cap per plan
 * type, not a live remainder.
 */
export const WhoIsCovered: React.FC<WhoIsCoveredProps> = ({
  planType,
  coverage,
  setCoverageCount,
  oldestMemberDOB,
  setOldestMemberDOB,
}) => {
  const groups = coverageGroupsFor(planType);
  const selected = countCovered(coverage, planType);
  const max = maxMembersFor(planType);
  const atLimit = selected >= max;

  const renderItem = (item: CoverageItem) => {
    const count = coverage[item.id] ?? 0;

    if (item.kind === 'toggle') {
      const checked = count > 0;
      // Whole chip is the target — the checkbox alone is a small tap area.
      return (
        <Pressable
          key={item.id}
          style={[styles.chip, checked && styles.chipSel, !checked && atLimit && styles.chipDisabled]}
          disabled={!checked && atLimit}
          onPress={() => setCoverageCount(item.id, checked ? 0 : 1)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked, disabled: !checked && atLimit }}
        >
          <Checkbox
            size="sm"
            checked={checked}
            disabled={!checked && atLimit}
            onChange={(next) => setCoverageCount(item.id, next ? 1 : 0)}
          />
          <Text style={styles.chipLabel}>{item.label}</Text>
        </Pressable>
      );
    }

    return (
      <View key={item.id} style={[styles.chip, count > 0 && styles.chipSel]}>
        <Text style={styles.chipLabel}>{item.label}</Text>
        <NumberStepper
          value={count}
          max={item.max}
          label={item.label}
          disableIncrement={atLimit}
          onChange={(next) => setCoverageCount(item.id, next)}
        />
      </View>
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <Text style={styles.heading}>Who is covered?</Text>
        <View style={styles.headRight}>
          <Badge variant="light" size="sm" label={`${selected} Members`} />
          <Text style={styles.hint}>{max} can be added</Text>
        </View>
      </View>

      {groups.map((group) => (
        <View key={group.id} style={styles.group}>
          <Text style={styles.groupTitle}>{group.title}</Text>
          <View style={styles.chips}>{group.items.map(renderItem)}</View>
        </View>
      ))}

      {/* Floater is priced off the eldest life covered — collected here since
          the plan has no per-member accordions. */}
      {planType === 'floater' ? (
        <RequiredField label="Oldest Member DOB">
          <DatePicker placeholder="Select DOB" value={oldestMemberDOB} onChange={setOldestMemberDOB} />
        </RequiredField>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, gap: spacing.md, ...shadow.lg },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, flexWrap: 'wrap' },
  headRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  heading: { fontFamily: fontFamilyForWeight('500'), fontSize: 20, fontWeight: '500', color: colors.textHeading },
  hint: { fontFamily: typography.fontFamily, fontSize: 12, color: colors.textMuted },
  group: { gap: spacing.sm },
  groupTitle: { fontFamily: typography.fontFamily, fontSize: 13, color: colors.textBody },
  // Chips wrap rather than scroll, so a long group reflows onto phone widths.
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
  },
  chipSel: { borderColor: colors.brand, backgroundColor: '#EFF6FF' },
  chipDisabled: { backgroundColor: colors.surfaceMuted },
  chipLabel: { fontFamily: typography.fontFamily, fontSize: 14, color: colors.textHeading },
});
