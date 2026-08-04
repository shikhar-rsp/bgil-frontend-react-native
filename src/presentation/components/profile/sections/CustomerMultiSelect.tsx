import React from 'react';
import { MultiSelectDropdown } from '@atlas-ds/react-native';
import type { Customer } from '../../../../domain/entities/profile_entities';

interface CustomerMultiSelectProps {
  customers: Customer[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

/**
 * Recipient picker. The web uses the Atlas multi-select trigger with a chip
 * summary; on mobile the sheet already IS the surface, so the list is rendered
 * inline via `MultiSelectDropdown` instead of opening a second overlay.
 */
export const CustomerMultiSelect: React.FC<CustomerMultiSelectProps> = ({
  customers,
  selectedIds,
  onChange,
}) => (
  <MultiSelectDropdown
    options={customers.map((customer) => ({ label: customer.name, value: customer.id }))}
    values={selectedIds}
    onChange={onChange}
    maxHeight={220}
  />
);
