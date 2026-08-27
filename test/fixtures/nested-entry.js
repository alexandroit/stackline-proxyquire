'use strict'

var innerProxyquire = require('../..')
module.exports = innerProxyquire('./nested-inner', {
  './nested-dependency': { value: 'inner-stub' }
})
