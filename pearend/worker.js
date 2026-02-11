const RPC = require('bare-rpc')
const { IPC } = BareKit

const rpc = new RPC(IPC, (req) => {})
const req = rpc.request(0)
req.send('Hello Pear!👋🍐')