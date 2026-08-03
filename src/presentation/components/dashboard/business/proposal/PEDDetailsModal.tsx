import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import {
  Heartbeat,
  Hospital,
  Cigarette,
  UsersThree,
  FileText,
  Syringe,
  Virus,
  ArrowCounterClockwise,
  Plus,
  type IconProps,
} from 'phosphor-react-native';
import {
  BottomSheet,
  Button,
  Checkbox,
  Textfield,
  Tag,
  Badge,
  ToastGlobal,
  colors,
  spacing,
  radius,
  typography,
} from '@atlas-ds/react-native';
import type { PedData } from './proposalData';

interface PEDDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: (data: PedData) => void;
  memberName: string;
  /** The member's saved conditions, used to seed the modal each time it opens. */
  initialData?: PedData;
}

// Pre-existing condition categories. Each carries a coloured icon; the array
// index is what gets persisted in `selectedPeds`.
const PED_CONDITIONS: { label: string; Icon: React.ComponentType<IconProps>; color: string; bg: string }[] = [
  { label: 'Major Illnesses (Heart, Diabetes, Cancer & More)', Icon: Heartbeat, color: '#EA580C', bg: '#FFF7ED' },
  { label: 'Medical History (Treatment, Surgery & Hospitalization)', Icon: Hospital, color: '#DB2777', bg: '#FDF2F8' },
  { label: 'Lifestyle Habits (Tobacco & Alcohol Usage)', Icon: Cigarette, color: '#2563EB', bg: '#EFF6FF' },
  { label: 'Family History (Cancer, Heart Attack, Stroke)', Icon: UsersThree, color: '#1E293B', bg: '#F8FAFC' },
  { label: 'Insurance History (Declined or Postponed Cases)', Icon: FileText, color: '#0D9488', bg: '#F0FDFA' },
  { label: 'Vaccination Status (Covid-19 Vaccination)', Icon: Syringe, color: '#7C3AED', bg: '#F5F3FF' },
  { label: 'Covid History (Diagnosis & Recovery Details)', Icon: Virus, color: '#7C3AED', bg: '#F5F3FF' },
];

/**
 * Labels for the selected conditions + custom entries, for summary tags. The
 * parenthetical qualifier is dropped (e.g. "Vaccination Status (Covid-19
 * Vaccination)" → "Vaccination Status") to keep the card tags short.
 */
/**
 * A PED chip on the member card, carrying what it maps back to so it can be
 * removed: an index into the fixed list, or `null` for a custom condition.
 */
export type PedTag = { label: string; index: number | null };

export const pedTags = (peds?: PedData): PedTag[] =>
  peds
    ? [
        ...peds.selectedPeds
          .map((i) => ({ index: i as number | null, label: PED_CONDITIONS[i]?.label }))
          .filter((t): t is PedTag => !!t.label)
          .map((t) => ({ index: t.index, label: t.label.replace(/\s*\(.*\)\s*$/, '').trim() })),
        ...peds.customConditions.map((label) => ({ index: null, label })),
      ]
    : [];

/** Drop one chip from a member's PEDs, taking its detail text with it. */
export const removePedTag = (peds: PedData, tag: PedTag): PedData => {
  if (tag.index === null) {
    return { ...peds, customConditions: peds.customConditions.filter((c) => c !== tag.label) };
  }
  const details = { ...peds.details };
  delete details[tag.index];
  return { ...peds, selectedPeds: peds.selectedPeds.filter((i) => i !== tag.index), details };
};

