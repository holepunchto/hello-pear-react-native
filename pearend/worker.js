/* global Bare */
const RPC = require('bare-rpc')
const { IPC } = Bare
const PearRuntime = require('pear-mobile')
const { version, upgrade } = require('../package.json')

const rpc = new RPC(IPC, (req) => {
    // use two way communication here
})
const req = rpc.request(1)
req.send('Hello from Worklet!👋🍐')

const pear = new PearRuntime({ version, upgrade })
pear.on('updated', () => {
    pear.applyUpdate()
})

await pear.ready()
const reqTwo = rpc.request(0)
reqTwo.send(pear.version.toString())
