# Atlas — Bajaj (BGIL) React Native App

A **pure React Native CLI** app (no Expo) — the BGIL insurance agent/RM/trainee
app, converted from the original React **web** app to true React Native, built on
the in-tree **Atlas Design System** (45 native components).

- React Native **0.81.5** · React **19.1.0** · TypeScript
- Bootstrapped with **`@react-native-community/cli`** — standard bare workflow,
  the `ios/` and `android/` projects are committed to this repo.
- **Zero Expo dependency.** Native modules are wired through React Native's
  community autolinking.

## What's inside

Clean-architecture layers ported from the web app:

- **`src/domain` / `src/application`** — entities, interfaces, auth use cases
  (framework-agnostic, ported verbatim).
- **`src/infrastructure`** — axios API client + auth repository. Web
  `import.meta.env` → `src/config/env.ts`; cookie/localStorage token store →
  in-memory cache backed by **AsyncStorage** (`src/utils/tokenStorage.ts`,
  hydrated at boot); Web Crypto (`crypto.subtle`/`randomUUID`/`btoa`) →
  **CryptoJS** (`src/utils/crypto.ts`).
- **`src/presentation`** — RN screens & sections:
  - **Auth flow** — DesignationSelect → Agent/RM login → OTP → forgot/reset →
    success (`@react-navigation/native-stack`, `react-hook-form` + `zod`).
  - **Agent dashboard** — Home (insights w/ `react-native-gifted-charts`, what's
    new, quick quotes, toolkit, MyAI assistant) + Business tab (insights, shared
    quotes/proposals/policies lists, drafts, quote/proposal wizards, policy detail).
  - **RM dashboard** and **Trainee dashboard** (reachable at `atlas://trainee`).

Routes are deep-linkable under the `atlas://` scheme (see `App.tsx`).

---

## Prerequisites

Set up your machine for React Native first (Node ≥ 20, Watchman, Xcode +
CocoaPods for iOS, Android Studio + JDK 17 for Android):

➡️ https://reactnative.dev/docs/set-up-your-environment (select **React Native CLI**)

## 1. Install JS dependencies

```sh
npm install
```

## 2. Link bundled fonts (first checkout only)

The brand font **Rubik** ships as native assets in `assets/fonts`. After a fresh
clone (or whenever fonts change) link them into the native projects:

```sh
npx react-native-asset
```

> This is already done in this repo, but re-run it if `assets/fonts` changes.

## 3. iOS — install CocoaPods

```sh
cd ios
bundle install        # once, installs CocoaPods itself
bundle exec pod install
cd ..
```

## 4. Run

```sh
npm start              # start the Metro bundler (keep it running)

npm run ios            # build + launch the iOS app (Simulator/device)
npm run android        # build + launch the Android app (emulator/device)
```

You can also open `ios/Atlas.xcworkspace` in Xcode or the `android/` folder in
Android Studio and run from there.

---

## Project structure

```
Atlas/
├── App.tsx                 App root — navigation + providers
├── index.js                AppRegistry entry (registers "Atlas")
├── app.json                App name
├── react-native.config.js  Native asset linking (fonts)
├── metro.config.js         Metro + "@atlas-ds/react-native" alias
├── babel.config.js         RN preset + reanimated/worklets plugin
├── assets/
│   └── fonts/              Rubik TTFs (Regular, Medium, Bold)
├── src/
│   ├── atlas-ds/          ⭐ The Atlas Design System library (45 components)
│   │   ├── components/
│   │   ├── theme.ts
│   │   ├── icons/
│   │   └── index.ts
│   ├── config/            App config (env constants — replaces import.meta.env)
│   ├── domain/            Entities, interfaces, validations (framework-agnostic)
│   ├── application/       Auth use cases
│   ├── infrastructure/    axios API client, auth repository, auth events
│   ├── utils/             crypto (CryptoJS), tokenStorage (AsyncStorage), storage
│   ├── presentation/
│   │   ├── pages/         Auth + dashboard screens
│   │   ├── components/    Auth + dashboard sections (business/, rm/, trainee/)
│   │   ├── hooks/         useAuthUseCases
│   │   └── context/       LoaderContext
│   ├── navigation.ts      Navigation param types
│   ├── fonts.ts           Native font hook (no-op — fonts are bundled)
│   └── fonts.web.ts        Web font hook (Google Fonts)
├── ios/                    Committed native iOS project (CocoaPods)
└── android/               Committed native Android project (Gradle)
```

### The design-system library

The component library lives **in-tree** at `src/atlas-ds` and is imported under
its package name `@atlas-ds/react-native` via a Metro alias (see
`metro.config.js`) + a TypeScript path (see `tsconfig.json`). No monorepo or
workspace tooling is required.

```ts
import { Button, Dropdown, Calendar, colors } from '@atlas-ds/react-native';
```

### Bundle identifier

iOS and Android both use **`com.bajaj.atlas`**.

---

## Key native dependencies

| Package | Purpose |
| --- | --- |
| `@react-navigation/native` + `native-stack` | Screen navigation |
| `react-native-screens`, `react-native-safe-area-context` | Navigation primitives |
| `react-native-gesture-handler` | Gestures (app root) |
| `react-native-reanimated` + `react-native-worklets` | BottomSheet animation |
| `react-native-svg` | Icon / shape rendering |
| `phosphor-react-native` | Icon set |
| `@react-native-documents/picker` | File picker (Upload demo) |

## Scripts

```sh
npm start          # Metro bundler
npm run ios        # build + run iOS
npm run android    # build + run Android
npm run lint       # ESLint
npm test           # Jest
npx tsc --noEmit   # TypeScript check
```
