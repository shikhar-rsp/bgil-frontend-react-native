# Atlas — notes for contributors / agents

Pure **React Native CLI** app (no Expo). React Native **0.85.3** · React **19.2.3**.

See **README.md** for setup and run instructions.

## Ground rules

- **No Expo.** Do not add `expo`, `expo-*`, `@expo/*`, `babel-preset-expo`, or
  `expo/metro-config`. Native modules are wired via React Native community
  autolinking. The `ios/` and `android/` projects are committed — edit them
  directly (there is no `prebuild` step).
- The design-system library lives in-tree at **`src/atlas-ds`** and is consumed
  as `@atlas-ds/react-native` via:
  - Metro alias — `metro.config.js` → `resolver.extraNodeModules`
  - TypeScript path — `tsconfig.json` → `compilerOptions.paths`
  Keep both in sync if the folder moves.
- **Fonts** (Rubik) are bundled native assets in `assets/fonts`, linked by
  `react-native.config.js`. After changing fonts run `npx react-native-asset`.
  `src/fonts.ts` is intentionally a no-op on native; `src/fonts.web.ts` injects
  the Google Fonts stylesheet on web.
- **Reanimated 4** needs the `react-native-worklets/plugin` Babel plugin listed
  **last** (already in `babel.config.js`). Only the BottomSheet uses it.
- Bundle id is **`com.bajaj.atlas`** (iOS pbxproj + Android `applicationId`/
  `namespace` + the `com/bajaj/atlas` Kotlin package).

## Web → React Native conversion rules

This app was ported from a React **web** app. When porting more screens, keep
these substitutions consistent:

- **Config:** there is no `import.meta.env`. App config lives in
  `src/config/env.ts` (plain constants). Never reintroduce Vite env access.
- **Tokens:** `getTokenValue` is **synchronous** (used in the axios request
  interceptor) — it reads an in-memory cache backed by AsyncStorage. Writes go
  to both. Call `hydrateTokens()` once at boot (done in `App.tsx`). Don't make
  token reads async.
- **Forced logout:** the API layer calls `emitUnauthorized()`
  (`src/infrastructure/authEvents.ts`); `App.tsx` resets the stack to login.
  Never use `window.location`.
- **Crypto:** use **CryptoJS** only (`src/utils/crypto.ts`). No `crypto.subtle`,
  `crypto.randomUUID`, `TextEncoder`, or `btoa` — they don't exist on native.
- **zod** v4 requires `@babel/plugin-transform-export-namespace-from` in
  `babel.config.js` (before the worklets plugin, which stays last).
- **Charts:** use **`react-native-gifted-charts`** (recharts is web-only).
- **Lists/tables:** the Business record lists use the library **`Table`**, which
  scrolls horizontally — the design keeps real columns rather than collapsing
  them onto the phone width, so a growing table scrolls instead of shrinking.
  Wrap them in `business/lists/RecordTable`, which adds the empty state and the
  card-edge bleed. Row action menus use the local `common/ActionMenu` (⋮).
- **Images:** registered statically in
  `src/presentation/components/dashboard/images.ts` (RN `require` needs literals).
- Watch the **bare-string-in-`<View>`** trap (§ native crash): guard every `&&`
  that could yield a string; wrap all text in `<Text>`.

## Verify before pushing

```sh
npx tsc --noEmit                                  # types
npx react-native bundle --platform android \
  --dev false --entry-file index.js \
  --bundle-output /tmp/atlas.bundle               # JS graph resolves
npm test                                          # jest
```
