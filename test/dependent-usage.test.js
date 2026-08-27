'use strict'

var assert = require('node:assert/strict')
var sinon = require('sinon')
var test = require('node:test')

test('supports Architect-style direct function and object stubs', function () {
  var logger = { info: sinon.spy() }
  var store = { get: sinon.stub().withArgs('release').returns('maintained-value') }
  var service = require('..').noCallThru()('./fixtures/dependent/service', {
    './logger': logger,
    './store': store
  })

  assert.equal(service('release'), 'maintained-value')
  sinon.assert.calledOnceWithExactly(logger.info, 'read:release')
  sinon.assert.calledOnceWithExactly(store.get, 'release')
})

test('supports partial stubs used by mature CommonJS suites', function () {
  var dependency = { label: 'partial' }
  var subject = require('..')('./fixtures/subject', { './dependency': dependency })
  assert.equal(subject.describe().label, 'partial')
  assert.equal(subject.describe().sum, 5)
  assert.equal(subject.describe().hidden, 'hidden-real')
})

test('supports constructor stubs while retaining real prototype methods', function () {
  var constructor = sinon.spy(function StubDependency (name) {
    this.name = 'observed-' + name
  })
  var subject = require('..')('./fixtures/function-subject', {
    './function-dependency': constructor
  })
  var instance = subject.make('consumer')

  sinon.assert.calledOnceWithExactly(constructor, 'consumer')
  assert.equal(instance.greet(), 'hello observed-consumer')
  assert.equal(constructor.kind, 'real-constructor')
})

test('supports transitive global stubs and deferred runtime-global loads', function () {
  var globalSubject = require('..')('./fixtures/global-root', {
    './global-leaf': { value: 'global-dependent', '@global': true }
  })
  assert.equal(globalSubject(), 'global-dependent')

  var deferred = require('..')('./fixtures/runtime-root', {
    './global-leaf': { value: 'runtime-dependent', '@runtimeGlobal': true }
  })
  assert.equal(deferred(), 'runtime-dependent')
})
