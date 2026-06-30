import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Modal as RNModal } from 'react-native';
import { CalendarBlank, ArrowRight } from 'phosphor-react-native';
import { colors, radius, spacing, typography, inputShadowDefault, inputShadowFocus } from '../../theme';
import { Calendar } from '../Calendar';

export type DatePickerMode = 'single' | 'range';

export interface DatePickerProps {
  /** `single` (one date) or `range` (start → end). Default `single`. */
  mode?: DatePickerMode;
  /** Field label above the input. */
  label?: string;

  // ---- single ----
  /** Selected date (single mode). */
  value?: Date | null;
  /** Fired with the picked date (single mode). */
  onChange?: (date: Date | null) => void;

  // ---- range ----
  /** Range start (range mode). */
  startDate?: Date | null;
  /** Range end (range mode). */
  endDate?: Date | null;
  /** Fired with the picked range on Submit (range mode). */
  onRangeChange?: (start: Date | null, end: Date | null) => void;

  /** Placeholder shown per segment. Default `dd/mm/yyyy`. */
  placeholder?: string;
  /** Helper text below the field. */
  helper?: string;
  /** Error message — red border + red helper. */
  error?: string;
  disabled?: boolean;
  /** Title shown at the top of the picker sheet. */
  sheetTitle?: string;
  style?: object;
}

