'use strict'

Object.defineProperty(module, 'id', {
  configurable: true,
  get: function () { throw new Error('poison id') }
})

module.exports = 'loaded-with-poisoned-id'
