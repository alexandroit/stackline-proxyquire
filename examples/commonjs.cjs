'use strict'

const proxyquire = require('..')

const message = proxyquire('./message.cjs', {
  './clock.cjs': () => '09:30 UTC'
})

const result = message('release')
if (result !== 'release at 09:30 UTC') throw new Error(`unexpected result: ${result}`)
console.log(result)
