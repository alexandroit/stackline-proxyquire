'use strict'

var assert = require('node:assert/strict')
var test = require('node:test')

function freshProxyquire () {
  return require('..')
}

test('preserves the callable CommonJS API and chainable controls', function () {
  var proxyquire = freshProxyquire()
  assert.equal(typeof proxyquire, 'function')
  assert.equal(proxyquire.load, proxyquire.load)
  assert.equal(proxyquire.callThru(), proxyquire)
  assert.equal(proxyquire.noCallThru(), proxyquire)
  assert.equal(proxyquire.preserveCache(), proxyquire)
  assert.equal(proxyquire.noPreserveCache(), proxyquire)
  assert.equal(proxyquire.from, proxyquire.createProxyquire)
  assert.throws(proxyquire.compat, /compat mode has been removed/)
  assert.deepEqual(Object.keys(proxyquire).sort(), [
    '_disableCache',
    '_disableGlobalCache',
    '_disableModuleCache',
    '_overrideExtensionHandlers',
    '_require',
    '_resolveModule',
    '_withoutCache',
    'callThru',
    'compat',
    'createProxyquire',
    'from',
    'load',
    'noCallThru',
    'noPreserveCache',
    'preserveCache'
  ])
  assert.equal(proxyquire._require.length, 3)
  assert.equal(proxyquire._withoutCache.length, 4)
  assert.equal(proxyquire._disableCache.length, 2)
  assert.equal(proxyquire._overrideExtensionHandlers.length, 2)
})

test('copies missing own descriptors during call-through', function () {
  var stub = { label: 'stubbed' }
  var subject = freshProxyquire()('./fixtures/subject', { './dependency': stub })

  assert.equal(subject.dependency, stub)
  assert.deepEqual(subject.describe(), {
    label: 'stubbed',
    hidden: 'hidden-real',
    sum: 5
  })
  assert.equal(Object.prototype.propertyIsEnumerable.call(stub, 'hidden'), false)
  assert.equal(typeof Object.getOwnPropertyDescriptor(stub, 'hidden').get, 'function')
})

test('copies static and prototype descriptors onto function stubs', function () {
  function StubDependency (name) { this.name = 'stub-' + name }
  var subject = freshProxyquire()('./fixtures/function-subject', {
    './function-dependency': StubDependency
  })

  assert.equal(subject.Dependency, StubDependency)
  assert.equal(StubDependency.kind, 'real-constructor')
  assert.equal(subject.make('case').greet(), 'hello stub-case')
})

test('copies function statics without assuming the stub has a prototype object', function () {
  function PrototypeFreeStub () {}
  PrototypeFreeStub.prototype = null

  var subject = freshProxyquire()('./fixtures/function-subject', {
    './function-dependency': PrototypeFreeStub
  })
  assert.equal(subject.Dependency, PrototypeFreeStub)
  assert.equal(PrototypeFreeStub.kind, 'real-constructor')
  assert.equal(PrototypeFreeStub.prototype, null)
})

test('treats every non-null primitive as a terminal replacement', function () {
  ;[false, true, 0, 1, '', 'stub'].forEach(function (stub) {
    var subject = freshProxyquire()('./fixtures/primitive-subject', {
      './primitive-number': stub,
      './primitive-object': stub
    })
    assert.equal(subject.number, stub)
    assert.equal(subject.object, stub)
  })

  if (typeof Symbol === 'function') {
    var symbol = Symbol('stub')
    assert.equal(freshProxyquire()('./fixtures/primitive-subject', {
      './primitive-object': symbol
    }).object, symbol)
  }

  if (typeof BigInt === 'function') {
    var bigint = BigInt(1)
    assert.equal(freshProxyquire()('./fixtures/primitive-subject', {
      './primitive-object': bigint
    }).object, bigint)
  }
})

