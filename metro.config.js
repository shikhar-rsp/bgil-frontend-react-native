const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    // The Atlas design-system library lives in-tree at src/atlas-ds and is
    // consumed under its package name so imports read like a published package.
    // (Plain Metro alias — no monorepo / workspace tooling required.)
    extraNodeModules: {
      '@atlas-ds/react-native': path.resolve(__dirname, 'src/atlas-ds'),
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