/** dd/mm/yyyy */
function fmt(d?: Date | null): string | null {
  if (!d) return null;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()}`;
}

/**
 * DatePicker — a labeled input field that opens the Calendar in a bottom sheet.
 *
 * Figma: Bajaj-Mobile-DS node 3959:2885. The field mirrors the Textfield shell
 * (40px, 1px #CBD5E1 border, radius 8, Rubik) with a trailing calendar icon.
 * `single` shows one date + a single-select calendar; `range` shows
 * "start → end" + a range calendar with a Submit / Reset footer.
 */
export const DatePicker: React.FC<DatePickerProps> = ({
  mode = 'single',
  label,
  value,
  onChange,
  startDate,
  endDate,
  onRangeChange,
  placeholder = 'dd/mm/yyyy',
  helper,
  error,
  disabled,
  sheetTitle,
  style,
}) => {
  const [open, setOpen] = useState(false);
  // Range selection is staged inside the sheet and committed on Submit.
  const [tStart, setTStart] = useState<Date | null>(startDate ?? null);
  const [tEnd, setTEnd] = useState<Date | null>(endDate ?? null);

  useEffect(() => {
    if (open && mode === 'range') {
      setTStart(startDate ?? null);
      setTEnd(endDate ?? null);
    }
  }, [open, mode, startDate, endDate]);

  const close = () => setOpen(false);
  const openSheet = () => {
    if (!disabled) setOpen(true);
  };

  const fieldText = colors.textHeading;
  const placeholderColor = colors.textMuted;
  const iconColor = disabled ? colors.textDisabled : colors.textBody;

  const borderColor = disabled ? colors.borderSubtle : error ? colors.danger : colors.border;
  const ring = disabled ? null : error ? null : open ? inputShadowFocus : inputShadowDefault;

  const startText = mode === 'range' ? fmt(startDate) : fmt(value);
  const endText = fmt(endDate);

  return (
    <View style={[styles.wrap, style]}>
      {!!label && <Text style={styles.label}>{label}</Text>}

      <Pressable
        onPress={openSheet}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={`${label ?? 'Date'}: ${startText ?? placeholder}`}
        style={[
          styles.field,
          { borderColor, backgroundColor: colors.surface },
          ring as object,
        ]}
      >
        <View style={styles.fieldContent}>
          <Text
            style={[styles.valueText, { color: disabled ? colors.textDisabled : startText ? fieldText : placeholderColor }]}
            numberOfLines={1}
          >
            {startText ?? placeholder}
          </Text>

          {mode === 'range' && (
            <>
              <ArrowRight size={16} color={disabled ? colors.textDisabled : colors.textBody} />
              <Text
                style={[styles.valueText, { color: disabled ? colors.textDisabled : endText ? fieldText : placeholderColor }]}
                numberOfLines={1}
              >
                {endText ?? placeholder}
              </Text>
            </>
          )}
        </View>

        <CalendarBlank size={20} color={iconColor} />
      </Pressable>

      {!!(error || helper) && (
        <Text style={[styles.helper, disabled && styles.helperDisabled, error && styles.errorText]}>
          {error ?? helper}
        </Text>
      )}

      {/* ---- Picker sheet ---- */}
      <RNModal visible={open} transparent animationType="slide" onRequestClose={close} statusBarTranslucent>
        <View style={styles.sheetRoot} pointerEvents="box-none">
          <Pressable style={styles.backdrop} onPress={close} accessibilityLabel="Dismiss date picker" />
          <View style={styles.sheet} pointerEvents="auto">
            <View style={styles.handleWrap}>
              <View style={styles.handle} />
            </View>
            <Text style={styles.sheetTitle}>
              {sheetTitle ?? (mode === 'range' ? 'Select date range' : 'Select date')}
            </Text>

            {mode === 'single' ? (
              <Calendar
                mode="single"
                selectedDate={value ?? null}
                onDateSelect={(d) => {
                  onChange?.(d);
                  close();
                }}
              />
            ) : (
              <>
                <Calendar
                  mode="range"
                  startDate={tStart}
                  endDate={tEnd}
                  onRangeSelect={(s, e) => {
                    setTStart(s);
                    setTEnd(e);
                  }}
                />
                <View style={styles.footer}>
                  <Pressable
                    style={[styles.footerBtn, styles.footerBtnSecondary]}
                    onPress={() => {
                      setTStart(null);
                      setTEnd(null);
                      onRangeChange?.(null, null);
                      close();
                    }}
                    accessibilityRole="button"
                  >
                    <Text style={styles.footerBtnSecondaryText}>{tStart ? 'Reset' : 'Cancel'}</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.footerBtn, styles.footerBtnPrimary]}
                    onPress={() => {
                      onRangeChange?.(tStart, tEnd);
                      close();
                    }}
                    accessibilityRole="button"
                  >
                    <Text style={styles.footerBtnPrimaryText}>Submit</Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </View>
      </RNModal>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm, alignSelf: 'stretch' },
  label: { fontFamily: typography.fontFamily, fontSize: 14, lineHeight: 20, fontWeight: '400', color: colors.textBody },
  // Mirrors Textfield: 40px shell, 1px border, radius 8, padding 8/12.
  field: {
    alignSelf: 'stretch',
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
  },
  fieldContent: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexShrink: 1 },
  valueText: { fontFamily: typography.fontFamily, fontSize: 14, lineHeight: 20 },
  helper: { fontFamily: typography.fontFamily, fontSize: 14, lineHeight: 20, color: colors.textBody },
  helperDisabled: { color: colors.textDisabled },
  errorText: { color: colors.danger },

  // Sheet
  sheetRoot: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'flex-end' },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(26, 26, 26, 0.36)' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  handleWrap: { alignItems: 'center', paddingVertical: spacing.sm },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.borderSubtle },
  sheetTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
    color: colors.textHeading,
    marginBottom: spacing.md,
  },
  footer: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  footerBtn: { flex: 1, height: 44, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  footerBtnSecondary: { borderWidth: 1, borderColor: colors.brand, backgroundColor: colors.surface },
  footerBtnSecondaryText: { fontFamily: typography.fontFamily, fontSize: 16, fontWeight: '600', color: colors.brand },
  footerBtnPrimary: { backgroundColor: colors.brand },
  footerBtnPrimaryText: { fontFamily: typography.fontFamily, fontSize: 16, fontWeight: '600', color: colors.textOnBrand },
});
