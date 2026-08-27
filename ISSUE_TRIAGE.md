# Issue and Pull Request Triage

## Addressed in 1.0.0

- #277: ESM and native-TypeScript hosts use
  `createProxyquire(import.meta.url)` instead of relying on an absent
  `module.parent`.
- #174 and PR #261: cleanup detaches only transient child records created by a
  temporary load; unrelated caller children remain intact.
- #256: the package owns declarations tested with TypeScript 3.9 and current
  TypeScript.
- #265: the caller-anchored factory uses the same absolute path and `file:` URL
  anchors as `module.createRequire()`.
- #222 and PR #134: documentation states the observed cache behavior instead
  of repeating the inaccurate identity example from the upstream README.
- Independently reproduced global-mode leakage is fixed by keeping `@global`
  and `@runtimeGlobal` flags local to each load rather than on the reusable
  Proxyquire instance.
- Independently reproduced extension-hook clobbering is fixed by restoring a
  loader only when Proxyquire's own temporary wrapper is still installed.

## Preserved or deferred

- #226: `noPreserveCache()` does not recursively evict every unstubbed
  transitive dependency. Such a change would exceed the compatibility release.
- #225, #230, #234, and #280 remain feature or behavior proposals unless a
  focused reproduction proves a compatibility or safety defect.
- Native ESM import interception remains outside this CommonJS API. A separate
  Node loader would have different semantics and maintenance risks.

## New reports

Include the Node version, operating system, package manager, module format,
subject and stub request strings, call-through/cache/global settings, loader
registration order, a minimal fixture tree, and the expected cache and
`module.children` state. Security-sensitive reports must follow
[SECURITY.md](./SECURITY.md) rather than a public issue.
