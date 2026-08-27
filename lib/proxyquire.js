'use strict'
/* jshint laxbreak:true, loopfunc:true */

var Module = require('module')
var path = require('path')
var resolve = require('resolve')
var ProxyquireError = require('./proxyquire-error')
var is = require('./is')
var assert = require('assert')
var hasOwnProperty = Object.prototype.hasOwnProperty
var proxyquireRequireMarker = typeof Symbol === 'function' && typeof Symbol.for === 'function'
  ? Symbol.for('stackline.proxyquire.require')
  : '__stackline_proxyquire_require__'

function requireFromParent (parent, request) {
  var requireFunction = parent.require
  while (requireFunction && requireFunction[proxyquireRequireMarker]) {
    requireFunction = requireFunction[proxyquireRequireMarker]
  }
  return requireFunction.call(parent, request)
}

function defaultContext (context) {
  return context || { containsGlobal: false, containsRuntimeGlobal: false }
}

function detachTransientModule (parent, id, originalChildren) {
  try {
    if (!parent || !Array.isArray(parent.children)) return

    var children = parent.children
    for (var index = children.length - 1; index >= 0; index--) {
      var child = children[index]
      var isTarget = child && (child.filename === id || child.id === id)
      var existedBefore = originalChildren.indexOf(child) !== -1
      if (isTarget && !existedBefore) {
        children.splice(index, 1)
      }
    }
  } catch (_) {
    // Parent bookkeeping is best-effort. Immutable or adversarial Module
    // objects must not prevent cache or hook restoration.
  }
}

function mergeMissingDescriptors (destination, source) {
  Object.getOwnPropertyNames(source).forEach(function (name) {
    if (hasOwnProperty.call(destination, name)) return
    Object.defineProperty(destination, name, Object.getOwnPropertyDescriptor(source, name))
  })
}

function fillMissingKeys (destination, source) {
  if (destination && (is.Object(source) || typeof source === 'function')) {
    mergeMissingDescriptors(destination, source)
    if (
      typeof destination === 'function' &&
      typeof source === 'function' &&
      destination.prototype &&
      (typeof destination.prototype === 'object' || typeof destination.prototype === 'function') &&
      source.prototype
    ) {
      mergeMissingDescriptors(destination.prototype, source.prototype)
    }
  }
  return destination
}

function moduleNotFoundError (request) {
  var error = new Error('Cannot find module \'' + request + '\'')
  error.code = 'MODULE_NOT_FOUND'
  return error
}

function resolveModule (baseModule, request) {
  return resolve.sync(request, {
    basedir: path.dirname(baseModule),
    extensions: Object.keys(require.extensions),
    paths: Module.globalPaths
  })
}

function validateArguments (request, stubs) {
  var msg = (function getMessage () {
    if (!request) { return 'Missing argument: "request". Need it to resolve desired module.' }

    if (!stubs) { return 'Missing argument: "stubs". If no stubbing is needed, use regular require instead.' }

    if (!is.String(request)) { return 'Invalid argument: "request". Needs to be a requirable string that is the module to load.' }

    if (!is.Object(stubs)) { return 'Invalid argument: "stubs". Needs to be an object containing overrides e.g., {"path": { extname: function () { ... } } }.' }
  })()

  if (msg) throw new ProxyquireError(msg)
}

function Proxyquire (parent) {
  var self = this
  var fn = self.load.bind(self)
  var proto = Proxyquire.prototype

  this._parent = parent
  this._preserveCache = true

  Object.keys(proto)
    .forEach(function (key) {
      if (is.Function(proto[key])) fn[key] = self[key].bind(self)
    })

  self.fn = fn
  return fn
}

/**
 * Disables call thru, which determines if keys of original modules will be used
 * when they weren't stubbed out.
 * @name noCallThru
 * @function
 * @private
 * @return {object} The proxyquire function to allow chaining
 */
