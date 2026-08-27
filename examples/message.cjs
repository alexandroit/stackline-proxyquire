'use strict'

const clock = require('./clock.cjs')

module.exports = function message (action) {
  return `${action} at ${clock()}`
}
