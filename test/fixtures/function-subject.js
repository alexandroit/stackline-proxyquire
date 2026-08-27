'use strict'

var FunctionDependency = require('./function-dependency')

module.exports = {
  Dependency: FunctionDependency,
  make: function (name) { return new FunctionDependency(name) }
}
