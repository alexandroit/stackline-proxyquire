---
schema: stackline-package-project-memory-v1
project: 13
package: proxyquire
target: "@stackline/proxyquire"
state: BUILDING
decision: GO
last_updated: 2026-08-27
---

# Project 13 Memory

The project passed the current research gate on 2026-08-27. It preserves the
widely used `proxyquire@2.1.3` CommonJS testing contract while addressing
caller anchoring, transient module retention, loader composition, global-state
leakage, type ownership, dependencies, and release engineering.

## Research evidence

- latest upstream npm release: 2019-08-12;
- measured npm downloads: 1,155,963 in the latest complete week, 5,071,710 in
  the measured 30-day window, and 49,738,748 in the measured year;
- active direct test use confirmed in Architect, async-cache-dedupe, Node-RED
  nodes, Passport, Cypress, Datadog tracing, and Snyk CLI; Clinic.js remains a
  current manifest dependent;
- native ESM/default-import failure and transient child retention reproduced;
- no maintained drop-in successor found;
- upstream production audit clean, while the old development tree contains 13
  development-only findings.

## Release target

- version: `1.0.0`;
- Node: 12 through 24;
- modules: callable CommonJS API plus caller-anchored ESM/TypeScript host facade;
- subject boundary: CommonJS loading only, no native ESM interception;
- TypeScript: 3.9 plus current;
- runtime dependencies: exact-pinned `resolve@1.22.12`; seven external
  production package nodes; no optional or peer dependencies;
- migration: `proxyquire@npm:@stackline/proxyquire`;
- documentation: `https://alexandro.net/docs/vanilla/proxyquire/`.

## Compatibility notes

- preserve callable and `.load` APIs, call-through and cache controls,
  local/global/runtime-global stubs, null and non-object stubs, caller-relative
  resolution, synchronous errors, and runtime deep imports;
- `createProxyquire(import.meta.url)` gives ESM/native-TypeScript tests an
  explicit caller anchor for CommonJS subjects;
- preserve observed 2.1.3 cache behavior, not the inaccurate identity example
  in its README;
- retain `resolve@1.22.12`: Node 12/24 differential tests proved that native
  resolution collapses distinct symlink and package-export-alias request keys;
- detach exact transient children and conditionally restore loaders;
- keep global/runtime-global state scoped to the active load and nested-load
  safe.

## Required verification

Licensed upstream and deterministic differential cases, cache and
parent/children behavior, nested/global loads, extension composition, issue
#277, ESM-host facade, CommonJS and native-TypeScript callers, TypeScript
3.9/current declarations, Node 12-24, supported operating systems, coverage,
packed direct/alias installs, package lint, docs, production audit, registry,
CI, and CodeQL gates must pass before publication.

## Mutable release evidence

Populate the exact source/tag commit, artifact hashes and integrity, package
inventory, registry metadata, CI and CodeQL runs, GitHub release, production
documentation, and clean-install results only after independent publication
checks.
