import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, Dimensions, StyleSheet } from 'react-native';
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
  Modal,
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

// Cap the scroll area to a fraction of the screen so the sheet fits, but leave
// enough room that a focused field's ring isn't clipped at the edge.
const SCROLL_MAX_HEIGHT = Math.round(Dimensions.get('window').height * 0.6);

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
export const pedTagLabels = (peds?: PedData): string[] =>
  peds
    ? [
        ...peds.selectedPeds
          .map((i) => PED_CONDITIONS[i]?.label)
          .filter((l): l is string => !!l)
          .map((l) => l.replace(/\s*\(.*\)\s*$/, '').trim()),
        ...peds.customConditions,
      ]
    : [];

export const PEDDetailsModal: React.FC<PEDDetailsModalProps> = ({ isOpen, onClose, onConfirm, memberName, initialData }) => {
  const [selectedPeds, setSelectedPeds] = useState<number[]>([]);
  const [pedDetails, setPedDetails] = useState<Record<number, string>>({});
  const [customConditions, setCustomConditions] = useState<string[]>([]);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [showWarning, setShowWarning] = useState(true);

  // Re-seed from the member's saved conditions every time it opens.
  useEffect(() => {
    if (!isOpen) {
      return;
    }
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
    <Modal
      visible={isOpen}
      onClose={onClose}
      title="Select Pre-existing Conditions"
      subtitle={`for ${memberName}`}
      style={styles.surface}
      primaryAction={{ label: 'Confirm', onPress: () => onConfirm?.({ selectedPeds, details: pedDetails, customConditions }) }}
      secondaryAction={{ label: 'Cancel', onPress: onClose }}
    >
      <View style={styles.content}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollInner}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
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
            <View style={styles.customBlock}>
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
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // Widen the DS Modal's fixed 335px surface for the dense condition list.
  // The modal root already pads the sides, so fill that width (not a % of it).
  surface: { width: '100%', },
  content: { gap: spacing.md, width: '100%', },
  scroll: { maxHeight: SCROLL_MAX_HEIGHT },
  // Vertical padding keeps a focused field's ring from being clipped at the edge.
  scrollInner: { gap: spacing.md, paddingVertical: spacing.xs },
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
