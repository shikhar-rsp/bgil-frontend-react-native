/**
 * App configuration (React Native).
 *
 * The web app read these from Vite's `import.meta.env` (the `.env*` files).
 * React Native has no `import.meta.env`, so the values are mirrored here as
 * plain constants. To switch environments, change the values below (or wire a
 * native config library such as `react-native-config` and read from it here —
 * this module stays the single source of truth for the rest of the app).
 *
 * Current values mirror `.env` (UAT).
 */
export const ENV = {
  API_BASE_URL: 'https://api.uat.bajajgeneral.com',
  ENCRYPTION_KEY: 'imitra@rv#mp2026',
  ENCRYPTION_IV: 'imitra@rv#mp2026',
  USERDETAILS_HMAC_KEY: 'n&i(Ms*#G(P*as!4@3',
  LOGIN_HMAC_KEY: 'h@i%KA@LG$L&18#%$)',
  APP_ENV: 'LIVE',
} as const;
