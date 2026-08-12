import React, { useMemo, useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { XCircle } from 'phosphor-react-native';
import {
  Dropdown,
  Textfield,
  DatePicker,
  Toast,
  colors,
  spacing,
  radius,
  typography,
  shadow,
  fontFamilyForWeight,
} from '@atlas-ds/react-native';
import { RequiredField } from '../RequiredField';
import { dashboardImages } from '../../images';
import { MotorCard, motorColors } from './motorUi';
import {
  VEHICLE_TYPE_IMAGES,
  findVehicle,
  formatShortDate,
  getDaysExpired,
  getNcbSlab,
  getVehicleAgeBucket,
  MODEL_OPTIONS,
  MAKE_OPTIONS,
  SUBTYPE_OPTIONS,
  YEAR_OPTIONS,
  LOCATION_OPTIONS,
  NCB_GRACE_DAYS,
  type VehicleRecord,
} from './motorQuoteData';

interface VehicleIdentificationStepProps {
  vehicleType: 'registered' | 'new' | null;

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

  policyStartDate: Date | null;
  setPolicyStartDate: (date: Date | null) => void;

  policyEndDate: Date | null;
  setPolicyEndDate: (date: Date | null) => void;
}

const Detail: React.FC<{ label: string; value: string; big?: boolean; style?: object }> = ({
  label,
  value,
  big,
  style,
}) => (
  <View style={[styles.detail, style]}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={big ? styles.detailValueBig : styles.detailValue}>{value}</Text>
  </View>
);

/**
 * Once a policy lapses, cover cannot simply backdate to the expiry — the
 * vehicle has to pass a self-inspection first, and the agent needs to be able
 * to tell the customer when cover will actually begin.
 */
const BreakInNotice: React.FC<{
  daysExpired: number;
  ncbPercent: number;
  daysOfNcbGraceLeft: number;
  inspectionApprovalDate: Date;
  today: Date;
}> = ({ daysExpired, ncbPercent, daysOfNcbGraceLeft, inspectionApprovalDate, today }) => (
  <View style={styles.breakIn}>
    <XCircle size={20} weight="fill" color={motorColors.alert} />

    <View style={styles.breakInBody}>
      <Text style={styles.breakInTitle}>
        Previous policy expired {daysExpired} days ago
      </Text>

      <Text style={styles.breakInText}>
        Cover cannot begin on {formatShortDate(today)}. The vehicle must pass a
        self-inspection first, and the policy will start from the date inspection is
        approved — usually within 24 hours, expected{' '}
        {formatShortDate(inspectionApprovalDate)}.
      </Text>

      {daysOfNcbGraceLeft > 0 ? (
        <Text style={styles.breakInText}>
          The {ncbPercent}% No Claim Bonus is safe: you're renewing within{' '}
          {NCB_GRACE_DAYS} days of expiry. You have {daysOfNcbGraceLeft} days left
          before it lapses.
        </Text>
      ) : (
        <Text style={styles.breakInText}>
          The No Claim Bonus has lapsed — it is over {NCB_GRACE_DAYS} days since
          expiry, so this renewal starts back at 0%.
        </Text>
      )}
    </View>
  </View>
);

/** The orange-tinted card the lookup fills in. Reused by the preview. */
export const VehicleDetailCard: React.FC<{ vehicle: VehicleRecord }> = ({ vehicle }) => {
  const [height, setHeight] = useState(0);

  return (
    // Shadow only — it can't live on the gradient card itself, since
    // `overflow: hidden` there would clip it away on iOS.
    <View style={styles.foundCardShadow}>
      {/* A plain View owns the border, radius and `overflow: hidden`: on iOS the
          native gradient view drops the clip and paints over its own children,
          so the oversized background art escapes the card. */}
      <View
        style={styles.foundCard}
        onLayout={(e) => setHeight(e.nativeEvent.layout.height)}
      >
        <LinearGradient
          colors={['#FFFFFF', motorColors.gradientOrange]}
          style={StyleSheet.absoluteFill}
        />

        {height > 0 ? (
          <Image
            source={dashboardImages.vehicleBack}
            style={[styles.foundCardArt, { height }]}
            resizeMode="contain"
          />
        ) : null}

        {/* Artwork pinned top-right; the Model/Make block clears it. */}
        <Image
          source={VEHICLE_TYPE_IMAGES[vehicle.type]}
          style={styles.vehicleIcon}
          resizeMode="contain"
        />

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
      </View>
    </View>
  );
};

export const VehicleIdentificationStep: React.FC<VehicleIdentificationStepProps> = ({
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
  policyStartDate,
  setPolicyStartDate,
  policyEndDate,
  setPolicyEndDate,
}) => {
  const [showToast, setShowToast] = useState(true);

  const isNew = vehicleType === 'new';
  const vehicle = findVehicle(registrationNumber);

  const today = useMemo(() => new Date(), []);

  const isExpired = vehicle ? getVehicleAgeBucket(vehicle, today) === 'expired' : false;
  const daysExpired = vehicle ? getDaysExpired(vehicle) : 0;

  const inspectionApprovalDate = useMemo(() => {
    const next = new Date(today);
    next.setDate(next.getDate() + 1);
    return next;
  }, [today]);

  return (
    <MotorCard title={isNew ? 'Vehicle Details' : 'Vehicle Identification'}>
      {vehicleType === 'registered' ? (
        <RequiredField label="Enter Registration Number">
          <Textfield
            value={registrationNumber}
            onChangeText={(t) => setRegistrationNumber(t.toUpperCase())}
            placeholder="Enter vehicle number"
          />
        </RequiredField>
      ) : null}

      {isNew || vehicle ? (
        <View style={styles.revealed}>
          {/* A lapsed policy is the headline on this card, so the "we found it"
              note would only be noise. */}
          {vehicleType === 'registered' && showToast && !isExpired ? (
            <Toast
              variant="success"
              title="Vehicle found!"
              message="We have fetched the details for you."
              onClose={() => setShowToast(false)}
            />
          ) : null}

          {vehicleType === 'registered' && vehicle ? (
            <VehicleDetailCard vehicle={vehicle} />
          ) : null}

          {isNew ? (
            <View style={styles.form}>
              <RequiredField label="Model">
                <Dropdown
                  placeholder="Select model"
                  value={vehicleModel || null}
                  options={MODEL_OPTIONS}
                  onChange={setVehicleModel}
                />
              </RequiredField>

              <RequiredField label="Make">
                <Dropdown
                  placeholder="Select make"
                  value={vehicleMake || null}
                  options={MAKE_OPTIONS}
                  onChange={setVehicleMake}
                />
              </RequiredField>

              <RequiredField label="Sub type">
                <Dropdown
                  placeholder="Select sub type"
                  value={vehicleSubType || null}
                  options={SUBTYPE_OPTIONS}
                  onChange={setVehicleSubType}
                />
              </RequiredField>

              <RequiredField label="Year of manufacturing">
                {/* 20-odd years back to 2005 — a 3-up grid plus search beats
                    scrolling one row at a time. */}
                <Dropdown
                  placeholder="Select year"
                  value={vehicleManufacturingYear || null}
                  options={YEAR_OPTIONS}
                  onChange={setVehicleManufacturingYear}
                  searchable
                  columns={3}
                />
              </RequiredField>

              {/* Optional for an unregistered vehicle — it may not have a plate
                  yet. Only the registered flow validates the format. */}
              <Textfield
                label="Enter Registration Number"
                value={registrationNumber}
                onChangeText={(t) => setRegistrationNumber(t.toUpperCase())}
                placeholder="Enter vehicle registration"
              />

              <Dropdown
                label="Registration Location"
                placeholder="Enter City"
                value={registrationLocation || null}
                options={LOCATION_OPTIONS}
                onChange={setRegistrationLocation}
              />

              <DatePicker
                label="Registration Date"
                placeholder="Select registration date"
                value={registrationDate ? new Date(registrationDate) : null}
                onChange={(date) => date && setRegistrationDate(date.toISOString())}
              />
            </View>
          ) : null}

          {/* Policy period — sits with the vehicle it applies to, and arrives
              prefetched from the lookup rather than waiting to be retyped. */}
          <View style={styles.form}>
            <RequiredField label="Policy start date">
              <DatePicker
                placeholder="Select start date"
                value={policyStartDate}
                onChange={setPolicyStartDate}
              />
            </RequiredField>

            <RequiredField label="Policy end date">
              <DatePicker
                placeholder="Select end date"
                value={policyEndDate}
                onChange={setPolicyEndDate}
              />
            </RequiredField>
          </View>

          {vehicleType === 'registered' && vehicle && isExpired ? (
            <BreakInNotice
              daysExpired={daysExpired}
              ncbPercent={getNcbSlab('expired', false).percent}
              daysOfNcbGraceLeft={Math.max(0, NCB_GRACE_DAYS - daysExpired)}
              inspectionApprovalDate={inspectionApprovalDate}
              today={today}
            />
          ) : null}
        </View>
      ) : null}
    </MotorCard>
  );
};

const styles = StyleSheet.create({
  revealed: { gap: spacing.lg },
  form: { gap: spacing.md },

  // Carries the card shadow for the found-vehicle block, which manages its own
  // inner spacing — so this adds radius and elevation but no padding.
  foundCardShadow: { backgroundColor: colors.surface, borderRadius: radius.xl, ...shadow.lg },
  foundCard: {
    position: 'relative',
    borderWidth: 1,
    borderColor: motorColors.orangeBorder,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.lg,
    overflow: 'hidden',
  },
  foundCardArt: { position: 'absolute', top: -68, right: -spacing.md, aspectRatio: 319 / 144 },
  // Model + Make stack on the left; paddingRight keeps them clear of the artwork.
  topBlock: { gap: spacing.lg, paddingRight: 130 },
  detailRow: { flexDirection: 'row', gap: spacing.lg },
  col: { flex: 1 },
  detail: { gap: 2 },
  detailLabel: { fontFamily: typography.fontFamily, fontSize: 13, color: '#78716C' },
  detailValue: { fontFamily: fontFamilyForWeight('500'), fontSize: 16, fontWeight: '500', color: colors.textHeading },
  detailValueBig: { fontFamily: fontFamilyForWeight('500'), fontSize: 20, fontWeight: '500', color: colors.textHeading },
  vehicleIcon: { position: 'absolute', top: spacing.md, right: spacing.md, width: 131, height: 106 },

  breakIn: {
    flexDirection: 'row',
    gap: spacing.md,
    borderRadius: radius.lg,
    borderLeftWidth: 3,
    borderLeftColor: motorColors.alert,
    backgroundColor: motorColors.alertFill,
    padding: spacing.lg,
  },
  breakInBody: { flex: 1, gap: spacing.md },
  breakInTitle: {
    fontFamily: fontFamilyForWeight('500'),
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    color: colors.textHeading,
  },
  breakInText: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textBody,
  },
});
