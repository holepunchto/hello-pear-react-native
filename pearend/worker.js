/* global Bare */
const RPC = require('bare-rpc')
const { IPC } = Bare
const PearRuntime = require('pear-mobile')
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

const pear = new PearRuntime({ version, upgrade, app: appName, updates })
pear.updater.on('error', (err) => console.error(err))
pear.updater.on('updated', async () => {
  await pear.updater.applyUpdate()
  const req = rpc.request(0)
  req.send('update')
})

goodbye(async () => {
  await pear.close()
})

main()
async function main() {
  await pear.ready()
  const reqTwo = rpc.request(0)
  reqTwo.send(pear.updater.version.toString())
}
