import React, { useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { CheckCircle, X } from 'phosphor-react-native';
import { Dropdown, Textfield, DatePicker, colors, spacing, radius, typography, shadow } from '@atlas-ds/react-native';
import {
  VEHICLE_LOOKUP,
  validateRegistration,
  MODEL_OPTIONS,
  MAKE_OPTIONS,
  SUBTYPE_OPTIONS,
  YEAR_OPTIONS,
  LOCATION_OPTIONS,
  NCB_OPTIONS,
} from './motorData';

type VehicleType = 'registered' | 'new' | null;

interface VehicleIdentificationStepProps {
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

export const VehicleIdentificationStep: React.FC<VehicleIdentificationStepProps> = (props) => {
  const {
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
  const isFilled = validateRegistration(registrationNumber);
  const vehicle = VEHICLE_LOOKUP[registrationNumber.toUpperCase()];

  return (
    <View style={styles.card}>
      <Text style={styles.heading}>
        {vehicleType === 'new' ? 'Vehicle Details' : 'Vehicle Identification'}
      </Text>

      {vehicleType === 'registered' ? (
        <Textfield
          label="Enter Registration Number *"
          value={registrationNumber}
          onChangeText={(t) => setRegistrationNumber(t.toUpperCase())}
          placeholder="Enter vehicle registration number"
        />
      ) : null}

      {vehicleType === 'new' || isFilled ? (
        <View style={styles.body}>
          {vehicleType === 'registered' && showToast ? (
            <View style={styles.foundToast}>
              <CheckCircle size={22} color="#65A30D" />
              <View style={styles.foundTextWrap}>
                <Text style={styles.foundTitle}>Vehicle found!</Text>
                <Text style={styles.foundSub}>We have fetched the details for you.</Text>
              </View>
              <Pressable onPress={() => setShowToast(false)} hitSlop={8}>
                <X size={16} color={colors.textBody} />
              </Pressable>
            </View>
          ) : null}

          {vehicleType === 'registered' && vehicle ? (
            <View style={styles.foundCard}>
              <View style={styles.detailGrid}>
                <Detail label="Model" value={vehicle.model} big />
                <Detail label="Make" value={vehicle.make} />
                <Detail label="Sub Type" value={vehicle.subType} />
                <Detail label="Year of Manufacturing" value={vehicle.year} />
                <Detail label="Registration Location" value={vehicle.location} />
                <Detail label="Registration Date" value={vehicle.regDate} />
              </View>
              <Image source={vehicle.icon} style={styles.vehicleIcon} resizeMode="contain" />
            </View>
          ) : null}

          {vehicleType === 'new' ? (
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
          ) : null}

          {vehicleType === 'registered' ? (
            <View style={styles.form}>
              <Dropdown label="Current Policy NCB" placeholder="Select NCB" value={currentPolicyNcb || null} options={NCB_OPTIONS} onChange={setCurrentPolicyNcb} />
              <Dropdown label="Expiring Policy NCB" placeholder="Select NCB" value={expiringPolicyNcb || null} options={NCB_OPTIONS} onChange={setExpiringPolicyNcb} />
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, gap: spacing.md, ...shadow.lg },
  heading: { fontFamily: typography.fontFamily, fontSize: 20, fontWeight: '500', color: colors.textHeading },
  body: { gap: spacing.md },
  foundToast: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderLeftWidth: 3, borderColor: '#65A30D', backgroundColor: '#F7FEE7', borderRadius: radius.lg, padding: spacing.md },
  foundTextWrap: { flex: 1 },
  foundTitle: { fontFamily: typography.fontFamily, fontSize: 14, fontWeight: '500', color: colors.textHeading },
  foundSub: { fontFamily: typography.fontFamily, fontSize: 13, color: colors.textBody },
  foundCard: { flexDirection: 'row', borderWidth: 1, borderColor: '#FED7AA', borderRadius: radius.xl, backgroundColor: '#FFF7ED', padding: spacing.md, gap: spacing.sm, overflow: 'hidden' },
  detailGrid: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  detail: { width: '44%', gap: 2 },
  detailLabel: { fontFamily: typography.fontFamily, fontSize: 13, color: '#78716C' },
  detailValue: { fontFamily: typography.fontFamily, fontSize: 14, fontWeight: '500', color: '#1C1917' },
  detailValueBig: { fontFamily: typography.fontFamily, fontSize: 18, fontWeight: '500', color: '#1C1917' },
  vehicleIcon: { width: 90, height: 80, alignSelf: 'center' },
  form: { gap: spacing.md },
});
