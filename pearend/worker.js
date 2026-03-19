/* global Bare */
const RPC = require('bare-rpc')
const { IPC } = Bare
const PearRuntime = require('pear-mobile')
const Corestore = require('corestore')
const Hyperswarm = require('hyperswarm')
const path = require('bare-path')
const dir = require('bare-storage')
const goodbye = require('graceful-goodbye')
const { version, upgrade, name, productName } = require('../package.json')

const isDev = Bare.argv.pop()
const updates = isDev?.toLowerCase() === 'false' ? true : false
const appName = productName ?? name

const rpc = new RPC(IPC, (req) => {
  // use two way communication here
})
const req = rpc.request(1)
req.send('Hello from Worklet!👋🍐')

goodbye(async () => {
  await swarm.destroy()
  await pear.close()
  await store.close()
})

main()
async function main() {
  const store = new Corestore(path.join(dir.persistent(), 'pear-runtime/corestore'))
  const keyPair = await store.createKeyPair('my-store')
  const swarm = new Hyperswarm({ keyPair })

  const pear = new PearRuntime({ version, upgrade, name: appName, updates, swarm, store })

  pear.updater.on('error', (err) => console.error(err))
  pear.updater.on('updated', async () => {
    await pear.updater.applyUpdate()
    const req = rpc.request(0)
    req.send('update')
  })

  await pear.ready()
  swarm.on('connection', (connection) => store.replicate(connection))
  swarm.join(pear.updater.drive.core.discoveryKey, {
    client: true,
    server: false
  })

  const reqTwo = rpc.request(0)
  reqTwo.send(pear.updater.version.toString())
}