test('keeps null and undefined stub error behavior explicit', function () {
  assert.throws(function () {
    freshProxyquire()('./fixtures/subject', { './dependency': null })
  }, function (error) {
    return error.code === 'MODULE_NOT_FOUND' && /\.\/dependency/.test(error.message)
  })

  assert.throws(function () {
    freshProxyquire()('./fixtures/subject', { './dependency': undefined })
  }, /Invalid stub: "\.\/dependency" cannot be undefined/)
})

test('uses own stub keys and safely supports the __proto__ module name', function () {
  var inherited = Object.create({ './dependency': { label: 'inherited' } })
  var ordinary = freshProxyquire()('./fixtures/subject', inherited)
  assert.equal(ordinary.dependency.label, 'real')

  var stubs = Object.create(null)
  stubs.__proto__ = { marker: 'plain-data', '@noCallThru': true }
  assert.equal(freshProxyquire()('./fixtures/prototype-subject', stubs).marker, 'plain-data')
})

test('supports caller-bound factories and rejects ambiguous relative anchors', function () {
  var proxyquire = freshProxyquire()
  var fromFilename = proxyquire.createProxyquire(__filename)
  assert.equal(fromFilename('./fixtures/subject', {
    './dependency': { label: 'factory', '@noCallThru': true }
  }).dependency.label, 'factory')

  var fromDirectory = proxyquire.from(__dirname + require('node:path').sep)
  assert.equal(fromDirectory('./fixtures/subject', {
    './dependency': { label: 'directory', '@noCallThru': true }
  }).dependency.label, 'directory')

  var fromModule = proxyquire.createProxyquire(module)
  assert.equal(fromModule('./fixtures/subject', {
    './dependency': { label: 'module-object', '@noCallThru': true }
  }).dependency.label, 'module-object')

  var fileUrl = require('node:url').pathToFileURL(__filename)
  assert.equal(proxyquire.from(fileUrl)('./fixtures/subject', {
    './dependency': { label: 'url-object', '@noCallThru': true }
  }).dependency.label, 'url-object')
  assert.equal(proxyquire.from(fileUrl.href)('./fixtures/subject', {
    './dependency': { label: 'url-string', '@noCallThru': true }
  }).dependency.label, 'url-string')
  assert.equal(proxyquire.from({ href: fileUrl.href })('./fixtures/subject', {
    './dependency': { label: 'structural-url', '@noCallThru': true }
  }).dependency.label, 'structural-url')
  assert.equal(proxyquire.from(fileUrl.href.replace(/^file:/, 'FILE:'))('./fixtures/subject', {
    './dependency': { label: 'case-insensitive-url', '@noCallThru': true }
  }).dependency.label, 'case-insensitive-url')

  assert.throws(function () { proxyquire.createProxyquire('relative.js') }, /absolute filename or file URL/)
  assert.throws(function () { proxyquire.createProxyquire('https://example.test/a.js') }, /absolute filename or file URL/)
  assert.throws(function () { proxyquire.createProxyquire(null) }, /CommonJS module, filename, or file URL/)
})

test('keeps legacy internal resolver calls compatible with resolved stub maps', function () {
  var path = require('node:path')
  var proxyquire = freshProxyquire().noCallThru()
  var base = require.resolve('./fixtures/subject')
  var request = './not-installed'
  var resolved = path.resolve(path.dirname(base), request)
  var stubs = Object.create(null)
  stubs[resolved] = {}

  assert.equal(proxyquire._resolveModule(base, request, stubs), resolved)
  assert.equal(proxyquire._disableCache.length, 2)
})

test('retains the deep ProxyquireError constructor and default message', function () {
  var ProxyquireError = require('../lib/proxyquire-error')
  var error = new ProxyquireError()
  assert.equal(error.name, 'ProxyquireError')
  assert.equal(error.message, 'An error occurred inside proxyquire.')
  assert.equal(error instanceof Error, true)
})

test('allows an inner proxyquire load to override an outer shadow', function () {
  var result = freshProxyquire()('./fixtures/nested-entry', {
    './nested-inner': 'outer-shadow'
  })
  assert.equal(result, 'inner-stub')
})

