/* global __DEV__ */

import { useState, useEffect, use } from 'react'
import { StatusBar } from 'expo-status-bar'
import { StyleSheet, Text, View } from 'react-native'
import PearRuntime from 'pear-runtime-react-native'

import RPC from 'bare-rpc'
import b4a from 'b4a'
import bundle from './worker.bundle.js'

export default function App() {
  const [message, setMessage] = useState('')
  const [currentVersion, setCurrentVersion] = useState('')

  useEffect(() => {
    const pear = new PearRuntime()
    const IPC = pear.run('/worker.bundle', bundle, [__DEV__.toString()])

    new RPC(IPC, (req) => {
      if (req.command === 0) {
        const parsed = b4a.toString(req.data)
        setCurrentVersion(parsed)
      }
      if (req.command === 1) {
        const parsed = b4a.toString(req.data)
        setMessage(parsed)
      }
    })
  }, [])

  return (
    <View style={styles.container}>
      <Text>
        {currentVersion === ''
          ? 'Checking version...'
          : currentVersion === 'update'
            ? 'Update Available! (restart to update)'
            : `Version ${currentVersion}`}
      </Text>
      <Text>{message}</Text>
      <StatusBar style='auto' />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  }
})
