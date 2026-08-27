'use strict'

var logger = require('./logger')
var store = require('./store')

module.exports = function service (key) {
  logger.info('read:' + key)
  return store.get(key)
}