test('composes nested loads across separately installed package copies', function () {
  var fs = require('node:fs')
  var os = require('node:os')
  var path = require('node:path')
  var temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'stackline-proxyquire-copy-'))
  var copy = path.join(temporary, 'package-copy')

  try {
    fs.mkdirSync(path.join(copy, 'lib'), { recursive: true })
    fs.copyFileSync(require.resolve('../index.js'), path.join(copy, 'index.js'))
    for (var file of ['is.js', 'proxyquire-error.js', 'proxyquire.js', 'request-resolver.js']) {
      fs.copyFileSync(path.join(__dirname, '..', 'lib', file), path.join(copy, 'lib', file))
    }
    fs.writeFileSync(path.join(temporary, 'nested-dependency.cjs'), "module.exports = { value: 'real-copy' }\n")
    fs.writeFileSync(path.join(temporary, 'nested-inner.cjs'), "module.exports = require('./nested-dependency.cjs').value\n")
    fs.writeFileSync(path.join(temporary, 'nested-entry.cjs'), [
      'var proxyquire = require(' + JSON.stringify(path.join(copy, 'index.js')) + ')',
      "module.exports = proxyquire('./nested-inner.cjs', {",
      "  './nested-dependency.cjs': { value: 'inner-copy' }",
      '})'
    ].join('\n'))

    var result = freshProxyquire()(path.join(temporary, 'nested-entry.cjs'), {
      './nested-inner.cjs': 'outer-shadow'
    })
    assert.equal(result, 'inner-copy')
  } finally {
    fs.rmSync(temporary, { force: true, recursive: true })
  }
})

test('preserves a require extension handler installed by the loaded module', function () {
  var original = require.extensions['.js']
  try {
    var installed = freshProxyquire()('./fixtures/handler-install', {
      './dependency': { label: 'stale-wrapper', '@noCallThru': true }
    })
    assert.equal(require.extensions['.js'], installed)

    delete require.cache[require.resolve('./fixtures/subject')]
    delete require.cache[require.resolve('./fixtures/dependency')]
    assert.equal(require('./fixtures/subject').dependency.label, 'real')
  } finally {
    require.extensions['.js'] = original
  }
})

test('restores an owned extension wrapper whose descriptor was locked', function () {
  var descriptor = Object.getOwnPropertyDescriptor(require.extensions, '.js')
  var handler = require.extensions['.js']
  try {
    assert.equal(freshProxyquire()('./fixtures/handler-lock', {}), 'loaded-with-locked-handler')
    assert.equal(require.extensions['.js'], handler)
    assert.deepEqual(Object.getOwnPropertyDescriptor(require.extensions, '.js'), descriptor)
  } finally {
    Object.defineProperty(require.extensions, '.js', descriptor)
  }
})

test('rolls back partially installed extension wrappers', function () {
  var original = require.extensions['.js']
  Object.defineProperty(require.extensions, '.zz-stackline-blocked', {
    configurable: true,
    enumerable: true,
    value: function () {},
    writable: false
  })

  try {
    assert.throws(function () {
      freshProxyquire()('./fixtures/subject', {})
    }, TypeError)
    assert.equal(require.extensions['.js'], original)
  } finally {
    delete require.extensions['.zz-stackline-blocked']
  }
})

test('restores an enumerable __proto__ extension key as ordinary data', function () {
  var handler = function () {}
  Object.defineProperty(require.extensions, '__proto__', {
    configurable: true,
    enumerable: true,
    value: handler,
    writable: true
  })

  try {
    freshProxyquire()('./fixtures/subject', {})
    assert.equal(Object.getOwnPropertyDescriptor(require.extensions, '__proto__').value, handler)
  } finally {
    delete require.extensions.__proto__
  }
})

test('ships without production dependencies', function () {
  var manifest = require('../package.json')
  assert.equal(manifest.name, '@stackline/proxyquire')
  assert.deepEqual(manifest.dependencies, {})
  assert.equal(manifest.optionalDependencies, undefined)
  assert.equal(manifest.peerDependencies, undefined)
})
