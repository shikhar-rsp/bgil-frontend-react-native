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
  agent3: require('../../../../assets/images/agent3.png'),
  calendar: require('../../../../assets/images/calendar.png'),
  aiLogo: require('../../../../assets/images/ai-logo.png'),
  rmProfile: require('../../../../assets/images/rm-profile.png'),
  // Line-of-business icons
  health: require('../../../../assets/images/health-insurance.png'),
  fire: require('../../../../assets/images/fire-insurance.png'),
  motor: require('../../../../assets/images/motor-insurance.png'),
  property: require('../../../../assets/images/property.png'),
  vehicleBack: require('../../../../assets/images/vehcile-back.png'),
  // Toolkit icons
  brochures: require('../../../../assets/images/brochures.png'),
  calculator: require('../../../../assets/images/calculator.png'),
  learning: require('../../../../assets/images/learning.png'),
  campaigns: require('../../../../assets/images/campaigns.png'),
  queryTracker: require('../../../../assets/images/query-tracker.png'),
  payslip: require('../../../../assets/images/payslip.png'),
  renewalCalendar: require('../../../../assets/images/renewal-calendar.png'),
  // Trainee
  whatsapp: require('../../../../assets/images/whatsapp.png'),
  mail: require('../../../../assets/images/mail.png'),
  gold: require('../../../../assets/images/gold.png'),
  silver: require('../../../../assets/images/silver.png'),
  bronze: require('../../../../assets/images/bronze.png'),
  hat: require('../../../../assets/images/hat.png'),
  // Motor / vehicle lookup icons
  aiIcon2: require('../../../../assets/images/ai-icon-2.png'),
  carPng: require('../../../../assets/images/car_png.png'),
  cyclePng: require('../../../../assets/images/cycle_png.png'),
  commercialPng: require('../../../../assets/images/commercial_png.png'),
  schoolBus: require('../../../../assets/images/school_bus.png'),
  bulletPng: require('../../../../assets/images/bullet_png.png'),
};
