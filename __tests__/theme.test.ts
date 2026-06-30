/**
 * @format
 *
 * Smoke test for the vendored Atlas design-system theme. Importing the theme is
 * pure JS (no native modules), so this runs without reanimated/gesture-handler
 * mocks and gives `npm test` a fast, meaningful green check.
 */
import { theme, colors, typography } from '../src/atlas-ds/theme';

test('theme exposes core tokens', () => {
  expect(theme).toBeDefined();
  expect(typeof colors.brand).toBe('string');
});

test('brand font family is Rubik', () => {
  // The bundled native fonts + web stylesheet both register the "Rubik" family;
  // the theme must reference it so every label renders in brand type.
  expect(typography.fontFamily).toBe('Rubik');
});
