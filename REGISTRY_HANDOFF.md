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
