# Changelog

## [1.0.2] - 2026-09-28

- Organize package documentation, preserve API and migration examples, and add Stackline community links.
- Improve package discovery keywords with precise domain terms and `stackline`.
- Pin GitHub Actions release tooling and require an explicit missing-version response before publication.


All notable changes to `@stackline/proxyquire` are documented here.

## 1.0.1 - 2026-08-30

- Replace the seven-package `resolve@1.22.12` production subtree with a
  dependency-free lexical CommonJS resolver.
- Preserve distinct symlink paths, package-export aliases, package roots,
  deep requests, extension lookup, and caller-relative resolution without
  canonicalizing request identities.
- Add recursive production-closure gates requiring warning-free direct and
  historical-alias installs, a valid npm tree, and zero audit findings.

## 1.0.0 - 2026-08-27

- Preserve the callable `proxyquire@2.1.3` CommonJS API and `.load` alias.
- Preserve call-through, cache, local/global/runtime-global, missing-module,
  non-object-stub, caller-relative-resolution, and synchronous error behavior.
- Add `createProxyquire(import.meta.url)` for ESM and native-TypeScript tests
  that need to proxyquire CommonJS subjects.
- Detach exact transient CommonJS module records after temporary loads instead
  of retaining them through `module.parent.children`.
- Restore extension handlers conditionally without overwriting handlers that
  another tool installed later.
- Scope `@global` and `@runtimeGlobal` detection to the active load so one call
  cannot change cache behavior for later ordinary calls on the same instance.
- Use own-key, prototype-safe stub bookkeeping.
- Internalize the small `fill-keys` and `module-not-found-error` behaviors, and
  exact-pin `resolve@1.22.12` to preserve distinct symlink and package-export
  alias stub identities; the external production graph falls from eleven to
  seven package nodes.
- Add first-party declarations for TypeScript 3.9 and current TypeScript.
- Add upstream, differential, cache, parent/child, loader-composition, ESM-host,
  package, alias-install, and Node 12-24 release gates.
- Add current CI, CodeQL, documentation, checksum, SBOM, and audit conventions.
