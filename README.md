# @stackline/proxyquire

> Compatibility-first CommonJS dependency injection with bounded cache cleanup, caller anchoring, and first-party types.

[![npm version](https://img.shields.io/npm/v/@stackline/proxyquire.svg?style=flat-square)](https://www.npmjs.com/package/@stackline/proxyquire)
[![license](https://img.shields.io/npm/l/@stackline/proxyquire.svg?style=flat-square)](https://github.com/alexandroit/stackline-proxyquire)
[![GitHub repository](https://img.shields.io/badge/GitHub-alexandroit%2Fstackline-proxyquire-181717?style=flat-square&logo=github)](https://github.com/alexandroit/stackline-proxyquire)
[![Docs](https://img.shields.io/badge/docs-alexandro.net-0f766e?style=flat-square)](https://alexandro.net/docs/vanilla/proxyquire/)
[![Reddit community](https://img.shields.io/badge/community-r%2FStackline-ff4500?style=flat-square&logo=reddit&logoColor=white)](https://www.reddit.com/r/Stackline/)

**[Documentation](https://alexandro.net/docs/vanilla/proxyquire/)** | **[npm](https://www.npmjs.com/package/@stackline/proxyquire)** | **[Issues](https://github.com/alexandroit/stackline-proxyquire/issues)** | **[Repository](https://github.com/alexandroit/stackline-proxyquire)**

**Current package version:** `1.0.4`

---

## Why this package?

Compatibility-first dependency stubbing for CommonJS tests. It preserves the
established `proxyquire@2.1.3` API while adding a caller-anchored factory for
tests authored as native ES modules or TypeScript, first-party declarations,
safer loader restoration, and a dependency-free runtime.

## Compatibility

| Item | Value |
| --- | --- |
| Package | `@stackline/proxyquire@1.0.4` |
| Node.js runtime | `>=12` |
| CommonJS / primary entry | `./index.js` |
| ES module entry | `./index.mjs` |
| Type declarations | `./index.d.ts` |

- callable CommonJS export and `.load`
- call-through, cache, local/global/runtime-global, and missing-module controls
- caller-relative subject and stub resolution
- ESM/native-TypeScript host facade for CommonJS subjects
- TypeScript 3.9 and current TypeScript
- Node.js 12 through 24
- zero production, optional, and peer dependencies
- warning-free direct and historical-alias installs with a valid npm tree and
  zero production audit findings

See the [migration guide](https://github.com/alexandroit/stackline-proxyquire/blob/main/MIGRATION.md) and full
[compatibility contract](https://github.com/alexandroit/stackline-proxyquire/blob/main/COMPATIBILITY_CONTRACT.md). Interactive documentation
is available at [alexandro.net](https://alexandro.net/docs/vanilla/proxyquire/).

Dependency and release choices are recorded in
[DEPENDENCY_DECISIONS.md](https://github.com/alexandroit/stackline-proxyquire/blob/main/DEPENDENCY_DECISIONS.md) and
[PUBLISHING.md](https://github.com/alexandroit/stackline-proxyquire/blob/main/PUBLISHING.md).

## Installation

<a id="install"></a>

### Install

```bash
npm install --save-dev @stackline/proxyquire
```

Keep an existing `require('proxyquire')` unchanged with an npm alias:

```bash
npm install --save-dev proxyquire@npm:@stackline/proxyquire
```

## Usage

<a id="commonjs-usage"></a>

### CommonJS usage

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

## Features and Integrations

<a id="native-esm-and-typescript-test-files"></a>

### Native ESM and TypeScript test files

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

## Security

Proxyquire temporarily changes process-wide CommonJS cache and extension state.
Use it only with trusted test code and stubs; it is not a sandbox or an access
control. Report vulnerabilities privately as described in
[SECURITY.md](https://github.com/alexandroit/stackline-proxyquire/blob/main/SECURITY.md).

## API Surface

<a id="api"></a>

### API

#### `proxyquire(request, stubs)` / `proxyquire.load(request, stubs)`

Loads a fresh CommonJS subject while replacing the requested dependencies.
The callable form and `.load` are equivalent.

#### `createProxyquire(from)`

Returns a caller-anchored Proxyquire function with the same callable API and
configuration methods. Pass an absolute filename or a `file:` URL, normally
`import.meta.url` from an ESM or native-TypeScript test module. A CommonJS
module object is also accepted for tooling integrations. `proxyquire.from()` is
an alias of this factory.

#### Call-through controls

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

#### Cache controls

- `preserveCache()` is the default. Proxyquire restores the cache entry that
  existed before each load; the proxyquired result does not replace it.
- `noPreserveCache()` leaves the subject and explicitly resolved stub modules
  evicted after a load so a later request executes them again.

These controls do not recursively evict unrelated, unstubbed transitive
dependencies. See the [compatibility contract](https://github.com/alexandroit/stackline-proxyquire/blob/main/COMPATIBILITY_CONTRACT.md) for
the exact boundary.

#### Global controls

`@global` applies a stub through the CommonJS graph during initialization.
`@runtimeGlobal` also applies it to later runtime `require()` calls. Both modes
bypass more of Node's cache and may re-run module initialization; prefer direct
stubs whenever possible.

#### Historical compatibility method

`compat()` remains present and throws the upstream message explaining that the
removed Proxyquire 0.3 compatibility mode requires an older pinned release.

## Local Development

```sh
git clone https://github.com/alexandroit/stackline-proxyquire.git
cd stackline-proxyquire
npm ci
npm run verify
```

Release tooling uses Node.js 24.20.0 and npm 11.19.0. The consumer runtime contract remains the one documented above.

## Consumer Smoke Test

Run the repository's existing consumer/package check after installing development dependencies:

```sh
npm run test:smoke
```

## Release Checklist

Run `npm run verify` and inspect the package contents before release. Publish a new version through the [GitHub Actions publishing workflow](https://github.com/alexandroit/stackline-proxyquire/actions/workflows/publish.yml), using the SHA-512 digest of the reviewed tarball. Verify the exact published version, tarball integrity, and npm provenance after the run.

## License

<a id="license-and-attribution"></a>

### License and attribution

MIT. Thorsten Lorenz's original copyright and license are preserved in
[LICENSE](https://github.com/alexandroit/stackline-proxyquire/blob/main/LICENSE). This independent continuation is not affiliated with or
endorsed by the original maintainer. See [NOTICE](https://github.com/alexandroit/stackline-proxyquire/blob/main/NOTICE) and
[THIRD_PARTY_LICENSES.md](https://github.com/alexandroit/stackline-proxyquire/blob/main/THIRD_PARTY_LICENSES.md).

## Credits and original authors

- Stackline Maintainers.
- Thorsten Lorenz.
- Ben Drucker.
- Copyright 2013 Thorsten Lorenz.
- Copyright 2026 Stackline Maintainers for later modifications.
- Stackline maintenance: [Alexandro Paixao Marques](https://www.linkedin.com/in/aleinfo/) and [Stackline contributors](https://github.com/alexandroit).

Original copyright, license notices and contributor acknowledgements remain part of this distribution. Stackline maintenance does not replace authorship of the original work.

## Community and Links

- [Stackline website](https://alexandro.net/)
- [GitHub projects](https://github.com/alexandroit)
- [npm packages](https://www.npmjs.com/~alex360qc)
- [Reddit community — r/Stackline](https://www.reddit.com/r/Stackline/)
- [Maintainer LinkedIn](https://www.linkedin.com/in/aleinfo/)

Use this repository's issue tracker for reproducible bugs and feature requests. Join r/Stackline for examples, usage questions and release discussions.
