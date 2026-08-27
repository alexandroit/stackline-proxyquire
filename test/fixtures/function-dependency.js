'use strict'

function FunctionDependency (name) {
  this.name = name
}

FunctionDependency.kind = 'real-constructor'
FunctionDependency.prototype.greet = function () {
  return 'hello ' + this.name
}

module.exports = FunctionDependency
