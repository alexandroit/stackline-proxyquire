# Compatibility Contract

The 1.x line preserves the observable `proxyquire@2.1.3` CommonJS contract
unless a narrow change is required to prevent loader corruption, unsafe key
handling, or retention of temporary module records.

## Preserved

- callable `proxyquire(request, stubs)` and equivalent `.load(request, stubs)`;
- a fresh load of the CommonJS subject for each Proxyquire call;
- subjects resolved from the module that created the Proxyquire instance;
- stub keys matched as the subject or its dependencies pass them to `require()`;
- call-through by default for properties omitted from object/function stubs;
- `.noCallThru()` and `.callThru()` instance controls;
- per-stub `@noCallThru` overrides;
- `.noPreserveCache()` and `.preserveCache()` controls;
- `@global` initialization-time and `@runtimeGlobal` runtime overrides;
- `null` stubs that produce a Node-shaped `MODULE_NOT_FOUND` error;
- function, array, primitive, and other non-plain-object stubs;
- errors thrown by the subject or dependency escaping synchronously and by
  identity;
- compatibility with any test or spy framework;
- `.compat()` remaining present and rejecting the removed 0.3 compatibility
  mode with the historical guidance;
- the enumerable callable-export method shape, including historical bound
  runtime methods used by advanced consumers;
- published CommonJS root, index, package metadata, and runtime deep imports.

## Cache semantics

`preserveCache()` is enabled by default. Before loading, Proxyquire temporarily
removes the subject's current cache entry. After loading, it restores exactly
the entry that existed before the call, or restores absence when none existed.
The newly proxyquired result is therefore not installed as a lasting cache
replacement, and separate Proxyquire calls are not promised to return the same
object identity.

`noPreserveCache()` leaves the subject and explicitly named, resolved stub
modules absent from the cache after the call. It does not recursively evict
unstubbed transitive dependencies. Global stubs temporarily bypass the broader
CommonJS cache so the transitive request can be observed; module initialization
may consequently run again.

## Additive

- `createProxyquire(from)` anchors an independent instance to an ESM or
  native-TypeScript test module using an absolute filename or `file:` URL;
- `.from(from)` is an alias of `createProxyquire(from)`;
- default and named ESM package entry points for configuring CommonJS loads;
- first-party declarations compatible with TypeScript 3.9 and current versions;
- explicit package exports and npm-alias installation.

## Resolution dependency boundary

`resolve@1.22.12` is retained and exact-pinned. Its request-oriented resolution
keeps distinct symlink paths and package-export aliases independently stubbable,
matching `proxyquire@2.1.3`. Replacing it with Node's canonical native resolver
would collapse those request identities and change which dependency a stub
intercepts. The maintained package has no optional or peer dependencies.

## Intentional corrections

- An unanchored ESM use fails with guidance to call `createProxyquire()` instead
  of crashing while reading an undefined CommonJS parent.
- Temporary loads detach only the exact transient module records they added to
  the caller's `children` collection. Existing and unrelated children remain.
- Extension handlers are restored only when the Stackline wrapper is still the
  active handler; a later loader is never overwritten.
- `@global` and `@runtimeGlobal` state is scoped to the active load and restored
  safely across nested calls instead of leaking into later ordinary loads.
- Stub lookup and special-property checks use own keys and prototype-safe maps.

## Outside the contract

- interception of native ESM static or dynamic imports;
- browser module mocking;
- recursive eviction of every transitive dependency;
- cross-process, worker, or VM-context mocking;
- asynchronous mocking or an experimental Node loader;
- sandboxing, code trust, or authorization boundaries.
