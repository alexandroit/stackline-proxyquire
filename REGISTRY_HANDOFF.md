# Registry Handoff

- upstream: `proxyquire@2.1.3`
- Stackline target: `@stackline/proxyquire@1.0.1`
- decision: GO
- compatibility: callable CommonJS and `.load`, call-through/cache controls,
  local/global/runtime-global and missing-module stubs, non-object stubs,
  caller-relative resolution, synchronous errors, and runtime deep imports
- additive API: `createProxyquire(import.meta.url)` for ESM/native-TypeScript
  hosts loading CommonJS subjects
- native ESM interception: intentionally out of scope
- runtime dependencies: zero; zero optional and peer dependencies
- tests required: upstream, differential, cache, parent/children,
  nested/global state, loader composition, ESM host, types, runtime, coverage,
  package, packed install, registry alias, audit, CI, and CodeQL
- publication status: PUBLISHED TO VERDACCIO AND OFFICIAL NPM
- npm: https://www.npmjs.com/package/@stackline/proxyquire
- GitHub release: https://github.com/alexandroit/stackline-proxyquire/releases/tag/stackline-v1.0.1
- docs: https://alexandro.net/docs/vanilla/proxyquire/
- artifact SHA-1: `2ffbafcb146c533cc559249ed1aa6eab133aa323`
- artifact SHA-256: `ec31099f2f73d5df103e4084c975a5584270809f230957beba70238687a4588c`
- official npm direct and legacy-alias clean installs: passed
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

## Production completion — 2026-08-27T19:23:31Z

- the existing immutable artifact was published once to official npm after
  ownership and version-absence checks; its npm, Verdaccio, and local bytes
  match exactly;
- official metadata, integrity, registry signature, clean direct install,
  legacy-key alias install, CommonJS, and ESM-host checks pass;
- the immutable GitHub release carries the exact tarball, checksums, inventory,
  manifest, notes, and CycloneDX SBOM and resolves to the tagged release source;
- production documentation, public catalog/search data, robots, canonical and
  structured metadata, browser examples, desktop/mobile layouts, and six
  aggregate sitemap entries pass through Cloudflare;
- publication state is `PUBLISHED`; Project 14 may begin after the canonical
  Project 13 records are synchronized.

## Dependency hardening — 2026-08-30

- `1.0.1` replaces `resolve@1.22.12` and its seven-package subtree with a
  package-owned lexical CommonJS resolver, leaving no production dependency
  nodes;
- upstream, differential, identity, cache, Node 12-24, TypeScript 3.9/current,
  package, coverage, direct/alias install, full audit, production audit, CI,
  and CodeQL gates pass;
- source/tag commit:
  `7c54172a2c5a85928b0ddb2785d829dfc73f31a7`; CI `33301832433`; CodeQL
  `33301832509`;
- the Verdaccio, official npm, local release-candidate, and immutable GitHub
  release tarballs are byte-identical.
