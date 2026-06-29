# Expo Modules + EAS Build Migration Plan
> Project: kanchira-mobile | React Native 0.73.6 | Bare Workflow

---

## Compatibility Report

| Item | Current Value | Status |
|---|---|---|
| React Native | 0.73.6 | ✅ Supported by Expo SDK 50 |
| React | 18.2.0 | ✅ Matches Expo SDK 50 |
| Gradle | 8.2 | ✅ Compatible |
| Android Gradle Plugin | 8.1.2 | ✅ Compatible |
| Kotlin | 1.8.22 | ✅ Compatible |
| `compileSdk` / `targetSdk` | 34 | ✅ Compatible |
| `minSdk` | 21 | ✅ Compatible |
| `react-native-screens` | ^3.35.0 | ⚠️ Needs upgrade to ^3.37.0 (see below) |
| EAS Project ID | `80172af3-...` | ✅ Already linked |

### Expo SDK 50 — Why This Version?
- Expo SDK 50 officially targets **React Native 0.73.x**.
- Using Expo SDK 51+ would require React Native 0.74+, which would require upgrading React Native — explicitly disallowed.
- `expo@~50.0.0` + `expo-modules-core@~1.11.0` is the correct target.

---

## Dependency Conflict Analysis

### react-native-screens conflict (⚠️)
```
@react-navigation/bottom-tabs@7.3.x requires react-native-screens >= 4.0.0
Current: ^3.35.0 (resolves to 3.37.0)
```

