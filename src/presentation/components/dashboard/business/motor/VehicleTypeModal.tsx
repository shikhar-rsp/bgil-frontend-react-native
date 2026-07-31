import React from 'react';
import { BottomSheet } from '@atlas-ds/react-native';
import {
  VehicleTypeOptions,
  VEHICLE_TYPE_TITLE,
  VEHICLE_TYPE_SUBTITLE,
  type VehicleType,
} from './VehicleTypeOptions';

interface VehicleTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed: (type: VehicleType) => void;
}

/**
 * "Select Vehicle Type" as a sheet of its own — used where it is the first
 * thing the agent sees (Browse Categories, or changing type mid-flow).
 *
 * Reached from Quick Quotes it is instead a second step of that sheet, so the
 * two don't cut between each other. See `QuickQuotes`.
 */
export const VehicleTypeModal: React.FC<VehicleTypeModalProps> = ({ isOpen, onClose, onProceed }) => (
  <BottomSheet
    visible={isOpen}
    onClose={onClose}
    onBack={onClose}
    backAccessibilityLabel="Back to products"
    title={VEHICLE_TYPE_TITLE}
    subtitle={VEHICLE_TYPE_SUBTITLE}
    contentMinHeight={0}
  >
    <VehicleTypeOptions onSelect={onProceed} />
  </BottomSheet>
);
