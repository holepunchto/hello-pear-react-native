import { useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { StyleSheet, Text, View } from 'react-native'
import PearRuntime from 'pear-mobile'
import RPC from 'bare-rpc'
import b4a from 'b4a'
import bundle from './worker.bundle.js'

export default function App() {
  const [message, setMessage] = useState('')

  const runtime = new PearRuntime()
  const IPC = runtime.run('/worker.bundle', bundle, [])
  new RPC(IPC, (req) => {
    if (req.command === 0) {
      const parsed = b4a.toString(req.data)
      setMessage(parsed)
    }
  })
  return (
    <View style={styles.container}>
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
