/* global __DEV__ */

import { useState, useEffect } from 'react'
import { StatusBar } from 'expo-status-bar'
import { StyleSheet, Text, View } from 'react-native'
import PearRuntime from 'pear-mobile'

import FramedStream from 'framed-stream'
import b4a from 'b4a'
import bundle from './worker.bundle.js'
import { version, upgrade, name, productName } from '../package.json'

const appName = productName ?? name

export default function App() {
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState('')

  useEffect(() => {
    // since there is no file system in mobile apps like on desktop, argv[0] and argv[1],
    // which on desktop are the path to the parent execuatable and the child entry,
    // will be empty in oder to align with our hybrid worker
    const IPC = PearRuntime.run('/worker.bundle', bundle, [
      (!__DEV__).toString(),
      version,
      upgrade,
      appName
    ])
    const pipe = new FramedStream(IPC)

    pipe.on('data', (data) => {
      const parsed = b4a.toString(data)

      if (parsed === 'updating') {
        setStatus('updating')
        return
      }

      if (parsed === 'updated') {
        setStatus('updated')
        pipe.write('pear:applyUpdate')
        return
      }

      if (parsed === 'pear:updateApplied') {
        setStatus('update-applied')
        return
      }

      setMessage(parsed)
    })

    pipe.on('error', (err) => console.error(err))

    return () => pipe.destroy()
  }, [])

  return (
    <View style={styles.container}>
      <Text>
        {status === 'updating'
          ? 'Getting new update...'
          : status === 'updated'
            ? 'Update downloaded, applying...'
            : status === 'update-applied'
              ? 'Update applied! (restart to update)'
              : 'No updates yet'}
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
