module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // zod v4 uses `export * as ns from` syntax which Metro's preset doesn't
    // transform out of the box.
    '@babel/plugin-transform-export-namespace-from',
    // Reanimated 4 ships its Babel transform via react-native-worklets (used by
    // the BottomSheet component). This plugin MUST be listed last.
    'react-native-worklets/plugin',
  ],
};
