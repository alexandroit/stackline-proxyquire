---
schema: stackline-package-project-memory-v1
project: 13
package: proxyquire
target: "@stackline/proxyquire"
state: PUBLISHED
decision: GO
registry_scope: verdaccio-and-public-npm
public_npm: true
public_github: true
docs_production: true
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

### Retryable release checkpoint — 2026-08-27

- source/tag commit: `36552232c7fd0d133d56a8a8f502f15283f94914`;
- tag: `stackline-v1.0.0`;
- CI run 33079422946 and CodeQL run 33079422873: successful;
- immutable artifact: 14,244 packed bytes, 45,400 unpacked bytes, 24 files;
- artifact SHA-1: `34d6a0ce2fc5b46ddf52e6a07ae6a9d6957a89fa`;
- artifact SHA-256:
  `0abc781ae295e7a9fa0a9d95c25b739e0f320cf5630cd864b46eba5f0baa521a`;
- npm integrity:
  `sha512-C4ynR0gEAbq4s6Iah0cXRtXdQSxkfHpNiSYWpFq/timiWg5H4XqMjJBOCmoHJDurTgNly4cEPK7oH58m/BFrhA==`;
- exact artifact, direct consumer, and legacy-key alias consumer: verified on
  the staging registry;
- official npm: absent; the available publisher credential returns E401;
- GitHub release and production documentation: intentionally pending until
  official npm verification;
- state: retryable `BUILDING`, not NO-GO. Do not rebuild the artifact,
  republish the staging-registry version, or begin Project 14.

### Production release — 2026-08-27T19:23:31Z

- Published the existing immutable `stackline-proxyquire-1.0.0.tgz` to
  official npm after rechecking scope ownership and confirming the version was
  absent. The Verdaccio version was not republished.
- Official npm metadata reports the recorded SHA-1 and integrity, 24 files,
  45,400 unpacked bytes, Node `>=12`, exact `resolve@1.22.12`, and a registry
  signature. The npm and Verdaccio downloads are byte-identical to the local
  artifact.
- Clean direct scoped and `proxyquire@npm:@stackline/proxyquire` alias
  consumers pass against official npm for CommonJS and the ESM-host facade;
  installed package signatures pass verification.
- The GitHub release at
  https://github.com/alexandroit/stackline-proxyquire/releases/tag/stackline-v1.0.0
  is immutable, resolves to release-source commit
  `36552232c7fd0d133d56a8a8f502f15283f94914`, and carries all eight exact
  release assets. Every downloaded asset byte-matches the recorded local file.
- The production package documentation, catalog entry, search/selector data,
  robots policy, and all six package URLs in both aggregate sitemaps are live
  through Cloudflare. Desktop and mobile layouts, canonical metadata,
  `SoftwareSourceCode` structured data, copy actions, valid workbench output,
  and malformed-input handling pass browser verification.
- The catalog source is commit
  `a1d3ea4ebd4eaa1a8275a62f153498821953613f`; CI run 33108019738 and CodeQL
  run 33108019134 pass. Production was backed up at
  `/var/backups/stackline-docs/20260827T191702Z-proxyquire` before deployment.
- Final disposition: GO / `PUBLISHED` and validated on Verdaccio, official
  npm, GitHub, and production documentation.
