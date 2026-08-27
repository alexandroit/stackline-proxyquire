'use strict'

var current = require.extensions['.js']
Object.defineProperty(require.extensions, '.js', {
  configurable: true,
  enumerable: true,
  value: current,
  writable: false
})

module.exports = 'loaded-with-locked-handler'
