# Testing & QC Guide

This app is a **bare React Native CLI** app (no Expo), so there is no Expo-Go QR
sandbox. QC installs a **real built app** on their device. This guide covers the
mock login credentials, how to run on a simulator, and how to distribute a build
to QC testers.

---

## Mock login (QC / demo mode)

When `MOCK_AUTH` is **on**, login is resolved locally (no backend needed) and
each credential routes to that role's dashboard. The flag lives in
[`src/config/env.ts`](src/config/env.ts):

```ts
export const ENV = { /* ... */ MOCK_AUTH: true };
```

> Set `MOCK_AUTH: false` for a production build that must use the real UAT
> backend. Credentials are defined in
> [`src/infrastructure/mockAuth.ts`](src/infrastructure/mockAuth.ts).

### Credentials

| Role | Where to enter | Login ID | Password |
| --- | --- | --- | --- |
| **Insurance Agent** | Insurance Agent → **IMD Code** tab | `agent@bajaj.com` | `Agent@123` |
| **Trainee** | Insurance Agent → **IMD Code** tab | `trainee@bajaj.com` | `Trainee@123` |
| **Relationship Manager** | **Relationship Manager** | `RM001` | `Rm@12345` |
| Agent (mobile login) | Insurance Agent → **Mobile Number** tab | `9876543210` | _(none)_ |
| Trainee (mobile login) | Insurance Agent → **Mobile Number** tab | `9000000001` | _(none)_ |

**OTP for every login:** `123456`

### Flow
1. On the **Log in** screen pick **Relationship Manager** or **Insurance Agent**.
2. Enter the matching credentials above → **Proceed**.
3. On **Verify OTP** enter **`123456`** → **Submit**.
4. You land on the role's dashboard (Agent / RM / Trainee).
5. Log out from the **avatar menu** (top-right of the header) → **Log Out**.

Wrong credentials or OTP show an inline error (nothing is sent to a backend).

---

## Run on a Simulator / Emulator (developer machine)

Requires the full dev toolchain (repo + Node + Xcode / Android Studio).

```sh
export PATH="/opt/homebrew/bin:$PATH"; export LANG=en_US.UTF-8
cd Atlas
npm install                                  # first time
npx react-native-asset                       # first time (links Rubik fonts)
cd ios && bundle exec pod install && cd ..   # first time (iOS)

npm start                                    # terminal 1 — Metro
npm run ios -- --simulator "iPhone 17"       # terminal 2 — iOS
# npm run android                            # Android (needs JDK 17 + SDK)
```

> **Toolchain note (Xcode 26 / Ruby 4):** CocoaPods must be ≥ 1.16, the `Gemfile`
> adds the `nkf`/`tsort` gems, and the `Podfile` patches `fmt/base.h`
> (`FMT_USE_CONSTEVAL 0`). These are already committed.

---

## Distribute a build to QC testers (their own phones)

QC testers need **only their phone** — not the repo or any toolchain. One person
builds the app and shares a link/QR; testers install it.

### Android (self-serve, ends in a QR) — recommended
Build machine needs JDK 17 + Android SDK.
1. Build a standalone APK (JS bundled in):
   ```sh
   cd Atlas/android && ./gradlew assembleRelease
   # → android/app/build/outputs/apk/release/app-release.apk
   ```
2. Upload the APK to **[diawi.com](https://diawi.com)** (or **Firebase App
   Distribution**) → get a **QR code + link**.
3. Tester scans the QR on their Android phone → downloads → allows "install from
   unknown sources" → installs → opens **Atlas**.

### iOS (TestFlight)
Requires a paid Apple Developer account.
1. Xcode → open `ios/Atlas.xcworkspace`, set a signing Team.
2. Target **Any iOS Device** → *Product → Archive* → *Distribute → App Store
   Connect → Upload*.
3. In **App Store Connect → TestFlight**, add the build and invite testers.
4. Tester installs the **TestFlight** app → opens the invite/link → installs.

> **Firebase App Distribution** works for both platforms from one dashboard and
> is the closest single-tool replacement for the Expo QR workflow.

Because `MOCK_AUTH` is on, QC testers use the mock credentials above — no backend
or real accounts required.