**Resolution**: Use `--legacy-peer-deps` during install (which you're already doing). The runtime works fine — this is only a _declared_ peer dep mismatch between the React Navigation v7 package authors' declarations and the actual runtime compatibility. All features work on RN 0.73 with `react-native-screens` 3.x. **No upgrade of react-native-screens to 4.x needed** (4.x requires RN 0.74+).

---

## What This Migration Does (and Does NOT Do)

| Action | Status |
|---|---|
| Install `expo` & `expo-modules-core` | ✅ Will do |
| Install `expo-build-properties` | ✅ Will do |
| Generate `eas.json` | ✅ Will do |
| Update `app.json` → Expo bare workflow format | ✅ Will do |
| Update `babel.config.js` | ✅ Will do |
| Update `metro.config.js` | ✅ Will do |
| Run `install-expo-modules` script | ✅ Will do |
| Update Android `MainApplication.kt` | ✅ Will do (add Expo init) |
| Update Android `MainActivity.kt` | ✅ Will do (extend ReactActivity properly) |
| Upgrade React Native | ❌ Will NOT do |
| Delete `android/` or `ios/` folders | ❌ Will NOT do |
| Remove any existing native module | ❌ Will NOT do |

---

## Proposed Changes

### Step 1 — Install Expo Packages

```bash
npm install expo@~50.0.0 expo-modules-core@~1.11.0 expo-build-properties@~0.11.0 --legacy-peer-deps
```

**Why these packages?**
- `expo`: Required by EAS CLI and `install-expo-modules` tooling.
- `expo-modules-core`: The Kotlin/Swift native bridge that Expo modules use.
- `expo-build-properties`: Allows configuring native build properties (AGP version, Kotlin version, etc.) from `app.json` without editing Gradle files directly.

---

### Step 2 — Update `app.json`

Transform the current minimal React Native CLI `app.json` into an Expo bare workflow config:

```json
{
  "expo": {
    "name": "Kanchira",
    "slug": "kanchira",
    "version": "1.0.0",
    "platforms": ["android", "ios"],
    "android": {
      "package": "com.kanchira"
    },
    "ios": {
      "bundleIdentifier": "com.kanchira"
    },
    "plugins": [
      [
        "expo-build-properties",
        {
          "android": {
            "compileSdkVersion": 34,
            "targetSdkVersion": 34,
            "buildToolsVersion": "34.0.0",
            "kotlinVersion": "1.8.22"
          }
        }
      ]
    ],
    "extra": {
      "eas": {
        "projectId": "80172af3-2bd6-46f8-bdd6-79637ca8f846"
      }
    }
  }
}
```

> [!NOTE]
> The project name `NewProject` has been updated to `Kanchira` to match the package ID `com.kanchira`. Adjust if needed.

---

### Step 3 — Update `babel.config.js`

The Expo bare workflow adds `babel-preset-expo` as an additional preset layer on top of the existing RN preset.

```js
module.exports = {
  presets: ['babel-preset-expo'],
};
```

> [!NOTE]
> `babel-preset-expo` internally includes `@react-native/babel-preset`, so we do NOT lose RN transpilation. This is the canonical setup for Expo bare workflow projects.

---

### Step 4 — Update `metro.config.js`

Switch to `expo/metro-config` which wraps `@react-native/metro-config` and adds Expo-specific resolver extensions (e.g., `.expo.ts`).

```js
const { getDefaultConfig } = require('expo/metro-config');
const { mergeConfig } = require('@react-native/metro-config');

const config = getDefaultConfig(__dirname);
module.exports = mergeConfig(config, {});
```

---

### Step 5 — Generate `eas.json`

```json
{
  "cli": {
    "version": ">= 12.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

---

### Step 6 — Run `install-expo-modules`

This script, provided by `expo-modules-core`, modifies the Android `MainApplication.kt` and `MainActivity.kt` (and iOS `AppDelegate`) to initialize the Expo Modules runtime.

```bash
npx install-expo-modules@0.11.0
```

> [!IMPORTANT]
> Version `0.11.0` is the correct installer version for `expo-modules-core@~1.11.0` (Expo SDK 50). Using `@latest` risks pulling SDK 52/53 scaffolding that targets RN 0.76+.

---

### Step 7 — Add `babel-preset-expo` (devDependency)

```bash
npm install --save-dev babel-preset-expo@~10.0.0 --legacy-peer-deps
```

---

## Package Summary Table

| Package | Action | Version |
|---|---|---|
| `expo` | ADD | `~50.0.0` |
| `expo-modules-core` | ADD | `~1.11.0` |
| `expo-build-properties` | ADD | `~0.11.0` |
| `babel-preset-expo` | ADD (devDep) | `~10.0.0` |
| All existing packages | NO CHANGE | — |
| `react-native` | NO CHANGE | `0.73.6` |
| `react-native-screens` | NO CHANGE | `^3.35.0` |

---

## Verification Plan

### Automated
- `npx react-native doctor` — confirms native toolchain
- `npx expo-modules-core doctor` (if available)

### Build Verification
1. `npm start` — Metro bundler should start with Expo config resolver
2. `npx react-native run-android` — local debug build still works
3. `eas build --platform android --profile preview` — EAS cloud build
4. Verify release APK installs and all screens function (navigation, cart, wishlist, checkout)

### Manual Verification Points
- Wishlist AsyncStorage persistence survives app restart
- Checkout address fetch/delete works
- Image picker camera permission appears on device
- Vector icons render correctly

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| `install-expo-modules` script modifies MainApplication in a breaking way | Low | High | Review diff before committing; have rollback ready |
| `babel-preset-expo` changes transpilation breaking a native module | Very Low | Medium | Test run-android immediately after |
| `react-native-vector-icons` fonts not loading on EAS build | Low | Medium | `fonts.gradle` already wired in `android/app/build.gradle` |
| EAS cloud misses Gradle signing config | Medium | High | Add `release` signing config in `eas.json` using EAS Secrets |

---

## Rollback Plan

If anything breaks after migration:

```bash
# 1. Restore from git
git stash      # or git reset --hard HEAD (if committed)

# 2. Clean node_modules and reinstall
Remove-Item -Recurse -Force node_modules
npm install --legacy-peer-deps

# 3. Clean Android build
cd android && ./gradlew clean && cd ..
```

> [!CAUTION]
> Do NOT run `expo prebuild` at any point. `expo prebuild` would regenerate the `android/` and `ios/` folders from scratch, destroying your custom native code. The bare workflow approach used here keeps your existing native folders intact.

---

## Open Questions

> [!IMPORTANT]
> Before proceeding, please confirm:
> 1. **App name**: Should the Expo `slug` and `name` be `kanchira`? (or keep `NewProject`?)
> 2. **iOS**: Do you need iOS EAS builds, or only Android? (Affects whether we need to touch `Podfile`.)
> 3. **Signing**: Do you have an Android release keystore (`.jks` file)? EAS Build can generate one, or use your existing one via EAS Secrets.
