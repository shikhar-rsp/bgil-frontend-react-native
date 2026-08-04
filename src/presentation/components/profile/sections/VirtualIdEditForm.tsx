import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { Check } from 'phosphor-react-native';
import {
  Dropdown,
  TextArea,
  colors,
  spacing,
  radius,
  typography,
  fontFamilyForWeight,
} from '@atlas-ds/react-native';
import type { VirtualIdLanguage } from '../../../../domain/entities/profile_entities';
import { dashboardImages } from '../../dashboard/images';
import { VIRTUAL_ID_BIO_PLACEHOLDER, VIRTUAL_ID_LANGUAGES, VIRTUAL_ID_SERVICES } from '../constants';

export interface VirtualIdDraftState {
  secondaryLanguage: VirtualIdLanguage | null;
  shortBio: string;
  selectedServiceIds: string[];
}

interface VirtualIdEditFormProps {
  /** Account default language; locked in both flows. */
  defaultLanguage: VirtualIdLanguage;
  draft: VirtualIdDraftState;
  onChange: (draft: VirtualIdDraftState) => void;
  /**
   * `edit` matches the "Edit ID Card" pane; `create` matches the first-time
   * "Create Virtual ID Card" sheet, which drops the heading and prompts with
   * placeholder bio copy.
   */
  mode?: 'create' | 'edit';
}

/** Sentinel for "no secondary language" — Dropdown values are plain strings. */
const NONE = '__none__';

export const VirtualIdEditForm: React.FC<VirtualIdEditFormProps> = ({
  defaultLanguage,
  draft,
  onChange,
  mode = 'edit',
}) => {
  const isCreate = mode === 'create';

  const toggleService = (serviceId: string) => {
    const isSelected = draft.selectedServiceIds.includes(serviceId);
    onChange({
      ...draft,
      selectedServiceIds: isSelected
        ? draft.selectedServiceIds.filter((id) => id !== serviceId)
        : [...draft.selectedServiceIds, serviceId],
    });
  };

  const secondaryOptions = [
    { value: NONE, label: 'None' },
    ...VIRTUAL_ID_LANGUAGES.filter((lang) => lang !== defaultLanguage).map((lang) => ({
      value: lang,
      label: lang,
    })),
  ];

  return (
    <View style={styles.form}>
      {!isCreate ? <Text style={styles.formHeading}>Edit ID Card</Text> : null}

      <View style={styles.section}>
        <View>
          <Text style={styles.sectionTitle}>Select Language</Text>
          <Text style={styles.sectionHint}>Choose the language for your digital ID card.</Text>
        </View>

        {/* Account default is fixed; shown disabled to match the design. */}
        <Dropdown
          label="Default"
          options={[{ value: defaultLanguage, label: defaultLanguage }]}
          value={defaultLanguage}
          disabled
        />

        <Dropdown
          label="Secondary Language (Optional)"
          placeholder="None"
          options={secondaryOptions}
          value={draft.secondaryLanguage ?? NONE}
          onChange={(value) =>
            onChange({
              ...draft,
              secondaryLanguage: value === NONE ? null : (value as VirtualIdLanguage),
            })
          }
        />
      </View>

      <View style={styles.section}>
        <View>
          <Text style={styles.sectionTitle}>{isCreate ? 'About You' : 'Add About You'}</Text>
          <Text style={styles.sectionHint}>
            Introduce yourself to help customers know you better.
          </Text>
        </View>

        <TextArea
          label="Short Bio (Optional)"
          rows={4}
          maxLength={400}
          placeholder={isCreate ? VIRTUAL_ID_BIO_PLACEHOLDER : undefined}
          value={draft.shortBio}
          onChangeText={(text) => onChange({ ...draft, shortBio: text })}
        />
      </View>

      <View style={styles.section}>
        <View>
          <Text style={styles.sectionTitle}>Select Services</Text>
          <Text style={styles.sectionHint}>
            Choose the insurance services you want to display on your ID card.
          </Text>
        </View>

        <View style={styles.servicesGrid}>
          {VIRTUAL_ID_SERVICES.map((service) => {
            const isSelected = draft.selectedServiceIds.includes(service.id);
            return (
              <Pressable
                key={service.id}
                onPress={() => toggleService(service.id)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isSelected }}
                accessibilityLabel={service.label}
                style={[styles.serviceTile, isSelected && styles.serviceTileSelected]}
              >
                <View style={[styles.tick, isSelected && styles.tickOn]}>
                  {isSelected ? <Check size={12} color={colors.textOnBrand} weight="bold" /> : null}
                </View>
                <Image
                  source={dashboardImages[service.iconKey]}
                  style={styles.serviceIcon}
                  resizeMode="contain"
                />
                <Text style={styles.serviceLabel}>{service.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  form: { gap: spacing.xl },
  formHeading: {
    fontFamily: fontFamilyForWeight('500'),
    fontSize: 18,
    lineHeight: 24,
    color: colors.textHeading,
  },
  section: { gap: spacing.md },
  sectionTitle: {
    fontFamily: fontFamilyForWeight('500'),
    fontSize: 15,
    lineHeight: 20,
    color: colors.textHeading,
  },
  sectionHint: {
    marginTop: spacing.xs,
    fontFamily: typography.fontFamily,
    fontSize: 13,
    lineHeight: 20,
    color: colors.textBody,
  },
  servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  serviceTile: {
    width: '48%',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    padding: spacing.lg,
  },
  serviceTileSelected: { borderColor: colors.brand, backgroundColor: '#EFF6FF' },
  tick: {
    position: 'absolute',
    left: spacing.md,
    top: spacing.md,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
  },
  tickOn: { borderColor: colors.brand, backgroundColor: colors.brand },
  serviceIcon: { width: 32, height: 32 },
  serviceLabel: {
    textAlign: 'center',
    fontFamily: typography.fontFamily,
    fontSize: 13,
    lineHeight: 20,
    color: colors.textHeading,
  },
});
