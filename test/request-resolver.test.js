'use strict'

var assert = require('node:assert/strict')
var fs = require('node:fs')
var os = require('node:os')
var path = require('node:path')
var test = require('node:test')
var resolveRequest = require('../lib/request-resolver')

var extensions = ['.js', '.json', '.node']

test('resolves built-ins, files, extensions, directory indexes, and package main', function () {
  var temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'stackline-request-resolver-'))
  var base = path.join(temporary, 'subject.cjs')
  try {
    fs.writeFileSync(base, '')
    fs.writeFileSync(path.join(temporary, 'plain.js'), 'module.exports = true\n')
    fs.mkdirSync(path.join(temporary, 'indexed'))
    fs.writeFileSync(path.join(temporary, 'indexed', 'index.json'), '{}\n')
    fs.mkdirSync(path.join(temporary, 'main-package'))
    fs.mkdirSync(path.join(temporary, 'main-package', 'src'))
    fs.writeFileSync(path.join(temporary, 'main-package', 'package.json'), '{"main":"src/entry"}\n')
    fs.writeFileSync(path.join(temporary, 'main-package', 'src', 'entry.js'), 'module.exports = true\n')

    assert.equal(resolveRequest(base, 'fs', extensions, []), 'fs')
    assert.equal(resolveRequest(base, 'node:path', extensions, []), 'node:path')
    assert.equal(resolveRequest(base, './plain', extensions, []), path.join(temporary, 'plain.js'))
    assert.equal(resolveRequest(base, './indexed', extensions, []), path.join(temporary, 'indexed', 'index.json'))
    assert.equal(resolveRequest(base, './main-package', extensions, []), path.join(temporary, 'main-package', 'src', 'entry.js'))
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true })
  }
})

test('resolves nearest, deep, scoped, and explicit global packages lexically', function () {
  var temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'stackline-request-packages-'))
  var project = path.join(temporary, 'project')
  var nested = path.join(project, 'src', 'nested')
  var modules = path.join(project, 'node_modules')
  var globalModules = path.join(temporary, 'global-modules')
  var base = path.join(nested, 'subject.cjs')
  try {
    fs.mkdirSync(nested, { recursive: true })
    fs.mkdirSync(path.join(modules, 'plain-package', 'lib'), { recursive: true })
    fs.mkdirSync(path.join(modules, '@scope', 'scoped-package'), { recursive: true })
    fs.mkdirSync(path.join(globalModules, 'global-package'), { recursive: true })
    fs.writeFileSync(base, '')
    fs.writeFileSync(path.join(modules, 'plain-package', 'package.json'), '{"main":"lib/start"}\n')
    fs.writeFileSync(path.join(modules, 'plain-package', 'lib', 'start.js'), '')
    fs.writeFileSync(path.join(modules, 'plain-package', 'lib', 'deep.js'), '')
    fs.writeFileSync(path.join(modules, '@scope', 'scoped-package', 'index.js'), '')
    fs.writeFileSync(path.join(globalModules, 'global-package', 'index.js'), '')

    assert.equal(resolveRequest(base, 'plain-package', extensions, []), path.join(modules, 'plain-package', 'lib', 'start.js'))
    assert.equal(resolveRequest(base, 'plain-package/lib/deep', extensions, []), path.join(modules, 'plain-package', 'lib', 'deep.js'))
    assert.equal(resolveRequest(base, '@scope/scoped-package', extensions, []), path.join(modules, '@scope', 'scoped-package', 'index.js'))
    assert.equal(resolveRequest(base, 'global-package', extensions, [globalModules]), path.join(globalModules, 'global-package', 'index.js'))
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true })
  }
})

test('preserves symlink spelling and does not canonicalize export aliases', function () {
  var temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'stackline-request-identity-'))
  var real = path.join(temporary, 'real')
  var link = path.join(temporary, 'link')
  var packageDirectory = path.join(temporary, 'node_modules', 'export-only')
  var base = path.join(temporary, 'subject.cjs')
  try {
    fs.mkdirSync(real)
    fs.writeFileSync(path.join(real, 'index.js'), '')
    fs.symlinkSync(real, link, process.platform === 'win32' ? 'junction' : 'dir')
    fs.mkdirSync(packageDirectory, { recursive: true })
    fs.writeFileSync(path.join(packageDirectory, 'package.json'), JSON.stringify({
      name: 'export-only',
      exports: { './a': './shared.js' }
    }))
    fs.writeFileSync(path.join(packageDirectory, 'shared.js'), '')
    fs.writeFileSync(base, '')

    assert.equal(resolveRequest(base, './link', extensions, []), path.join(link, 'index.js'))
    assert.throws(function () {
      resolveRequest(base, 'export-only/a', extensions, [])
    }, function (error) {
      return error && error.code === 'MODULE_NOT_FOUND'
    })
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true })
  }
})

test('falls back from malformed package metadata and reports unresolved requests', function () {
  var temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'stackline-request-errors-'))
  var directory = path.join(temporary, 'directory')
  var base = path.join(temporary, 'subject.cjs')
  try {
    fs.mkdirSync(directory)
    fs.writeFileSync(path.join(directory, 'package.json'), '{not-json')
    fs.writeFileSync(path.join(directory, 'index.js'), '')
    fs.writeFileSync(base, '')

    assert.equal(resolveRequest(base, './directory', extensions, []), path.join(directory, 'index.js'))
    assert.throws(function () {
      resolveRequest(base, './missing', extensions, [])
    }, function (error) {
      return error && error.code === 'MODULE_NOT_FOUND' && /missing/.test(error.message)
    })
    assert.throws(function () {
      resolveRequest(base, 'node:not-a-real-builtin', extensions, [])
    }, function (error) {
      return error && error.code === 'MODULE_NOT_FOUND'
    })
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true })
  }
})