export const PEDDetailsModal: React.FC<PEDDetailsModalProps> = ({ isOpen, onClose, onConfirm, memberName, initialData }) => {
  const [selectedPeds, setSelectedPeds] = useState<number[]>([]);
  const [pedDetails, setPedDetails] = useState<Record<number, string>>({});
  const [customConditions, setCustomConditions] = useState<string[]>([]);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [showWarning, setShowWarning] = useState(true);

  // "Add more" reveals the input below the fold, so the sheet is scrolled to it
  // — otherwise the button appears to do nothing. Guarded so that adding a
  // condition (which grows the block) doesn't yank the view again.
  const contentRef = useRef<ScrollView>(null);
  const scrolledToCustom = useRef(false);

  // Re-seed from the member's saved conditions every time it opens.
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    scrolledToCustom.current = false;
    setSelectedPeds(initialData?.selectedPeds ?? []);
    setPedDetails(initialData?.details ?? {});
    setCustomConditions(initialData?.customConditions ?? []);
    setShowCustomInput((initialData?.customConditions?.length ?? 0) > 0);
    setCustomInput('');
    setShowWarning(true);
  }, [isOpen, initialData]);

  const totalSelected = selectedPeds.length + customConditions.length;

  const togglePed = (index: number) =>
    setSelectedPeds((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]));

  const handleDetailChange = (index: number, val: string) =>
    setPedDetails((prev) => ({ ...prev, [index]: val }));

  const handleClearAll = () => {
    setSelectedPeds([]);
    setPedDetails({});
    setCustomConditions([]);
  };

  const handleAddCustom = () => {
    const value = customInput.trim();
    if (!value || customConditions.includes(value)) {
      return;
    }
    setCustomConditions((prev) => [...prev, value]);
    setCustomInput('');
  };

  const handleRemoveCustom = (value: string) =>
    setCustomConditions((prev) => prev.filter((c) => c !== value));

  return (
    <BottomSheet
      visible={isOpen}
      onClose={onClose}
      title="Select Pre-existing Conditions"
      subtitle={`for ${memberName}`}
      contentRef={contentRef}
      primaryAction={{ label: 'Confirm', onPress: () => onConfirm?.({ selectedPeds, details: pedDetails, customConditions }) }}
      secondaryAction={{ label: 'Cancel', onPress: onClose }}
    >
      <View style={styles.content}>
          {/* Truthful-disclosure warning */}
          {showWarning ? (
            <ToastGlobal
              variant="warning"
              title="Please disclose all pre-existing conditions truthfully."
              message="Non-disclosure may lead to policy rejection."
              onClose={() => setShowWarning(false)}
            />
          ) : null}

          {/* Selected count + clear all */}
          {totalSelected > 0 ? (
            <View style={styles.countRow}>
              <View style={styles.countLeft}>
                <Badge variant="light" color="neutral" size="sm" label={`${totalSelected} PED(s)`} />
                <Text style={styles.countText}> Selected</Text>
              </View>
              <Button
                label="Clear All"
                variant="link"
                size="sm"
                leadingIcon={<ArrowCounterClockwise size={16} color={colors.brand} />}
                onPress={handleClearAll}
              />
            </View>
          ) : null}

          {/* Condition list */}
          <View style={styles.list}>
            {PED_CONDITIONS.map((condition, index) => {
              const isSelected = selectedPeds.includes(index);
              const { Icon } = condition;
              return (
                <View key={condition.label} style={styles.conditionCol}>
                  <Pressable style={styles.conditionRow} onPress={() => togglePed(index)}>
                    <View style={[styles.iconBox, { backgroundColor: condition.bg }]}>
                      <Icon size={16} color={condition.color} />
                    </View>
                    <Checkbox size="sm" checked={isSelected} onChange={() => togglePed(index)} />
                    <Text style={styles.conditionLabel}>{condition.label}</Text>
                  </Pressable>

                  {isSelected ? (
                    <View style={styles.detailWrap}>
                      <Textfield
                        placeholder="Add details if necessary"
                        value={pedDetails[index] || ''}
                        onChangeText={(t) => handleDetailChange(index, t)}
                      />
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>

          {/* Add more */}
          <View style={styles.addMoreRow}>
            <Button
              label="Add more"
              variant="secondary"
              size="sm"
              leadingIcon={<Plus size={16} color={colors.brand} />}
              onPress={() => setShowCustomInput(true)}
            />
          </View>

          {/* Not in the list — add a custom condition */}
          {showCustomInput ? (
            <View
              style={styles.customBlock}
              onLayout={() => {
                if (scrolledToCustom.current) {
                  return;
                }
                scrolledToCustom.current = true;
                // The block is the last thing in the sheet, so the end of the
                // scroll IS the typing area — no offset maths needed.
                contentRef.current?.scrollToEnd({ animated: true });
              }}
            >
              <Text style={styles.customLabel}>Not in the list? Add it</Text>
              <View style={styles.customInputRow}>
                <View style={styles.customInputField}>
                  <Textfield
                    placeholder="e.g. Thalassemia, Sickle cell..."
                    value={customInput}
                    onChangeText={setCustomInput}
                  />
                </View>
                <Button
                  iconOnly
                  label="Add condition"
                  variant="primary"
                  leadingIcon={<Plus size={20} color={colors.textOnBrand} />}
                  disabled={!customInput.trim()}
                  onPress={handleAddCustom}
                />
              </View>

              {customConditions.length > 0 ? (
                <View style={styles.tags}>
                  {customConditions.map((condition) => (
                    <Tag key={condition} size="sm" label={condition} onRemove={() => handleRemoveCustom(condition)} />
                  ))}
                </View>
              ) : null}
            </View>
          ) : null}
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  // The sheet's own content slot scrolls and caps at 90% of the screen, so the
  // long condition list no longer needs a fixed-height scroller of its own —
  // which is what clipped "Add more" out of a centred dialog.
  content: { gap: spacing.md, width: '100%', paddingVertical: spacing.xs },
  countRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  countLeft: { flexDirection: 'row', alignItems: 'center' },
  countText: { fontFamily: typography.fontFamily, fontSize: 12, color: colors.textBody },
  list: { gap: spacing.md },
  conditionCol: { gap: spacing.sm },
  conditionRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  iconBox: { padding: spacing.xs, borderRadius: radius.sm },
  conditionLabel: { flex: 1, fontFamily: typography.fontFamily, fontSize: 15, lineHeight: 22, color: colors.textHeading },
  detailWrap: { paddingLeft: spacing.xs },
  addMoreRow: { alignItems: 'flex-start', },
  customBlock: { gap: spacing.sm },
  customLabel: { fontFamily: typography.fontFamily, fontSize: 14, lineHeight: 20, color: colors.textBody },
  customInputRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  customInputField: { flex: 1, marginLeft: 4 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, paddingTop: spacing.xs },
});
