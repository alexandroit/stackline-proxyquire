'use strict'

function Dependency (name) {
  this.name = name
}

Dependency.prototype.greet = function () {
  return 'hello ' + this.name
}

var dependency = {
  Dependency: Dependency,
  add: function (left, right) { return left + right },
  label: 'real'
}

Object.defineProperty(dependency, 'hidden', {
  enumerable: false,
  get: function () { return 'hidden-real' }
})

module.exports = dependency
