# Migration

## Keep CommonJS source unchanged

Install the Stackline package under the historical dependency name:

```bash
npm install --save-dev proxyquire@npm:@stackline/proxyquire
```

```json
{
  "devDependencies": {
    "proxyquire": "npm:@stackline/proxyquire@^1.0.2"
  }
}
```

Existing calls remain unchanged:

```js
const proxyquire = require('proxyquire')
const subject = proxyquire('./subject', { './dependency': stub })
```

## Use the scoped name directly

```bash
npm install --save-dev @stackline/proxyquire
```

```js
const proxyquire = require('@stackline/proxyquire')
```

## ESM and native-TypeScript tests

Do not rely on a CommonJS package finding `module.parent` when it was imported
by an ES module. Create an explicitly anchored instance:

```js
import { createProxyquire } from '@stackline/proxyquire'

const proxyquire = createProxyquire(import.meta.url)
const subject = proxyquire('./subject.cjs', {
  './dependency.cjs': { value: 'stubbed' }
})
```

The host test may be ESM or native TypeScript, but the subject and intercepted
dependencies must load through CommonJS `require()`. Proxyquire cannot replace
native ESM imports. Keep an ESM-specific mocking tool for an ESM subject.

## Cache behavior

The default `preserveCache()` mode restores whatever subject cache entry
existed before each call; it does not retain the newly proxyquired result as the
ordinary `require()` result. `noPreserveCache()` evicts the subject and explicit
stub modules after loading, but does not recursively clear unstubbed transitive
dependencies.

Review tests that depended on broader cache clearing or on the old README's
identity example. The maintained implementation preserves observed 2.1.3
behavior rather than that inaccurate example.

## Types

First-party declarations ship with the package. Projects using
`@types/proxyquire` can remove it after confirming their compiler and import
style against the included TypeScript 3.9/current compatibility tests.
