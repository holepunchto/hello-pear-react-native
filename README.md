# hello-pear-react-native

> Hello World for Pear in React Native (mobile)

Using [Expo v54](https://docs.expo.dev/versions/latest)

## Requirements

- `npm`
- `node --version` >= 20.19.x

[more info](https://docs.expo.dev/versions/latest/#each-expo-sdk-version-depends-on-a-react-native-version)

### For iOS Simulator

- `xcodebuild --version` >= 16.1
- iOS version >= 15.1

[more info](https://docs.expo.dev/versions/latest/#support-for-android-and-ios-versions)

### For Android Simulator

- Android version >= 7

[more info](https://docs.expo.dev/versions/latest/#support-for-android-and-ios-versions)

## Install

```sh
npm install
```

## Scripts

### `npm run build`

Create the pear end bundle used to start the BareKit Worklet

> [!CAUTION]  
> Required prebuild step.

```sh
npm run build
```

Uses: `npx bare-pack --host ios --host android --linked --out ./src/worker.bundle.js ./pearend/worker.js`

---

### `npm run ios`

Runs the app in an iOS Simulator.

```sh
npm run ios
```

Uses: `npx expo run:ios`

---

### `npm run android`

Connects to SKD and runs the app in an Android Simulator.

```sh
npm run android
```

Uses: `npx expo run:android`

---

### `npm run lint`

Check formatting and linting.

```sh
npm run lint
```

Runs:

- `prettier --check`
- `lunte`

---

### `npm run format`

Auto-format and fix lint issues.

```sh
npm run format
```

Runs:

- `prettier --write .`
- `lunte --fix`

## LICENSE

Apache-2.0
