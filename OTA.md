# OTA updates

The current OTA setup and release flow is documented in the main guide:

- [Version management](./README.md#version-management)
- [Prepare payload](./README.md#prepare-payload)
- [OTA bundle loading](./README.md#plugin-ota-bundle-loading)
- [Application update flow](./README.md#application-update-flow)

`package.json.version` is the single version shared by native and OTA releases.
`pear.json` `updates.minver` is changed only when an OTA requires a newer native
release.

Note that the minimum-version gate does not currently take effect; see the warning
under [Version management](./README.md#version-management).
