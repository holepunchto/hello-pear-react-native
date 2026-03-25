# hello-pear-react-native

> Pear Hello World for React Native on mobile with `pear-mobile` and `pear-runtime-react-native`

Quick start boilerplate for embedding [pear-mobile](https://github.com/holepunchto/pear-mobile) into React-Native apps.

Built with [Expo SDK v55](https://docs.expo.dev/versions/latest)

## MVP - EXPERIMENTAL

This boilerplate is MVP and Experimental.

## Requirements

- `npm`
- `node --version` >= 20.19.4

[more info](https://docs.expo.dev/versions/latest/#each-expo-sdk-version-depends-on-a-react-native-version)

#### For iOS Simulator

- `xcodebuild -version` >= 26.2
- iOS version >= 15.1

[more info](https://docs.expo.dev/versions/latest/#support-for-android-and-ios-versions)

#### For Android Simulator

- Android version >= 10 (due to react-native-bare-kit)

[more info](https://docs.expo.dev/versions/latest/#support-for-android-and-ios-versions)

## Installation

```sh
npm install
```

---

## Build Scripts

### Pre-build: Create Bare Worklet Bundle

> [!CAUTION]  
> This step is required before running the app in any environment.

```sh
npm run bundle:bare
```

**What it does:** Packages the Pear worker for BareKit runtime using `bare-pack`:

- Targets: iOS arm64, iOS arm64 simulator, iOS x64 simulator, Android arm64
- Output: `./src/worker.bundle.js`

---

#### `npm run ios`

Runs the app in an iOS Simulator.

```sh
npm run ios
```

Uses: `npx expo run:ios`

---

#### `npm run android`

Run the app in an Android Simulator.

```sh
npm run android
```

Uses: `npx expo run:android`

---

## OTA Update

#### `npm run bundle:react-native`

Creates iOS and android react-native bundles.

```sh
npm run bundle:react-native
```

Uses: `npx react-native bundle --platform ios --dev false --entry-file index.ts --bundle-output ota/ios/app.bundle --assets-dest ota/ios && npx react-native bundle --platform android --dev false --entry-file index.ts --bundle-output ota/android/app.bundle --assets-dest ota/android`

---

#### `npm run build`

Creates a distribution-ready folder from react-native bundles.

```sh
npm run build
```

Uses: `npx pear-build --ios-arm64 ./ota/ios --ios-arm64-simulator ./ota/ios --ios-x64-simulator ./ota/ios --android-arm64 ./ota/android --package ./package.json --target dist`

Note: react native creates architecture-agnostic bundles, so we can just use the hosts bundle if they are the same platform (eg: ios-arm64 , ios-arm64-simulator)

---

#### `npm run update`

Runs both bundle flows and the build flow to update distributions with the current code content.

```sh
npm run update
```

Uses: `npm run bundle:bare && npm run bundle:react-native && npm run build`

---

#### `npm run prebuild`

Prebuilds ios and android native folders

```sh
npm run ios
```

Uses: `npx expo prebuild`

---

## Production Builds

#### `npm run production:ios`

Runs the app in an iOS Simulator in production mode.

```sh
npm run production:ios
```

Uses: `npx expo run:ios --configuration Release`

---

#### `npm run production:android`

Connects to SKD and runs the app in an Android Simulator in production mode.

```sh
npm run production:android
```

Uses: `npx expo run:android --variant release`

---

## Code Quality

#### `npm run lint`

Check formatting and linting.

```sh
npm run lint
```

Runs: `lunte`

#### `npm run format`

Auto-format and fix lint issues.

```sh
npm run format
```

Runs: `prettier --write .`

#### `npm test`

Format and Lint test.

```sh
npm run test
```

Runs: `prettier . --check && lunte`

## P2P OTA Updates

An update occurs when a seeded application drive is written to.

When an update occurs, the instance will emit two events `updating` and `updated`.

**pear-mobile is used only in the Bare worklet** (e.g. `pearend/worker.js`). The view layer (e.g. `App.tsx`) only starts that worklet as a bundle via `pear.run()` using `pear-runtime-react-native`. In the worklet, create the runtime with `version` and `upgrade`, listen for events, and call `applyUpdate()` on `updated` so the new bundle is used on next launch:

```js
const pear = new PearRuntime({ version, upgrade, app })
pear.updater.on('updated', () => {
  pear.updater.applyUpdate()
})
```

### Disabling Updates

To disable updates as an application default, ensure the options passed to `PearRuntime` of `pear-mobile` include the package and set the `updates` field to `false` (e.g. extract options from `package.json` : `{ version, upgrade, updates }`)

```json
{
  "version": "1.0.0",
  "updates": false,
  ...
}
```

In this example we dynamically disable updates when we run in a developer enviornment (eg `npm run ios`) and enable when we are testing for release (eg `npm run production:ios`)

```js
/* ./src/App.tsx */

// passing react-native's global __DEV__ boolean to the bare worklet
const IPC = pear.run('/worker.bundle', bundle, [__DEV__.toString()])

/* ./pearend/worker.js */

// checking the value and passing boolean to PearRuntime as updates
const isDev = Bare.argv.pop()
const updates = isDev?.toLowerCase() === 'false' ? true : false
const pear = new PearRuntime({ version, upgrade, app: appName, updates })
```

## Storage

Storage is provided by **pear-mobile in the Bare worklet**. The `PearRuntime` instance there exposes `dir` ( `/Documents` app directory, but can also pass a custom one if prefered (MAKE SURE ITS PERSISTENT)) and `storage` (e.g. `path.join(dir, 'app-storage')`). Use these as storage arguments to Corestore (or equivalent).

## Workers

Application peer-to-peer logic runs in a worker that acts as a local backend for the view layer. The worker is bundled with Bare and started via the runtime in react-native View using `pear-runtime-react-native`.

**View layer** (e.g. `src/App.tsx`): the runtime is used only to start the worklet. No `dir` or storage is passed; the worklet gets storage from pear-mobile.

```js
const PearRuntime = require('pear-runtime-react-native')
const pear = new PearRuntime()
const IPC = pear.run('/worker.bundle', bundle)
IPC.on('data', (data) => {
  console.log('data from worker', data)
})
IPC.write('hello')
```

Inside the worker (worklet), the other side of the IPC stream is `Bare.IPC`. Use the pear-mobile `PearRuntime` instance for OTA and for storage paths (`pear.dir`, `pear.storage`).

```js
const { IPC } = Bare
const PearRuntime = require('pear-mobile')
const { version, upgrade, productName } = require('../package.json')

const pear = new PearRuntime({ version, upgrade, name: productName })

Bare.IPC.on('data', (data) => console.log(data.toString()))
Bare.IPC.write('Hello from worker')

const Corestore = require('corestore')
const corestore = new Corestore(pear.storage)
```

> [!CAUTION]  
> Run `npm run bundle` after changing the worker; the bundle step produces the bundle consumed by `pear.run()`.

### Production Build

#### Upgrade Link

The `package.json` `upgrade` field must be set to a production `pear://` link.

Generate a fresh link with:

```sh
pear touch
```

This outputs a pear link such as `pear://qxenz5wmspmryjc13m9yzsqj1conqotn8fb4ocbufwtz9mtbqq5o`. Use it as the placeholder below.

Set the `package.json` `upgrade` field:

```json
{
  "version": "1.0.0",
  "upgrade": "pear://qxenz5wmspmryjc13m9yzsqj1conqotn8fb4ocbufwtz9mtbqq5o",
  ...
}
```

The machine that runs `pear touch` is the build machine and has write access to that drive.

#### Versioning

Use the `package.json` `version` field (SemVer). Bump the version before each production build; the app uses this to detect updates.

```sh
npm version <v>
```

#### Prepare Payload

- Ensure `package.json` `author`, `license`, `description`, `name` are set as needed for distribution.
- Bump version and ensure `upgrade` is set (see above).
- Build the pearend worker bundle, the app bundles and move them to the dist folder:

```sh
npm run update
```

This populates the deploy directory `dist/` with `package.json` and `by-arch/<platform-arch>/app/` containing `app.bundle` and assets. React Native bundles are platform-agnostic per platform, so simulator/device variants are copied from the same build where applicable.

#### Plugin (OTA bundle loading)

The project is already configured to load the OTA bundle when present. No manual native edits are required.

**app.json** – The Expo config plugin is registered in `expo.plugins`:

```json
"plugins": [
  ["pear-runtime-react-native/plugin"],
  ...
]
```

**metro.config.js** – Use the package’s Metro config so the default React Native (and Expo, if present) config is merged correctly:

```js
const { getMetroConfig } = require('pear-runtime-react-native/metro-config')
module.exports = getMetroConfig(__dirname)
```

**What the plugin does** – When you run prebuild (`npx expo prebuild`), the `pear-runtime-react-native/plugin` Expo config plugin patches the native projects so that in **release** builds the app loads the JS bundle from the OTA path when it exists, otherwise the bundled main bundle:

- **iOS**: It modifies `AppDelegate` (Swift or ObjC). In release, the app looks for `pear-runtime/upgrade/app.bundle` in the app’s document directory. If that file exists (written by `applyUpdate()` in the worklet), that URL is used as the bundle URL; otherwise it uses `Bundle.main.url(forResource: "main", withExtension: "jsbundle")`. In debug, the bundle root remains `.expo/.virtual-metro-entry` for Metro.
- **Android**: It modifies `MainApplication` (Kotlin or Java), adding `import java.io.File` if needed and overriding `getJSBundleFile()`. In release, it checks for `pear-runtime/upgrade/app.bundle` under `applicationContext.filesDir`; if present, that path is returned, otherwise the default bundle. In debug, the default implementation is used.

So after `applyUpdate()` in the worklet writes the new bundle to `pear-runtime/upgrade/app.bundle`, the next app launch (or reload) uses that file and the update is live.

#### Build deploy directory

The deploy directory is produced by `npm run build`: it is the project `dist/` folder. It must contain at least:

```
dist/
  package.json
  by-arch/
    ios-arm64/app/
    ios-arm64-simulator/app/
    ios-x64-simulator/app/
    android-arm64/app/
```

Once `dist/` is populated, it is ready to be staged (and optionally provisioned and multisigned).

### Stage

Synchronize the deploy directory from disk to hypercore inside Pear:

```sh
pear stage pear://qxenz5wmspmryjc13m9yzsqj1conqotn8fb4ocbufwtz9mtbqq5o dist
```

Run this on the build machine (the same machine that ran `pear touch` for the `upgrade` link).

### Seed

On the build machine:

```sh
pear seed pear://qxenz5wmspmryjc13m9yzsqj1conqotn8fb4ocbufwtz9mtbqq5o
```

On other always-online machines to reseed:

```sh
pear seed pear://qxenz5wmspmryjc13m9yzsqj1conqotn8fb4ocbufwtz9mtbqq5o
```

### Provision

Iterating produces many additions and deletions. Staging records all of them on the application drive. Provisioning syncs blocks from one drive to another and effectively removes intermediate add/delete history. Use `pear provision` to create a pre-production drive.

Create a target provision link:

```sh
pear touch
```

Signature:

```sh
pear provision <versioned-source-link> <target-link> <versioned-production-link>
```

The source link is the stage link in versioned form `pear://<fork>.<length>.<key>` (e.g. `pear://0.1079.qxenz5wmspmryjc13m9yzsqj1conqotn8fb4ocbufwtz9mtbqq5o`). The target link is the new link from `pear touch` (unversioned). The production link is a versioned multisigned (or pre-production provisioned) link to sync onto the target before applying the source.

To bootstrap the first time, use the target link versioned as `0.0` as the production link:

```sh
pear provision pear://0.1079.qxenz5wmspmryjc13m9yzsqj1conqotn8fb4ocbufwtz9mtbqq5o pear://<target-from-touch> pear://0.0.<target-from-touch>
```

Later provisions use the previous provision (or multisig) link as the production link. After each new key is ready, point the app’s `package.json` `upgrade` at that key (e.g. the new provision or multisig link).

### Multisig

Multisig improves security (multiple signers must be compromised or lost before a malicious or unrecoverable build is possible) and decouples the production key from the build machine. The production key is derived from a `namespace`, a set of signing keys, and a quorum.

#### Create signing keys

Each signer:

```sh
npm i -g hypercore-sign
hypercore-sign-generate-keys
```

Save the public key.

#### Create multisig config

Example `multisig.json` (source key = your pre-production provision key):

```json
{
  "publicKeys": ["pubkey-signer-1", "pubkey-signer-2", "pubkey-signer-3"],
  "namespace": "hello-pear-react-native",
  "quorum": 2,
  "srcKey": "<pre-production-key>"
}
```

#### Prepare multisig request

```sh
npm i -g hyper-multisig-cli
hyper-multisig request-drive <length>
```

`<length>` is the current length of the pre-production key. The command returns a signing request. The source drive must be sufficiently seeded or `hyper-multisig` may refuse.

#### Sign multisig request

Verify before signing (see next section). Then:

```sh
hypercore-sign <signing request>
```

Share the response. After a quorum of signers respond, the build can be committed.

#### Verify multisig request

```sh
hyper-multisig verify-drive --first-commit <signing request>
```

Add any available responses as extra arguments when verifying.

#### Commit multisig request

Only after verifying the request and all responses:

```sh
hyper-multisig commit-drive --first-commit <signing request>
```

Do not abort the commit. If it is interrupted, run the commit again. Once the new drive is created, seed it (e.g. add to seeders) until the tool reports it is picked up. For later commits, omit `--first-commit`. If you see `INCOMPATIBLE_SOURCE_AND_TARGET`, do not work around it; create a new pre-production key and start again.

### Distribute

Distribute the app through your usual channels (stores, website, etc.). The `pear install` flow for installing distributables peer-to-peer is not yet documented here.

### Application update flow

- Ensure the upgrade link is seeded.
- Prepare payload: bump version, `npm run bundle`, `npm run update`.
- Write: Stage (and optionally Provision, then Multisign).

When the application drive is written to, a running app receives `updating` then `updated`. In the worker, call `pear.applyUpdate()` on `updated` so the new bundle is written under `pear-runtime/upgrade/`. After the user restarts the app, the native layer loads the OTA bundle from that path (see [Set up plugin](#set-up-plugin-load-ota-bundle)) and the updated app runs.

### Storage and multiple instances

Storage is determined by the runtime (e.g. `pear.updater.dir`). On device it is typically under the app’s documents or files directory. For development you can use a custom path if the runtime supports it (see pear-mobile docs). This is a conventional starting point; adjust per project (e.g. in-app storage location for users).

## LICENSE

Apache-2.0
