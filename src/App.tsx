import { useState, useEffect } from 'react'
import { StatusBar } from 'expo-status-bar'
import { StyleSheet, Text, View, Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import PearRuntime from 'pear-mobile'
import RPC from 'bare-rpc'
import b4a from 'b4a'
import bundle from './worker.bundle.js'
import { version, upgrade } from '../package.json'
import { registerRootComponent } from 'expo'
import RNFS from 'react-native-fs' 
import { DevSettings } from 'react-native'

bootstrap()

export default function App() {
  console.log('current version:', version)
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function confirmUpdate() {
      const pending = await AsyncStorage.getItem('updatePending')

      if (pending === 'true') {
        await AsyncStorage.multiSet([
          ['updateConfirmed', 'true'],
          ['updatePending', 'false']
        ])
      }
    }

    confirmUpdate()
  }, [])

  const runtime = new PearRuntime({ version, upgrade })
  runtime.on('updateReady', async () => {
    console.log('applying update in 3 seconds')
    await new Promise((resolve) => setTimeout(resolve, 3000))
    runtime.applyUpdate()
  })
  const IPC = runtime.run('/worker.bundle', bundle, [])
  new RPC(IPC, (req) =>{
    if (req.command === 0) {
      const parsed = b4a.toString(req.data)
      setMessage(parsed)
    }
  })
  return (
    <View style={styles.container}>
      <Text>{message}</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

async function earlyBootGuard() {
  const pending = await AsyncStorage.getItem('updatePending')
  const confirmed = await AsyncStorage.getItem('updateConfirmed')

  if (pending === 'true' && confirmed !== 'true') {
    const bundlePath = `${RNFS.DocumentDirectoryPath}/pear-runtime/upgrade/runtime.${Platform.OS}.bundle`

    if (await RNFS.exists(bundlePath)) {
      await RNFS.unlink(bundlePath)
    }

    await AsyncStorage.multiRemove(['updatePending', 'updateConfirmed'])
    DevSettings.reload()
    return false
  }

  return true
}

async function bootstrap() {
  const ok = await earlyBootGuard()
  if (ok) {
    registerRootComponent(App)
  }
}