Proxyquire.prototype.noCallThru = function () {
  this._noCallThru = true
  return this.fn
}

/**
 * Enables call thru, which determines if keys of original modules will be used
 * when they weren't stubbed out.
 * @name callThru
 * @function
 * @private
 * @return {object} The proxyquire function to allow chaining
 */
Proxyquire.prototype.callThru = function () {
  this._noCallThru = false
  return this.fn
}

/**
 * Will make proxyquire remove the requested modules from the `require.cache` in order to force
 * them to be reloaded the next time they are proxyquired.
 * This behavior differs from the way nodejs `require` works, but for some tests this maybe useful.
 *
 * @name noPreserveCache
 * @function
 * @private
 * @return {object} The proxyquire function to allow chaining
 */
Proxyquire.prototype.noPreserveCache = function () {
  this._preserveCache = false
  return this.fn
}

/**
 * Restores proxyquire caching behavior to match the one of nodejs `require`
 *
 * @name preserveCache
 * @function
 * @private
 * @return {object} The proxyquire function to allow chaining
 */
Proxyquire.prototype.preserveCache = function () {
  this._preserveCache = true
  return this.fn
}

/**
 * Loads a module using the given stubs instead of their normally resolved required modules.
 * @param request The requirable module path to load.
 * @param stubs The stubs to use. e.g., { "path": { extname: function () { ... } } }
 * @return {*} A newly resolved module with the given stubs.
 */
Proxyquire.prototype.load = function (request, stubs) {
  validateArguments(request, stubs)

  if (!this._parent || typeof this._parent.require !== 'function') {
    throw new ProxyquireError(
      'Proxyquire was imported without a CommonJS parent. ' +
      'Create a caller-bound instance with createProxyquire(import.meta.url).'
    )
  }

  // Keep global-mode state local to this invocation. The upstream instance
  // fields leaked @global/@runtimeGlobal into every later load made by the
  // same proxyquire function.
  var context = {
    containsGlobal: false,
    containsRuntimeGlobal: false
  }

  // Find out if any of the passed stubs are global overrides.
  Object.keys(stubs).forEach(function (key) {
    var stub = stubs[key]

    if (stub === null) return

    if (typeof stub === 'undefined') {
      throw new ProxyquireError('Invalid stub: "' + key + '" cannot be undefined')
    }

    if (hasOwnProperty.call(stub, '@global')) {
      context.containsGlobal = true
    }

    if (hasOwnProperty.call(stub, '@runtimeGlobal')) {
      context.containsGlobal = true
      context.containsRuntimeGlobal = true
    }
  })

  // Ignore the module cache when return the requested module
  return this._withoutCache(
    this._parent,
    stubs,
    request,
    requireFromParent.bind(null, this._parent, request),
    context
  )
}

// Resolves a stub relative to a module.
// `baseModule` is the module we're resolving from.  `pathToResolve` is the
// module we want to resolve (i.e. the string passed to `require()`).
Proxyquire.prototype._resolveModule = function (baseModule, pathToResolve, stubs) {
  try {
    return resolveModule(baseModule, pathToResolve)
  } catch (err) {
    // If this is not a relative path (e.g. "foo" as opposed to "./foo"), and
    // we couldn't resolve it, then we just let the path through unchanged.
    // It's safe to do this, because if two different modules require "foo",
    // they both expect to get back the same thing.
    if (pathToResolve[0] !== '.') {
      return pathToResolve
    }

    // If `pathToResolve` is relative, then it is *not* safe to return it,
    // since a file in one directory that requires "./foo" expects to get
    // back a different module than one that requires "./foo" from another
    // directory.  However, if !this._preserveCache, then we don't want to
    // throw, since we can resolve modules that don't exist.  Resolve as
    // best we can. We also need to check if the relative module has @noCallThru.
    var resolvedPath = path.resolve(path.dirname(baseModule), pathToResolve)
    var moduleNoCallThru
    if (hasOwnProperty.call(stubs, pathToResolve) && stubs[pathToResolve]) {
      // pathToResolve is currently relative on stubs from _withoutCache() call
      moduleNoCallThru = hasOwnProperty.call(stubs[pathToResolve], '@noCallThru') ? stubs[pathToResolve]['@noCallThru'] : undefined
    } else if (hasOwnProperty.call(stubs, resolvedPath) && stubs[resolvedPath]) {
      // after _withoutCache() alters stubs paths to be absolute
      moduleNoCallThru = hasOwnProperty.call(stubs[resolvedPath], '@noCallThru') ? stubs[resolvedPath]['@noCallThru'] : undefined
    }
    if (!this._preserveCache || this._noCallThru || moduleNoCallThru) {
      return resolvedPath
    }

    throw err
  }
}

