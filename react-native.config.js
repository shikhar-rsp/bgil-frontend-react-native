/**
 * React Native CLI config.
 *
 * `assets` lists folders whose files are copied into the native app bundle and
 * registered with the OS. The Rubik TTFs in assets/fonts are linked here so the
 * "Rubik" font family is available natively (no JS font-loading at runtime).
 *
 * After a fresh checkout (or when fonts change) run:  npx react-native-asset
 */
module.exports = {
  project: {
    ios: {},
    android: {},
  },
  assets: ['./assets/fonts'],
};
