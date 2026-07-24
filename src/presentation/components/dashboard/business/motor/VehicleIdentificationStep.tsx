import React, { useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  Dropdown,
  Textfield,
  DatePicker,
  Slider,
  ToastGlobal,
  colors,
  spacing,
  radius,
  typography,
  shadow,
  fontFamilyForWeight,
} from '@atlas-ds/react-native';
import { RequiredField, RequiredLabel } from '../RequiredField';
import { dashboardImages } from '../../images';
import {
  VEHICLE_LOOKUP,
  validateRegistration,
  MODEL_OPTIONS,
  MAKE_OPTIONS,
  SUBTYPE_OPTIONS,
  YEAR_OPTIONS,
  LOCATION_OPTIONS,
} from './motorData';

type VehicleType = 'registered' | 'new' | null;

interface VehicleIdentificationStepProps {
  /** `identify` = step 1 (registration / manual entry); `ncb` = step 2 (found card + NCB). */
  mode: 'identify' | 'ncb';
  vehicleType: VehicleType;
  registrationNumber: string;
  setRegistrationNumber: (val: string) => void;
  vehicleModel: string;
  setVehicleModel: (val: string) => void;
  vehicleMake: string;
  setVehicleMake: (val: string) => void;
  vehicleSubType: string;
  setVehicleSubType: (val: string) => void;
  vehicleManufacturingYear: string;
  setVehicleManufacturingYear: (val: string) => void;
  registrationLocation: string;
  setRegistrationLocation: (val: string) => void;
  registrationDate: string;
  setRegistrationDate: (val: string) => void;
  currentPolicyNcb: string;
  setCurrentPolicyNcb: (val: string) => void;
  expiringPolicyNcb: string;
  setExpiringPolicyNcb: (val: string) => void;
}

const Detail: React.FC<{ label: string; value: string; big?: boolean; style?: object }> = ({ label, value, big, style }) => (
  <View style={[styles.detail, style]}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={big ? styles.detailValueBig : styles.detailValue}>{value}</Text>
  </View>
);

const NcbSlider: React.FC<{ label: string; value: string; onChange: (v: string) => void }> = ({ label, value, onChange }) => {
  const v = Number(value) || 0;
  return (
    <View style={styles.ncbBlock}>
      <View style={styles.ncbHeader}>
        <RequiredLabel text={label} />
        <Text style={styles.ncbValue}>{v}%</Text>
      </View>
      <Slider
        min={0}
        max={100}
        value={v}
        onChange={(x) => onChange(String(typeof x === 'number' ? x : x[0]))}
        showDataRange={false}
      />
      <View style={styles.ncbRange}>
        <Text style={styles.ncbRangeText}>0%</Text>
        <Text style={styles.ncbRangeText}>100%</Text>
      </View>
    </View>
  );
};

