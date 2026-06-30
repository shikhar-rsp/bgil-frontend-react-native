/**
 * Native (iOS/Android) font loader.
 *
 * Rubik is bundled as a native asset: the TTFs in `assets/fonts` are linked
 * into the app by `react-native.config.js` (run `npx react-native-asset` after
 * a clean checkout), so the OS registers the "Rubik" family at launch. There is
 * nothing to load at runtime — text renders in Rubik from the very first frame.
 *
 * The library renders every label with `fontFamily: 'Rubik'` (see the library's
 * theme.ts). The bundled Regular + Bold faces both carry the internal family
 * name "Rubik", so `fontWeight` selects the right face natively.
 *
 * Metro resolves this on native; web uses `fonts.web.ts`.
 */
export function useAppFonts(): boolean {
  return true;
}
