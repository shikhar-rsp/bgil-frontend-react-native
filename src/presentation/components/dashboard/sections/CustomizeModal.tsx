import React, { useEffect, useState } from 'react';
import { View, Text, Modal, Pressable, ScrollView, StyleSheet } from 'react-native';
import { CheckSquare, Square, X } from 'phosphor-react-native';
import { Button, colors, spacing, radius, typography } from '@atlas-ds/react-native';

export type CustomizeOption = { label: string; value: string };

interface CustomizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSelections: string[];
  onUpdate: (next: string[]) => void;
  title?: string;
  description?: string;
  options?: CustomizeOption[];
  maxSelections?: number;
}

/**
 * Multi-select customiser used by Quick Quotes and Your Toolkit. The web used a
 * grid of single-select Dropdown "slots" with DOM-class hacks; on native this is
 * a plain checklist that enforces `maxSelections` — same outcome (a set of up to
 * N values), without any DOM coupling.
 */
export const CustomizeModal: React.FC<CustomizeModalProps> = ({
  isOpen,
  onClose,
  initialSelections,
  onUpdate,
  title = 'Customise Toolkit',
  description = 'Select the items to show on your dashboard',
  options = [],
  maxSelections = 6,
}) => {
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      setSelected(initialSelections.slice(0, maxSelections));
    }
  }, [isOpen, initialSelections, maxSelections]);

  const toggle = (value: string) => {
    setSelected((prev) => {
      if (prev.includes(value)) {
        return prev.filter((v) => v !== value);
      }
      if (prev.length >= maxSelections) {
        return prev; // at cap — ignore
      }
      return [...prev, value];
    });
  };

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.scrim}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.description}>{description}</Text>
            </View>
            <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close" hitSlop={8}>
              <X size={20} color={colors.textMuted} />
            </Pressable>
          </View>

          <Text style={styles.counter}>
            {selected.length}/{maxSelections} selected
          </Text>

          <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
            {options.map((opt) => {
              const checked = selected.includes(opt.value);
              const atCap = !checked && selected.length >= maxSelections;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => toggle(opt.value)}
                  disabled={atCap}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked, disabled: atCap }}
                  style={[styles.row, atCap && styles.rowDisabled]}
                >
                  {checked ? (
                    <CheckSquare size={22} weight="fill" color={colors.brand} />
                  ) : (
                    <Square size={22} color={atCap ? colors.textDisabled : colors.textMuted} />
                  )}
                  <Text style={[styles.rowLabel, atCap && styles.rowLabelDisabled]}>{opt.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.footer}>
            <Button
              label="Reset"
              variant="secondaryGray"
              onPress={() => setSelected([])}
              style={styles.footerBtn}
            />
            <Button
              label="Update"
              onPress={() => {
                onUpdate(selected);
                onClose();
              }}
              disabled={selected.length === 0}
              style={styles.footerBtn}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '80%',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerText: { flex: 1, paddingRight: spacing.md },
  title: { fontFamily: typography.fontFamily, fontSize: 18, fontWeight: '600', color: colors.textHeading },
  description: { fontFamily: typography.fontFamily, fontSize: 13, color: colors.textBody, marginTop: spacing.xs },
  counter: { fontFamily: typography.fontFamily, fontSize: 12, color: colors.textMuted, marginTop: spacing.md },
  list: { marginTop: spacing.sm },
  listContent: { gap: spacing.xs },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
  },
  rowDisabled: { opacity: 0.5 },
  rowLabel: { fontFamily: typography.fontFamily, fontSize: 15, color: colors.textHeading },
  rowLabelDisabled: { color: colors.textMuted },
  footer: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  footerBtn: { flex: 1 },
});
