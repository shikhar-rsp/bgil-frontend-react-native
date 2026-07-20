import type { ImageSourcePropType } from 'react-native';

/**
 * Static image registry for the dashboard. React Native's `require` needs a
 * literal path, so all dashboard images are registered here once and referenced
 * by key elsewhere.
 */
export const dashboardImages: Record<string, ImageSourcePropType> = {
  logo: require('../../../../assets/images/logo.png'),
  whatsNewBanner: require('../../../../assets/images/whats-new-carousal.png'),
  whatsNewIllustration: require('../../../../assets/images/whats-new-illustration.png'),
  whatsNewPromo: require('../../../../assets/images/Promo.png'),
  agent: require('../../../../assets/images/agent.png'),
  calendar: require('../../../../assets/images/calendar.png'),
  aiLogo: require('../../../../assets/images/ai-logo.png'),
  rmProfile: require('../../../../assets/images/rm-profile.png'),
  // Line-of-business icons
  health: require('../../../../assets/images/health-insurance.png'),
  fire: require('../../../../assets/images/fire-insurance.png'),
  motor: require('../../../../assets/images/motor-insurance.png'),
  // Toolkit icons
  brochures: require('../../../../assets/images/brochures.png'),
  calculator: require('../../../../assets/images/calculator.png'),
  learning: require('../../../../assets/images/learning.png'),
  campaigns: require('../../../../assets/images/campaigns.png'),
  queryTracker: require('../../../../assets/images/query-tracker.png'),
  payslip: require('../../../../assets/images/payslip.png'),
  renewalCalendar: require('../../../../assets/images/renewal-calendar.png'),
  // Trainee
  gold: require('../../../../assets/images/gold.png'),
  silver: require('../../../../assets/images/silver.png'),
  bronze: require('../../../../assets/images/bronze.png'),
  hat: require('../../../../assets/images/hat.png'),
};
