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
import { RequiredLabel } from '../RequiredField';
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

const Detail: React.FC<{ label: string; value: string; big?: boolean }> = ({ label, value, big }) => (
  <View style={styles.detail}>
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
          <Textfield
            label="Enter Registration Number *"
            value={registrationNumber}
            onChangeText={(t) => setRegistrationNumber(t.toUpperCase())}
            placeholder="Enter vehicle number"
          />
        ) : (
          <View style={styles.form}>
            <Dropdown label="Model *" placeholder="Select model" value={vehicleModel || null} options={MODEL_OPTIONS} onChange={setVehicleModel} />
            <Dropdown label="Make *" placeholder="Select make" value={vehicleMake || null} options={MAKE_OPTIONS} onChange={setVehicleMake} />
            <Dropdown label="Sub type *" placeholder="Select sub type" value={vehicleSubType || null} options={SUBTYPE_OPTIONS} onChange={setVehicleSubType} />
            <Dropdown label="Year of manufacturing *" placeholder="Select year" value={vehicleManufacturingYear || null} options={YEAR_OPTIONS} onChange={setVehicleManufacturingYear} />
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
          {showToast ? (
            <ToastGlobal
              variant="success"
              title="Vehicle Found!"
              message="We have fetched the details for you."
              onClose={() => setShowToast(false)}
            />
          ) : null}
          <LinearGradient
            colors={['#FFFFFF', '#FFF7ED']}
            style={styles.foundCard}
            onLayout={(e) => setFoundCardHeight(e.nativeEvent.layout.height)}
          >
            {foundCardHeight > 0 ? (
              <Image source={dashboardImages.vehicleBack} style={[styles.foundCardArt, { height: foundCardHeight }]} resizeMode="contain" />
            ) : null}
            <View style={styles.detailGrid}>
              <Detail label="Model" value={vehicle.model} big />
              <Detail label="Make" value={vehicle.make} />
              <Detail label="Sub Type" value={vehicle.subType} />
              <Detail label="Year of Manufacturing" value={vehicle.year} />
              <Detail label="Registration Location" value={vehicle.location} />
              <Detail label="Registration Date" value={vehicle.regDate} />
            </View>
            <Image source={vehicle.icon} style={styles.vehicleIcon} resizeMode="contain" />
          </LinearGradient>
        </View>
      ) : vehicleType === 'new' ? (
        <View style={styles.card}>
          <Text style={styles.heading}>Vehicle Details</Text>
          <View style={styles.detailGrid}>
            <Detail label="Model" value={vehicleModel || '—'} big />
            <Detail label="Make" value={vehicleMake || '—'} />
            <Detail label="Sub Type" value={vehicleSubType || '—'} />
            <Detail label="Year of Manufacturing" value={vehicleManufacturingYear || '—'} />
            <Detail label="Registration Location" value={registrationLocation || '—'} />
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
  foundCard: {
    position: 'relative',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: radius.xl,
    padding: spacing.md,
    gap: spacing.sm,
    overflow: 'hidden',
  },
  foundCardArt: { position: 'absolute', top: -48, right: -spacing.md, aspectRatio: 319 / 144 },
  detailGrid: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  detail: { width: '44%', gap: 2 },
  detailLabel: { fontFamily: typography.fontFamily, fontSize: 13, color: '#78716C' },
  detailValue: { fontFamily: fontFamilyForWeight('500'), fontSize: 14, fontWeight: '500', color: '#1C1917' },
  detailValueBig: { fontFamily: fontFamilyForWeight('500'), fontSize: 18, fontWeight: '500', color: '#1C1917' },
  vehicleIcon: { width: 90, height: 80, alignSelf: 'center' },
  form: { gap: spacing.md },
  ncbBlock: { gap: spacing.xs },
  ncbHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  ncbValue: { fontFamily: fontFamilyForWeight('500'), fontSize: 14, fontWeight: '500', color: colors.textHeading },
  ncbRange: { flexDirection: 'row', justifyContent: 'space-between' },
  ncbRangeText: { fontFamily: typography.fontFamily, fontSize: 12, color: colors.textMuted },
});
