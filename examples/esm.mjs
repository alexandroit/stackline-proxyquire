import { createProxyquire } from '../index.mjs'

const proxyquire = createProxyquire(import.meta.url)
const message = proxyquire('./message.cjs', {
  './clock.cjs': () => '14:45 UTC'
})

const result = message('deploy')
if (result !== 'deploy at 14:45 UTC') throw new Error(`unexpected result: ${result}`)
console.log(result)
