'use strict'

var assert = require('node:assert/strict')
var childProcess = require('node:child_process')
var Module = require('node:module')
var path = require('node:path')
var test = require('node:test')

function childCount (parent, id) {
  return parent.children.filter(function (child) {
    return child && (child.filename === id || child.id === id)
  }).length
}

function clearFixture (name) {
  delete require.cache[require.resolve('./fixtures/' + name)]
}

test('repeated package imports do not accumulate transient index children', function () {
  var indexId = require.resolve('..')
  var before = childCount(module, indexId)
  for (var index = 0; index < 250; index++) require('..')
  assert.equal(childCount(module, indexId), before)
  assert.equal(require.cache[indexId], undefined)
})

test('preserve and no-preserve loads detach only newly loaded targets', function () {
  var stable = require('./fixtures/stable-child')
  var stableId = require.resolve('./fixtures/stable-child')
  var targetId = require.resolve('./fixtures/subject')
  var stableChild = module.children.find(function (child) { return child.id === stableId })
  var before = childCount(module, targetId)

  var preserve = require('..').preserveCache()
  for (var first = 0; first < 100; first++) preserve('./fixtures/subject', {})
  assert.equal(childCount(module, targetId), before)

  var noPreserve = require('..').noPreserveCache()
  for (var second = 0; second < 100; second++) noPreserve('./fixtures/subject', {})
  assert.equal(childCount(module, targetId), before)
  assert.equal(module.children.includes(stableChild), true)
  assert.equal(require('./fixtures/stable-child'), stable)
})

test('self-evicting targets are detached by identity even after leaving the cache', function () {
  var targetId = require.resolve('./fixtures/self-evicting')
  var before = childCount(module, targetId)
  var proxyquire = require('..')
  for (var index = 0; index < 100; index++) {
    assert.equal(proxyquire('./fixtures/self-evicting', {}).loaded, true)
  }
  assert.equal(childCount(module, targetId), before)
  assert.equal(require.cache[targetId], undefined)
})

test('adversarial Module accessors cannot block cache and hook teardown', function () {
  var targetId = require.resolve('./fixtures/poison-id')
  var handler = require.extensions['.js']
  var before = childCount(module, targetId)
  assert.equal(require('..')('./fixtures/poison-id', {}), 'loaded-with-poisoned-id')
  assert.equal(require.extensions['.js'], handler)
  assert.equal(require.cache[targetId], undefined)
  assert.equal(childCount(module, targetId), before)
})

test('a failed relative stub lookup restores a warmed target exactly', function () {
  clearFixture('subject')
  var targetId = require.resolve('./fixtures/subject')
  var warmed = require('./fixtures/subject')
  warmed.marker = 'warmed'
  var cachedEntry = require.cache[targetId]

  assert.throws(function () {
    require('..')('./fixtures/subject', { './does-not-exist': {} })
  }, function (error) { return error && error.code === 'MODULE_NOT_FOUND' })

  assert.equal(require.cache[targetId], cachedEntry)
  assert.equal(require('./fixtures/subject'), warmed)
  assert.equal(require('./fixtures/subject').marker, 'warmed')
})

test('global flags do not leak into later ordinary calls', function () {
  ;['counter', 'ordinary', 'global-leaf', 'global-middle', 'global-root', 'runtime-root'].forEach(clearFixture)
  global.__stacklineProxyquireCounter = 0

  var warmedCounter = require('./fixtures/counter')
  var proxyquire = require('..')
  var globallyStubbed = proxyquire('./fixtures/global-root', {
    './global-leaf': { value: 'global-stub', '@global': true }
  })
  assert.equal(globallyStubbed(), 'global-stub')
  assert.equal(proxyquire('./fixtures/ordinary', {}), warmedCounter)
  assert.equal(global.__stacklineProxyquireCounter, 1)

  var deferred = proxyquire('./fixtures/runtime-root', {
    './global-leaf': { value: 'runtime-stub', '@runtimeGlobal': true }
  })
  assert.equal(deferred(), 'runtime-stub')
  assert.equal(proxyquire('./fixtures/ordinary', {}), warmedCounter)
  assert.equal(global.__stacklineProxyquireCounter, 1)
})

test('noPreserveCache with a global stub restores the shared cache object', function () {
  ;['counter', 'global-leaf', 'global-middle', 'global-root'].forEach(clearFixture)
  global.__stacklineProxyquireCounter = 0
  var warmedCounter = require('./fixtures/counter')
  var stable = require('./fixtures/stable-child')
  var cache = Module._cache

  var result = require('..').noPreserveCache()('./fixtures/global-root', {
    './global-leaf': { value: 'global-no-preserve', '@global': true }
  })
  assert.equal(result(), 'global-no-preserve')
  assert.equal(Module._cache, cache)
  assert.equal(require.cache, cache)
  assert.equal(require('./fixtures/counter'), warmedCounter)
  assert.equal(require('./fixtures/stable-child'), stable)
  assert.equal(global.__stacklineProxyquireCounter, 1)
  assert.equal(require.cache[require.resolve('./fixtures/global-root')], undefined)
})

