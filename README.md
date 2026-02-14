# hello-pear-react-native

> Hello World for Pear in React Native (mobile)

Using [Expo v54](https://docs.expo.dev/versions/latest)

## Requirements

- `npm`
- `node --version` >= 20.19.x

[more info](https://docs.expo.dev/versions/latest/#each-expo-sdk-version-depends-on-a-react-native-version)

#### For iOS Simulator

- `xcodebuild --version` >= 16.1
- iOS version >= 15.1

[more info](https://docs.expo.dev/versions/latest/#support-for-android-and-ios-versions)

#### For Android Simulator

- Android version >= 7

[more info](https://docs.expo.dev/versions/latest/#support-for-android-and-ios-versions)

## Install

```sh
npm install
```

## Scripts

#### `npm run pack`

Create the pear end bundle used to start the BareKit Worklet

> [!CAUTION]  
> Required prebuild step.

```sh
npm run pack
```

Uses: `npx bare-pack --host ios --host android --linked --out ./src/worker.bundle.js ./pearend/worker.js`

---

#### `npm run update`

Creates iOS and android bundle and copies package.json all to the dist folder.

```sh
npm run update
```

Uses : `npx react-native bundle --platform ios --dev false --entry-file index.ts --bundle-output dist/runtime.ios.bundle --assets-dest dist/assets && npx react-native bundle --platform android --dev false --entry-file index.ts --bundle-output dist/runtime.android.bundle --assets-dest dist/assets && cp -f package.json dist/package.json`

---

#### `npm run ios`

Runs the app in an iOS Simulator.

```sh
npm run ios
```

Uses: `npx expo run:ios`

---

#### `npm run android`

Connects to SKD and runs the app in an Android Simulator.

```sh
npm run android
```

Uses: `npx expo run:android`

---

#### `npm run lint`

Check formatting and linting.

```sh
npm run lint
```

Runs:

- `prettier --check`
- `lunte`

---

#### `npm run format`

Auto-format and fix lint issues.

```sh
npm run format
```

Runs:

- `prettier --write .`
- `lunte --fix`

## Setup OTA

How to setup Over The Air updates with Pear

### Replace code

#### `(on iOS) ./ios/<appname>/AppDelegate.swift`

Replace the bundleURL function with the following:

```swift
override func bundleURL() -> URL? {
#if DEBUG
    return RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: ".expo/.virtual-metro-entry")
#else
    let documentDirectory = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first!
    let otaBundleURL = documentDirectory.appendingPathComponent("pear-runtime/upgrade/runtime.ios.bundle")

    if FileManager.default.fileExists(atPath: otaBundleURL.path) {
        return otaBundleURL
    }

    return Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
}
```
---
#### `(on android) ./android/app/src/main/java/com/anonymous/<appname>/MainApplication.kt`

Add this at the top of the file:

```kt
import java.io.File
```

And replace you `DefaultReactNativeHost` object with the following:

```kt
object : DefaultReactNativeHost(this) {

    override fun getPackages(): List<ReactPackage> =
      PackageList(this).packages.apply {
        // add custom packages here if needed
      }

    override fun getJSMainModuleName(): String = ".expo/.virtual-metro-entry"

    override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

    override fun getJSBundleFile(): String? {
      if (BuildConfig.DEBUG) {
        return super.getJSBundleFile()
      }

      val file = File(
        applicationContext.filesDir,
        "pear-runtime/upgrade/runtime.android.bundle"
      )

      return if (file.exists()) {
        file.absolutePath
      } else {
        super.getJSBundleFile()
      }
    }

    override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
}
```

### Distribute

#### `Setup`

Run the following to get a hash key:

```sh
pear touch

$ gaoyux1oteqzqy9qnutyoms4d7r4eqzau5csf9cg1hrp8pn4hnso
```

Prepend the hash key with `pear://` Put the hash key in the `package.json`'s `upgrade` field, and change the version field:

```json
"version": "1.0.2",
"upgrade": "pear://gaoyux1oteqzqy9qnutyoms4d7r4eqzau5csf9cg1hrp8pn4hnso",
```
---
#### `Prepare Payload`

Make sure the pearend bundle is up to date:

```sh
npm run pack
```

Adjust the version in the package.json.

Create the React-Native app bundle and copy the package.json:

```sh
npm run update
```

---
#### `Stage and Seed`

Stage the payload

```sh
pear stage pear://gaoyux1oteqzqy9qnutyoms4d7r4eqzau5csf9cg1hrp8pn4hnso dist
```

Seed the payload

```sh
pear seed pear://gaoyux1oteqzqy9qnutyoms4d7r4eqzau5csf9cg1hrp8pn4hnso
```

#### `Run production test`

```sh
npx expo run:ios --configuration Release
```
Make changes to the project.

Then go through the `Prepare Payload` step and stage.

The payload shoudl still be seeded.

Restart the app to see the updated version

## LICENSE

Apache-2.0
