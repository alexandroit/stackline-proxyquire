'use strict'

var assert = require('assert')
var fs = require('fs')
var os = require('os')
var path = require('path')
var manifest = require('../package.json')
var proxyquire = require('..')

assert.strictEqual(manifest.name, '@stackline/proxyquire')
assert.deepStrictEqual(manifest.dependencies, { resolve: '1.22.12' })
assert.strictEqual(require('resolve/package.json').version, '1.22.12')
assert.strictEqual(typeof proxyquire, 'function')
assert.strictEqual(proxyquire.callThru(), proxyquire)

var subject = proxyquire('./fixtures/subject', {
  './dependency': { label: 'runtime-' + process.version }
})
assert.strictEqual(subject.dependency.label, 'runtime-' + process.version)
assert.strictEqual(subject.describe().sum, 5)

var anchored = proxyquire.createProxyquire(__filename)
assert.strictEqual(anchored('./fixtures/subject', {
  './dependency': { label: 'anchored', '@noCallThru': true }
}).dependency.label, 'anchored')

var indexId = require.resolve('..')
var count = function () {
  return module.children.filter(function (child) { return child.id === indexId }).length
}
var before = count()
for (var index = 0; index < 100; index++) require('..')
assert.strictEqual(count(), before)
assert.strictEqual(require.cache[indexId], undefined)

assert.throws(function () {
  proxyquire.createProxyquire(path.join('relative', 'entry.js'))
}, /absolute filename/)

var temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'stackline-proxyquire-runtime-'))
try {
  var realDirectory = path.join(temporary, 'real-directory')
  var linkDirectory = path.join(temporary, 'link-directory')
  fs.mkdirSync(realDirectory)
  fs.writeFileSync(path.join(realDirectory, 'index.js'), "module.exports = { value: 'real' }\n")
  fs.symlinkSync(realDirectory, linkDirectory, process.platform === 'win32' ? 'junction' : 'dir')

  var subjectPath = path.join(temporary, 'subject.cjs')
  fs.writeFileSync(subjectPath, [
    "exports.real = require('./real-directory').value",
    "exports.link = require('./link-directory').value",
    ''
  ].join('\n'))

  assert.deepStrictEqual(proxyquire(subjectPath, {
    './link-directory': { value: 'stub-link', '@noCallThru': true }
  }), { real: 'real', link: 'stub-link' })
} finally {
  if (typeof fs.rmSync === 'function') {
    fs.rmSync(temporary, { recursive: true, force: true })
  } else {
    fs.rmdirSync(temporary, { recursive: true })
  }
}

console.log('Runtime compatibility checks passed on ' + process.version + '.')
