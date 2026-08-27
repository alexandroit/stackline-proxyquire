import { strict as assert } from 'assert'
import proxyquire, { createProxyquire, from } from '../index.mjs'

assert.equal(typeof proxyquire, 'function')
assert.equal(createProxyquire, proxyquire.createProxyquire)
assert.equal(from, proxyquire.from)

assert.throws(() => {
  proxyquire('./fixtures/subject', {})
}, /imported without a CommonJS parent/)

const anchored = createProxyquire(import.meta.url)
const subject = anchored('./fixtures/subject', {
  './dependency': { label: 'esm-anchor', '@noCallThru': true }
})
assert.equal(subject.dependency.label, 'esm-anchor')
assert.equal(typeof anchored.load, 'function')
assert.equal(typeof anchored.noCallThru, 'function')
assert.equal(anchored.createProxyquire, undefined)
assert.equal(anchored.compat, undefined)

const fromUrl = from(new URL(import.meta.url))
assert.equal(fromUrl('./fixtures/subject', {
  './dependency': { label: 'url-object', '@noCallThru': true }
}).dependency.label, 'url-object')

console.log('ESM bridge and caller-bound CommonJS injection checks passed.')
