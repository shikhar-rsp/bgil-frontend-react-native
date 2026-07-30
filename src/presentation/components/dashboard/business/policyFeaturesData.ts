/**
 * Copy for the "View features" sheet — the key features and coverage highlights
 * of a policy, ported from the web `quotes/FeaturesModal`.
 */

export type PolicyFeatures = {
  /** Sheet heading, e.g. "Health Guard Policy". */
  title: string;
  keyFeatures: string[];
  coverageHighlights: string[];
};

export const HEALTH_POLICY_FEATURES: PolicyFeatures = {
  title: 'Health Guard Policy',
  keyFeatures: [
    'Choose a sum insured that fits your budget',
    'Quick Claim Settlement',
    'Lifetime Renewal',
    'No medical tests required for individuals up to 45 years of age.',
    'Avail free preventive health check-ups.',
    'Get your sum insured reinstated after exhaustion due to a claim.',
  ],
  coverageHighlights: [
    'Covers hospitalisation costs- room types, daycare procedures and surgeries.',
    'Customizable 60 day Pre and 90 day Post-Hospitalisation Expenses.',
    'Covers medical expenses for alternative treatments such as Ayurveda, Yoga, Homeopathy, etc.',
    'In-patient Hospitalisation Expenses - room and boarding, ICU, nursing care, surgeon fees, anaesthesia, etc',
    'Reimburses reasonable ambulance expenses per valid hospitalisation claim.',
    // Web's array listed "Organ Donor Expense" twice; the duplicate is dropped here.
    'Organ Donor Expense',
    'Daily Cash Allowance',
    'Modern technologies and advanced procedures expenses covered.',
  ],
};

/**
 * Motor placeholder — the copy below is the health policy's, because neither the
 * web app nor the design has motor feature copy yet (web renders its motor
 * header with no `onViewFeatures` at all, so the button does nothing there).
 * Replace `keyFeatures` / `coverageHighlights` once the motor wording lands;
 * nothing else needs to change.
 */
export const MOTOR_POLICY_FEATURES: PolicyFeatures = {
  title: 'Motor Policy',
  keyFeatures: HEALTH_POLICY_FEATURES.keyFeatures,
  coverageHighlights: HEALTH_POLICY_FEATURES.coverageHighlights,
};
