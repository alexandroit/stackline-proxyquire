# Upstream Audit

Audit date: 2026-08-27

## Baseline

- npm package: `proxyquire@2.1.3`;
- repository: <https://github.com/thlorenz/proxyquire>;
- latest npm release: 2019-08-12;
- license: MIT;
- published artifact: 62 files, 18,060 packed bytes, 67,174 unpacked bytes;
- artifact SHA-1: `2049a7eefa10a9a953346a18e54aab2b4268df39`;
- public API: callable export, `.load`, call-through/cache controls, and
  local/global/runtime-global stubs.

The repository is public and unarchived. Its 2025 CI migration and later issue
activity show light maintenance, but the last published or runtime-changing
release remains seven years old.

## Current demand

Official npm measurements reported:

- 1,155,963 downloads for 2026-08-17 through 2026-08-23;
- 5,071,710 downloads in the 30 days ending 2026-08-26;
- 49,738,748 downloads in the preceding year.

These figures are npm requests, not unique applications. Current source review
confirmed direct test use in `architect/architect`,
`mcollina/async-cache-dedupe`, `node-red/node-red-nodes`, and
`jaredhanson/passport`. `clinicjs/node-clinic` remains a current manifest
dependent; Cypress, Datadog's `dd-trace-js`, and Snyk CLI are additional active
direct users.

## Reproduced gaps

- A default import from a native ESM or native-TypeScript test has no
  `module.parent`; upstream then reads `parent.require` and fails. This
  reproduces issue #277 on the Node versions that execute the native-TypeScript
  ESM entry directly.
- Repeated temporary loads can retain transient module records through
  `module.parent.children`, as discussed in issue #174 and unmerged PR #261.
- Extension restoration is unconditional and can overwrite a loader installed
  later by another test or instrumentation tool.
- The package has no first-party declarations.
- Three direct runtime dependencies expand to eleven external package nodes in
  a fresh production installation, although the current production audit is
  clean and the historical `path-parse` advisory is patched in `1.0.7`.
- The old development tree reports 13 findings through obsolete test and lint
  tooling; those findings are development-only, not evidence of a vulnerability
  in the published runtime graph.

## Alternatives

`quibble`, `mock-require`, `rewiremock`, `testdouble`, and `esmock` expose
different APIs or runtime assumptions. `esmock` targets native ESM instead of
the historical CommonJS contract. `proxyquire-universal@3.0.2` is a Browserify
adapter with `proxyquire` as a peer dependency, so it complements rather than
replaces this package. No healthy maintained drop-in replacement was found.

## Decision

GO. A reduced and exact-pinned runtime graph can preserve the heavily used
CommonJS contract, including request identity that native resolution does not
preserve, while fixing narrow loader and retention defects, adding owned types,
and providing an honest caller-anchored bridge for ESM-hosted tests without
claiming native ESM interception.
