'use strict'

var Module = require('module')
var path = require('path')
var fileURLToPath = require('url').fileURLToPath
var Proxyquire = require('./lib/proxyquire')
var ProxyquireError = require('./lib/proxyquire-error')

function detachChild (parent, child) {
  if (!parent || !Array.isArray(parent.children)) return
  for (var index = parent.children.length - 1; index >= 0; index--) {
    if (parent.children[index] === child) parent.children.splice(index, 1)
  }
}

function callerModule (parent) {
  if (parent && typeof parent.require === 'function' && typeof parent.filename === 'string') {
    return parent
  }

  var filename
  if (typeof parent === 'string' && parent) {
    filename = /^file:/i.test(parent) ? fileURLToPath(parent) : parent
  } else if (parent && typeof parent.href === 'string') {
    filename = fileURLToPath(parent.href)
  } else {
    throw new ProxyquireError(
      'createProxyquire(parent) requires a CommonJS module, filename, or file URL.'
    )
  }

  if (!path.isAbsolute(filename)) {
    throw new ProxyquireError(
      'createProxyquire(parent) requires an absolute filename or file URL.'
    )
  }

  // Match module.createRequire(): an anchor ending in a separator represents
  // a directory, while every other absolute string represents a filename.
  if (filename.slice(-1) === path.sep) {
    filename = path.join(filename, '__stackline_proxyquire_anchor__.js')
  }

  var caller = new Module(filename)
  caller.filename = filename
  caller.paths = Module._nodeModulePaths(path.dirname(filename)).concat(Module.globalPaths)
  return caller
}

function createProxyquire (parent) {
  return new Proxyquire(callerModule(parent))
}

// Keep the historical per-caller instance while removing the deliberately
// uncached entry from the caller's child list so repeated imports do not grow
// an unbounded chain of transient index modules.
var parent = module.parent
delete require.cache[require.resolve(__filename)]

var proxyquire = new Proxyquire(parent)
proxyquire.createProxyquire = createProxyquire
proxyquire.from = createProxyquire
proxyquire.compat = function () {
  throw new Error('Proxyquire compat mode has been removed. Please update your code to use the new API or pin the version in your package.json file to ~0.6')
}

module.exports = proxyquire
detachChild(parent, module)