// This replaces a module's require function
Proxyquire.prototype._require = function (module, stubs, path) {
  var context = arguments.length > 3 ? arguments[2] : undefined
  if (arguments.length > 3) path = arguments[3]
  context = defaultContext(context)
  assert(typeof path === 'string', 'path must be a string')
  assert(path, 'missing path')

  var resolvedPath = this._resolveModule(module.filename, path, stubs)
  if (hasOwnProperty.call(stubs, resolvedPath)) {
    var stub = stubs[resolvedPath]
    if (stub === null) {
      // Mimic the module-not-found exception thrown by node.js.
      throw moduleNotFoundError(path)
    }

    if (
      (is.Object(stub) || typeof stub === 'function') &&
      (hasOwnProperty.call(stub, '@noCallThru') ? !stub['@noCallThru'] : !this._noCallThru)
    ) {
      fillMissingKeys(stub, Module._load(path, module))
    }

    // We are top level or this stub is marked as global
    if (module.parent === this._parent || hasOwnProperty.call(stub, '@global') || hasOwnProperty.call(stub, '@runtimeGlobal')) {
      return stub
    }
  }

  // Only ignore the cache if we have global stubs
  if (context.containsRuntimeGlobal) {
    return this._withoutCache(module, stubs, path, Module._load.bind(Module, path, module), context)
  } else {
    return Module._load(path, module)
  }
}

Proxyquire.prototype._withoutCache = function (module, stubs, path, func) {
  var context = defaultContext(arguments[4])
  var resolvedPath = Module._resolveFilename(path, module)
  var originalChildren = Array.isArray(module.children) ? module.children.slice() : []
  // Temporarily disable the cache - either per-module or globally if we have global stubs
  var restoreCache = this._disableCache(module, path, context)
  var restoreExtensionHandlers = function () {}

  try {
    // Resolve all stubs to absolute paths. A null-prototype map preserves
    // package names such as "__proto__" as data instead of object metadata.
    stubs = Object.keys(stubs)
      .reduce(function (result, stubPath) {
        var resolvedStubPath = this._resolveModule(resolvedPath, stubPath, stubs)
        result[resolvedStubPath] = stubs[stubPath]
        return result
      }.bind(this), Object.create(null))

    // Override all require extension handlers
    restoreExtensionHandlers = this._overrideExtensionHandlers(module, stubs, context)

    // Execute the function that needs the module cache disabled
    return func()
  } finally {
    try {
      detachTransientModule(module, resolvedPath, originalChildren)
    } finally {
      try {
        // Restore the cache if we are preserving it
        if (this._preserveCache || context.containsGlobal) {
          restoreCache()
        }

        if (!this._preserveCache) {
          var ids = [resolvedPath].concat(Object.keys(stubs).filter(Boolean))
          ids.forEach(function (id) {
            delete Module._cache[id]
          })
        }
      } finally {
        // Extension hooks must be restored even if cache cleanup fails.
        restoreExtensionHandlers()
      }
    }
  }
}