test('global cache bypass preserves native-module entries in both directions', function () {
  var proxyquire = require('..')
  var originalCache = Module._cache
  var beforeId = path.join(__dirname, 'before.stackline.node')
  var duringId = path.join(__dirname, 'during.stackline.node')
  var before = { id: beforeId }
  var during = { id: duringId }
  originalCache[beforeId] = before

  try {
    var restore = proxyquire._disableGlobalCache()
    assert.notEqual(Module._cache, originalCache)
    assert.equal(Module._cache[beforeId], before)
    Module._cache[duringId] = during
    restore()
    assert.equal(Module._cache, originalCache)
    assert.equal(Module._cache[duringId], during)
  } finally {
    Module._cache = originalCache
    delete originalCache[beforeId]
    delete originalCache[duringId]
  }
})

test('nested global loads from separate package copies preserve cache layering', function () {
  var constructorId = require.resolve('../lib/proxyquire')
  var previousConstructor = require.cache[constructorId]
  var FirstProxyquire = require('../lib/proxyquire')
  delete require.cache[constructorId]
  var SecondProxyquire = require('../lib/proxyquire')
  var outer = new FirstProxyquire(module)
  var inner = new SecondProxyquire(module)
  var originalCache = Module._cache
  var sideId = require.resolve('./fixtures/cross-copy-side')
  delete originalCache[sideId]

  global.__stacklineInnerGlobalLoad = function () {
    inner('./fixtures/cross-copy-inner', {
      './missing-inner': { '@global': true, '@noCallThru': true }
    })
  }

  try {
    var result = outer('./fixtures/cross-copy-outer', {
      './missing-outer': { '@global': true, '@noCallThru': true }
    })
    assert.equal(result.survived, true)
    assert.equal(Module._cache, originalCache)
    assert.equal(originalCache[sideId], undefined)
  } finally {
    delete global.__stacklineInnerGlobalLoad
    if (previousConstructor) require.cache[constructorId] = previousConstructor
    else delete require.cache[constructorId]
    delete originalCache[sideId]
  }
})

test('a hostile native-cache getter cannot make the cache swap partial', function () {
  var proxyquire = require('..')
  var cache = Module._cache
  var poisonedId = path.join(__dirname, 'poisoned-cache.stackline.node')
  Object.defineProperty(cache, poisonedId, {
    configurable: true,
    enumerable: true,
    get: function () { throw new Error('poisoned native cache entry') }
  })

  try {
    assert.throws(function () { proxyquire._disableGlobalCache() }, /poisoned native cache entry/)
    assert.equal(Module._cache, cache)
  } finally {
    delete cache[poisonedId]
    Module._cache = cache
  }
})

test('extension handlers and cache are restored after the target throws', function () {
  var handler = require.extensions['.js']
  var targetId = require.resolve('./fixtures/throws')
  assert.throws(function () { require('..')('./fixtures/throws', {}) }, /fixture exploded/)
  assert.equal(require.extensions['.js'], handler)
  assert.equal(require.cache[targetId], undefined)
})

test('immutable parent child bookkeeping cannot block teardown', function () {
  var project = path.resolve(__dirname, '..')
  var fixture = path.join(__dirname, 'fixtures', 'freeze-parent.js')
  var source = [
    "const Module = require('module')",
    'const project = ' + JSON.stringify(project),
    'const fixture = ' + JSON.stringify(fixture),
    "const original = require.extensions['.js']",
    "const proxyquire = require(project).createProxyquire(require('path').join(project, 'test', 'frozen-runner.cjs'))",
    'let value, error',
    'try { value = proxyquire(fixture, {}) } catch (caught) { error = caught.name + ":" + caught.message }',
    "process.stdout.write(JSON.stringify({ value, error, handlerRestored: require.extensions['.js'] === original, cached: Boolean(Module._cache[fixture]) }))"
  ].join(';')
  var execution = childProcess.spawnSync(process.execPath, ['-e', source], { encoding: 'utf8' })
  assert.equal(execution.status, 0, execution.stderr)
  assert.deepEqual(JSON.parse(execution.stdout), {
    value: 'loaded-with-frozen-parent-children',
    handlerRestored: true,
    cached: false
  })
})
