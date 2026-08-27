# Registry Handoff

- upstream: `proxyquire@2.1.3`
- Stackline target: `@stackline/proxyquire@1.0.0`
- decision: GO
- compatibility: callable CommonJS and `.load`, call-through/cache controls,
  local/global/runtime-global and missing-module stubs, non-object stubs,
  caller-relative resolution, synchronous errors, and runtime deep imports
- additive API: `createProxyquire(import.meta.url)` for ESM/native-TypeScript
  hosts loading CommonJS subjects
- native ESM interception: intentionally out of scope
- runtime dependencies: exact-pinned `resolve@1.22.12`; seven external
  production package nodes; zero optional and peer dependencies
- tests required: upstream, differential, cache, parent/children,
  nested/global state, loader composition, ESM host, types, runtime, coverage,
  package, packed install, registry alias, audit, CI, and CodeQL
- publication status: NOT YET PUBLISHED
- release evidence: populate only after immutable artifact and external checks
- next project: 14, `update-section`

## Release checkpoint — 2026-08-27 — retryable

- the complete local gate, Node 12-24, GitHub CI, and CodeQL pass;
- source/tag commit: `36552232c7fd0d133d56a8a8f502f15283f94914`;
- immutable artifact SHA-1:
  `34d6a0ce2fc5b46ddf52e6a07ae6a9d6957a89fa`;
- exact artifact and direct plus legacy-alias consumers pass on the staging
  registry;
- official npm remains absent because the available publisher session returns
  E401; no publish was attempted without valid authority;
- GitHub release and production documentation remain gated behind official
  npm verification;
- publication state remains retryable `BUILDING`; Project 14 must not start
  until this release completes or reaches a rigorously documented final NO-GO.