Proxyquire.prototype._disableCache = function (module, path) {
  var context = defaultContext(arguments[2])
  if (context.containsGlobal) {
    // empty the require cache because if we are stubbing C but requiring A,
    // and if A requires B and B requires C, then B and C might be cached already
    // and we'll never get the chance to return our stub
    return this._disableGlobalCache()
  }

  // Temporarily delete the SUT from the require cache
  return this._disableModuleCache(path, module)
}

Proxyquire.prototype._disableGlobalCache = function () {
  var cache = Module._cache
  var temporaryCache = Object.create(null)

  // Build the replacement before publishing it so a hostile cache accessor
  // cannot leave Node pointing at a half-created cache.
  Object.keys(cache).forEach(function (id) {
    // Keep native modules (i.e. `.node` files).
    // Otherwise, Node.js would throw a “Module did not self-register”
    // error upon requiring it a second time.
    // See https://github.com/nodejs/node/issues/5016.
    if (/\.node$/.test(id)) {
      temporaryCache[id] = cache[id]
    }
  })

  Module._cache = temporaryCache

  // Return a function that will undo what we just did
  return function () {
    var activeCache = Module._cache
    var restoreError
    // Keep native modules which were added to the cache in the meantime.
    try {
      Object.keys(activeCache).forEach(function (id) {
        if (/\.node$/.test(id)) {
          cache[id] = activeCache[id]
        }
      })
    } catch (error) {
      restoreError = error
    } finally {
      Module._cache = cache
    }

    if (restoreError) throw restoreError
  }
}

Proxyquire.prototype._disableModuleCache = function (path, module) {
  // Find the ID (location) of the SUT, relative to the parent
  var id = Module._resolveFilename(path, module)

  var cached = Module._cache[id]
  delete Module._cache[id]

  // Return a function that will undo what we just did
  return function () {
    if (cached) {
      Module._cache[id] = cached
    } else {
      delete Module._cache[id]
    }
  }
}

Proxyquire.prototype._overrideExtensionHandlers = function (module, resolvedStubs) {
  var context = defaultContext(arguments[2])
  var originalExtensions = Object.create(null)
  var originalExtensionDescriptors = Object.create(null)
  var installedExtensions = Object.create(null)
  var self = this
  var active = true

  function restore () {
    var restoreError
    active = false
    Object.keys(originalExtensions).forEach(function (extension) {
      if (require.extensions[extension] === installedExtensions[extension]) {
        try {
          Object.defineProperty(
            require.extensions,
            extension,
            originalExtensionDescriptors[extension]
          )
        } catch (error) {
          if (!restoreError) restoreError = error
        }
      }
    })
    if (restoreError) throw restoreError
  }

  try {
    Object.keys(require.extensions).forEach(function (extension) {
      // Store the original so we can restore it later.
      originalExtensions[extension] = require.extensions[extension]
      originalExtensionDescriptors[extension] = Object.getOwnPropertyDescriptor(
        require.extensions,
        extension
      )

      // Override the default handler for the requested file extension. A
      // marker lets the innermost proxyquire load win when loads are nested:
      // the outer wrapper still compiles the file but cannot replace the
      // inner load's bound require function.
      var proxyquireExtension = function (module, filename) {
        if (active && !module.require[proxyquireRequireMarker]) {
          var originalRequire = module.require
          var boundRequire = self._require.bind(self, module, resolvedStubs, context)
          Object.defineProperty(boundRequire, proxyquireRequireMarker, { value: originalRequire })
          module.require = boundRequire
        }

        return originalExtensions[extension](module, filename)
      }
      installedExtensions[extension] = proxyquireExtension
      require.extensions[extension] = proxyquireExtension
    })
  } catch (error) {
    restore()
    throw error
  }

  // Only remove handlers that this invocation still owns. This preserves a
  // handler deliberately installed while the target module is evaluating.
  return restore
}

module.exports = Proxyquire