export const VehicleIdentificationStep: React.FC<VehicleIdentificationStepProps> = (props) => {
  const {
    mode,
    vehicleType,
    registrationNumber,
    setRegistrationNumber,
    vehicleModel,
    setVehicleModel,
    vehicleMake,
    setVehicleMake,
    vehicleSubType,
    setVehicleSubType,
    vehicleManufacturingYear,
    setVehicleManufacturingYear,
    registrationLocation,
    setRegistrationLocation,
    registrationDate,
    setRegistrationDate,
    currentPolicyNcb,
    setCurrentPolicyNcb,
    expiringPolicyNcb,
    setExpiringPolicyNcb,
  } = props;

  const [showToast, setShowToast] = useState(true);
  const [foundCardHeight, setFoundCardHeight] = useState(0);
  const vehicle = VEHICLE_LOOKUP[registrationNumber.toUpperCase()];

  // ---- Step 1: identify the vehicle ----
  if (mode === 'identify') {
    return (
      <View style={styles.card}>
        <Text style={styles.heading}>{vehicleType === 'new' ? 'Vehicle Details' : 'Vehicle Identification'}</Text>

        {vehicleType === 'registered' ? (
          <RequiredField label="Enter Registration Number">
            <Textfield
              value={registrationNumber}
              onChangeText={(t) => setRegistrationNumber(t.toUpperCase())}
              placeholder="Enter vehicle number"
            />
          </RequiredField>
        ) : (
          <View style={styles.form}>
            <RequiredField label="Model">
              <Dropdown placeholder="Select model" value={vehicleModel || null} options={MODEL_OPTIONS} onChange={setVehicleModel} />
            </RequiredField>
            <RequiredField label="Make">
              <Dropdown placeholder="Select make" value={vehicleMake || null} options={MAKE_OPTIONS} onChange={setVehicleMake} />
            </RequiredField>
            <RequiredField label="Sub type">
              <Dropdown placeholder="Select sub type" value={vehicleSubType || null} options={SUBTYPE_OPTIONS} onChange={setVehicleSubType} />
            </RequiredField>
            <RequiredField label="Year of manufacturing">
              <Dropdown placeholder="Select year" value={vehicleManufacturingYear || null} options={YEAR_OPTIONS} onChange={setVehicleManufacturingYear} />
            </RequiredField>
            <Textfield label="Enter Registration Number" value={registrationNumber} onChangeText={(t) => setRegistrationNumber(t.toUpperCase())} placeholder="Enter vehicle registration" />
            <Dropdown label="Registration Location" placeholder="Enter City" value={registrationLocation || null} options={LOCATION_OPTIONS} onChange={setRegistrationLocation} />
            <DatePicker
              label="Registration Date"
              placeholder="Select registration date"
              value={registrationDate ? new Date(registrationDate) : null}
              onChange={(date) => date && setRegistrationDate(date.toISOString())}
            />
          </View>
        )}
      </View>
    );
  }

  // ---- Step 2: identified-vehicle card + NCB ----
  return (
    <>
      {vehicleType === 'registered' && vehicle ? (
        <View style={styles.cardPlain}>
          {/* {showToast ? (
            <ToastGlobal
              variant="success"
              title="Vehicle Found!"
              message="We have fetched the details for you."
              onClose={() => setShowToast(false)}
            />
          ) : null} */}
          <LinearGradient
            colors={['#FFFFFF', '#FFF7ED']}
            style={styles.foundCard}
            onLayout={(e) => setFoundCardHeight(e.nativeEvent.layout.height)}
          >
            {foundCardHeight > 0 ? (
              <Image source={dashboardImages.vehicleBack} style={[styles.foundCardArt, { height: foundCardHeight }]} resizeMode="contain" />
            ) : null}

            {/* Car pinned top-right; the Model/Make block clears it. */}
            <Image source={vehicle.icon} style={styles.vehicleIcon} resizeMode="contain" />

            <View style={styles.topBlock}>
              <Detail label="Model:" value={vehicle.model} big />
              <Detail label="Make:" value={vehicle.make} />
            </View>

            <View style={styles.detailRow}>
              <Detail style={styles.col} label="Sub Type:" value={vehicle.subType} />
              <Detail style={styles.col} label="Year of Manufacturing:" value={vehicle.year} />
            </View>

            <View style={styles.detailRow}>
              <Detail style={styles.col} label="Registration Location:" value={vehicle.location} />
              <Detail style={styles.col} label="Registration Date:" value={vehicle.regDate} />
            </View>
          </LinearGradient>
        </View>
      ) : vehicleType === 'new' ? (
        <View style={styles.card}>
          <Text style={styles.heading}>Vehicle Details</Text>
          <View style={styles.topBlockPlain}>
            <Detail label="Model:" value={vehicleModel || '—'} big />
            <Detail label="Make:" value={vehicleMake || '—'} />
          </View>
          <View style={styles.detailRow}>
            <Detail style={styles.col} label="Sub Type:" value={vehicleSubType || '—'} />
            <Detail style={styles.col} label="Year of Manufacturing:" value={vehicleManufacturingYear || '—'} />
          </View>
          <View style={styles.detailRow}>
            <Detail style={styles.col} label="Registration Location:" value={registrationLocation || '—'} />
            <Detail style={styles.col} label="Registration Date:" value={registrationDate || '—'} />
          </View>
        </View>
      ) : null}

      <View style={styles.card}>
        <Text style={styles.heading}>Select NCB</Text>
        <NcbSlider label="Current Policy NCB" value={currentPolicyNcb} onChange={setCurrentPolicyNcb} />
        <NcbSlider label="Expiring Policy NCB" value={expiringPolicyNcb} onChange={setExpiringPolicyNcb} />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, gap: spacing.md, ...shadow.lg },
  // Same card chrome, but the found-card block manages its own inner spacing.
  cardPlain: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, gap: spacing.md, ...shadow.lg },
  heading: { fontFamily: fontFamilyForWeight('500'), fontSize: 20, fontWeight: '500', color: colors.textHeading },
  // Space-05 (16) padding all round, 16 between rows.
  foundCard: {
    position: 'relative',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.lg,
    overflow: 'hidden',
  },
  foundCardArt: { position: 'absolute', top: -68, right: -spacing.md, aspectRatio: 319 / 144 },
  // Model + Make stack on the left; paddingRight keeps them clear of the car.
  topBlock: { gap: spacing.lg, paddingRight: 130 },
  // Same stack without the car, for the manually-entered (new) vehicle.
  topBlockPlain: { gap: spacing.lg },
  detailRow: { flexDirection: 'row', gap: spacing.lg },
  col: { flex: 1 },
  detailGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg },
  detail: { gap: 2 },
  detailLabel: { fontFamily: typography.fontFamily, fontSize: 13, color: '#78716C' },
  detailValue: { fontFamily: fontFamilyForWeight('500'), fontSize: 16, fontWeight: '500', color: colors.textHeading },
  detailValueBig: { fontFamily: fontFamilyForWeight('500'), fontSize: 20, fontWeight: '500', color: colors.textHeading },
  vehicleIcon: { position: 'absolute', top: spacing.md, right: spacing.md, width: 131, height: 106 },
  form: { gap: spacing.md },
  ncbBlock: { gap: spacing.xs },
  ncbHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  ncbValue: { fontFamily: fontFamilyForWeight('500'), fontSize: 14, fontWeight: '500', color: colors.textHeading },
  ncbRange: { flexDirection: 'row', justifyContent: 'space-between' },
  ncbRangeText: { fontFamily: typography.fontFamily, fontSize: 12, color: colors.textMuted },
});
