/// <reference lib="dom" />
/**
 * Web font loader. Injects the SAME Google Fonts "Rubik" stylesheet the docs
 * site uses (weights 400/500/700), so react-native-web text authored with
 * `fontFamily: 'Rubik'` + `fontWeight` renders pixel-identically to the docs
 * app — instead of falling back to the browser's serif default.
 *
 * Metro resolves this `.web.ts` on web; native uses `fonts.ts`.
 */
export function useAppFonts(): boolean {
  if (typeof document !== 'undefined' && !document.getElementById('atlas-rubik-font')) {
    const preconnect1 = document.createElement('link');
    preconnect1.rel = 'preconnect';
    preconnect1.href = 'https://fonts.googleapis.com';

    const preconnect2 = document.createElement('link');
    preconnect2.rel = 'preconnect';
    preconnect2.href = 'https://fonts.gstatic.com';
    preconnect2.crossOrigin = 'anonymous';

    const stylesheet = document.createElement('link');
    stylesheet.id = 'atlas-rubik-font';
    stylesheet.rel = 'stylesheet';
    stylesheet.href =
      'https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;700&display=swap';

    document.head.append(preconnect1, preconnect2, stylesheet);

    // Mirror the docs site: make Rubik the default for any text that doesn't
    // set its own family (RN-web inherits the body font). Components that
    // already specify `fontFamily: 'Rubik'` are unaffected.
    document.body.style.fontFamily = "'Rubik', sans-serif";
  }
  // Don't block first paint on the network font — `display=swap` handles the
  // brief fallback flash, matching the docs site's behaviour.
  return true;
}
