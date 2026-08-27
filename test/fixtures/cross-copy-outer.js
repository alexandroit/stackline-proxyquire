'use strict'

var Module = require('module')
var before = Module._cache
global.__stacklineInnerGlobalLoad()
var survived = Module._cache === before
require('./cross-copy-side')

module.exports = { survived: survived }
