# @stackline/proxyquire

[![npm version](https://img.shields.io/npm/v/@stackline/proxyquire.svg)](https://www.npmjs.com/package/@stackline/proxyquire)
[![CI](https://github.com/alexandroit/stackline-proxyquire/actions/workflows/ci.yml/badge.svg)](https://github.com/alexandroit/stackline-proxyquire/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/@stackline/proxyquire.svg)](./LICENSE)

Compatibility-first dependency stubbing for CommonJS tests. It preserves the
established `proxyquire@2.1.3` API while adding a caller-anchored factory for
tests authored as native ES modules or TypeScript, first-party declarations,
safer loader restoration, and a reduced, exact-pinned resolution dependency
graph.

## Install

```bash
npm install --save-dev @stackline/proxyquire
```

Keep an existing `require('proxyquire')` unchanged with an npm alias:

```bash
npm install --save-dev proxyquire@npm:@stackline/proxyquire
```

## CommonJS usage

Given a CommonJS subject:

```js
// notifications.js
const mailer = require('./mailer')

exports.welcome = (address) => mailer.send(address, 'Welcome')
```

replace its dependency only while loading the subject:

```js
const assert = require('assert').strict
const proxyquire = require('@stackline/proxyquire')

const notifications = proxyquire('./notifications', {
  './mailer': {
    send: (address, subject) => ({ address, subject })
  }
})

assert.deepEqual(notifications.welcome('dev@example.test'), {
  address: 'dev@example.test',
  subject: 'Welcome'
})
```

Stub keys match the request strings used by the subject. Relative subjects are
resolved from the test module that created the Proxyquire instance.

## Native ESM and TypeScript test files

An ES module has no CommonJS `module.parent`. Anchor resolution explicitly:

```js
import { createProxyquire } from '@stackline/proxyquire'

const proxyquire = createProxyquire(import.meta.url)
const notifications = proxyquire('./notifications.cjs', {
  './mailer.cjs': { send: () => 'stubbed' }
})
```

`createProxyquire(import.meta.url)` lets an ESM or native-TypeScript test load
and stub a **CommonJS** subject relative to that test. The factory accepts the
same absolute path or `file:` URL anchors as `module.createRequire()`, and each
call has independent call-through and cache settings.

It does not intercept static or dynamic imports inside a native ESM module.
Use an ESM-aware test loader for native ESM dependency replacement.

## API

### `proxyquire(request, stubs)` / `proxyquire.load(request, stubs)`

Loads a fresh CommonJS subject while replacing the requested dependencies.
The callable form and `.load` are equivalent.

### `createProxyquire(from)`

Returns a caller-anchored Proxyquire function with the same callable API and
configuration methods. Pass an absolute filename or a `file:` URL, normally
`import.meta.url` from an ESM or native-TypeScript test module. A CommonJS
module object is also accepted for tooling integrations. `proxyquire.from()` is
an alias of this factory.

### Call-through controls

Missing properties call through to the original dependency by default.

```js
const strictProxyquire = proxyquire.noCallThru()
strictProxyquire('./subject', {
  './dependency': { method: () => 'stubbed' }
})

proxyquire.callThru()
```

Set `stub['@noCallThru']` to `true` or `false` to override the instance setting
for one dependency. A `null` stub simulates `MODULE_NOT_FOUND`. Functions,
arrays, primitives, and other non-object exports remain supported.

### Cache controls

- `preserveCache()` is the default. Proxyquire restores the cache entry that
  existed before each load; the proxyquired result does not replace it.
- `noPreserveCache()` leaves the subject and explicitly resolved stub modules
  evicted after a load so a later request executes them again.

These controls do not recursively evict unrelated, unstubbed transitive
dependencies. See the [compatibility contract](./COMPATIBILITY_CONTRACT.md) for
the exact boundary.

### Global controls

`@global` applies a stub through the CommonJS graph during initialization.
`@runtimeGlobal` also applies it to later runtime `require()` calls. Both modes
bypass more of Node's cache and may re-run module initialization; prefer direct
stubs whenever possible.

### Historical compatibility method

`compat()` remains present and throws the upstream message explaining that the
removed Proxyquire 0.3 compatibility mode requires an older pinned release.

## Compatibility

- callable CommonJS export and `.load`
- call-through, cache, local/global/runtime-global, and missing-module controls
- caller-relative subject and stub resolution
- ESM/native-TypeScript host facade for CommonJS subjects
- TypeScript 3.9 and current TypeScript
- Node.js 12 through 24
- one exact-pinned direct runtime dependency (`resolve@1.22.12`), seven external
  production package nodes in total, and a clean production audit

See the [migration guide](./MIGRATION.md) and full
[compatibility contract](./COMPATIBILITY_CONTRACT.md). Interactive documentation
is available at [alexandro.net](https://alexandro.net/docs/vanilla/proxyquire/).

Dependency and release choices are recorded in
[DEPENDENCY_DECISIONS.md](./DEPENDENCY_DECISIONS.md) and
[PUBLISHING.md](./PUBLISHING.md).

## Security

Proxyquire temporarily changes process-wide CommonJS cache and extension state.
Use it only with trusted test code and stubs; it is not a sandbox or an access
control. Report vulnerabilities privately as described in
[SECURITY.md](./SECURITY.md).

## License and attribution

MIT. Thorsten Lorenz's original copyright and license are preserved in
[LICENSE](./LICENSE). This independent continuation is not affiliated with or
endorsed by the original maintainer. See [NOTICE](./NOTICE) and
[THIRD_PARTY_LICENSES.md](./THIRD_PARTY_LICENSES.md).
