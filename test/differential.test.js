'use strict'

var assert = require('node:assert/strict')
var childProcess = require('node:child_process')
var fs = require('node:fs')
var os = require('node:os')
var path = require('node:path')
var test = require('node:test')

function run (packageRequest) {
  var result = childProcess.spawnSync(process.execPath, [
    path.join(__dirname, 'differential-runner.js'),
    packageRequest
  ], {
    cwd: __dirname,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024
  })
  assert.equal(result.status, 0, result.stderr)
  return JSON.parse(result.stdout)
}

test('matches proxyquire 2.1.3 across 128 representative loads', function () {
  var maintained = run(path.resolve(__dirname, '..'))
  var upstream = run('proxyquire-upstream')
  assert.equal(maintained.length, 132)
  assert.deepEqual(maintained, upstream)
})

test('keeps symlink and package-export alias stub identities distinct', function () {
  var temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'stackline-proxyquire-resolve-'))
  var realDirectory = path.join(temporary, 'real-directory')
  var linkDirectory = path.join(temporary, 'link-directory')
  var packageDirectory = path.join(temporary, 'node_modules', 'stackline-export-alias-fixture')
  var symlinkSubject = path.join(temporary, 'symlink-subject.cjs')
  var exportsSubject = path.join(temporary, 'exports-subject.cjs')

  try {
    fs.mkdirSync(realDirectory, { recursive: true })
    fs.mkdirSync(packageDirectory, { recursive: true })
    fs.writeFileSync(path.join(realDirectory, 'index.js'), "module.exports = { value: 'real' }\n")
    fs.symlinkSync(realDirectory, linkDirectory, process.platform === 'win32' ? 'junction' : 'dir')
    fs.writeFileSync(symlinkSubject, [
      "exports.real = require('./real-directory').value",
      "exports.link = require('./link-directory').value",
      ''
    ].join('\n'))

    fs.writeFileSync(path.join(packageDirectory, 'package.json'), JSON.stringify({
      name: 'stackline-export-alias-fixture',
      version: '1.0.0',
      main: './legacy.cjs',
      exports: {
        './a': './shared.cjs',
        './b': './shared.cjs'
      }
    }))
    fs.writeFileSync(path.join(packageDirectory, 'legacy.cjs'), "module.exports = { value: 'legacy' }\n")
    fs.writeFileSync(path.join(packageDirectory, 'shared.cjs'), "module.exports = { value: 'shared' }\n")
    fs.writeFileSync(exportsSubject, [
      "exports.a = require('stackline-export-alias-fixture/a').value",
      "exports.b = require('stackline-export-alias-fixture/b').value",
      ''
    ].join('\n'))

    var maintained = exerciseRequestIdentities(require('..'), symlinkSubject, exportsSubject)
    var upstream = exerciseRequestIdentities(require('proxyquire-upstream'), symlinkSubject, exportsSubject)

    assert.deepEqual(maintained, {
      symlinkSingle: { real: 'real', link: 'stub-link' },
      symlinkDual: { real: 'stub-real', link: 'stub-link' },
      exportsSingle: { a: 'stub-a', b: 'shared' },
      exportsDual: { a: 'stub-a', b: 'stub-b' }
    })
    assert.deepEqual(maintained, upstream)
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true })
  }
})

function exerciseRequestIdentities (proxyquire, symlinkSubject, exportsSubject) {
  proxyquire.callThru().preserveCache()

  return {
    symlinkSingle: proxyquire(symlinkSubject, {
      './link-directory': { value: 'stub-link', '@noCallThru': true }
    }),
    symlinkDual: proxyquire(symlinkSubject, {
      './real-directory': { value: 'stub-real', '@noCallThru': true },
      './link-directory': { value: 'stub-link', '@noCallThru': true }
    }),
    exportsSingle: proxyquire(exportsSubject, {
      'stackline-export-alias-fixture/a': { value: 'stub-a', '@noCallThru': true }
    }),
    exportsDual: proxyquire(exportsSubject, {
      'stackline-export-alias-fixture/a': { value: 'stub-a', '@noCallThru': true },
      'stackline-export-alias-fixture/b': { value: 'stub-b', '@noCallThru': true }
    })
  }
}
