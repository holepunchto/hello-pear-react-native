const { getDefaultConfig: getExpoConfig } = require('expo/metro-config')
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config')

const expoConfig = getExpoConfig(__dirname)
const rnConfig = getDefaultConfig(__dirname)

module.exports = mergeConfig(rnConfig, expoConfig)
