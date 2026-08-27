# Adoption Targets

## Primary

Active direct test usage observed on 2026-08-27 includes:

1. `architect/architect`, using `proxyquire@~2.1.3` in unit tests;
2. `mcollina/async-cache-dedupe`, using `proxyquire@^2.1.3`;
3. `node-red/node-red-nodes`, using `proxyquire@2.1.3`;
4. `clinicjs/node-clinic`, retaining `proxyquire@^2.1.0` in its current
   manifest;
5. `jaredhanson/passport`, using `proxyquire@1.4.x` through a global test alias.

Cypress, Datadog's `dd-trace-js`, and Snyk CLI are additional active direct
users suitable for compatibility validation before outreach.

## Migration message

The maintained package preserves the CommonJS API and npm-alias path while
adding first-party types, Node 12-24 verification, bounded transient-module
cleanup, safer loader composition, an ESM-host factory for CommonJS subjects,
and a reduced, exact-pinned production dependency graph.

## Outreach rules

Adoption changes should use the legacy-name npm alias first, disclose that
Stackline maintains the replacement, and run the target repository's own test
suite. ESM projects are candidates only when the subject under test still loads
dependencies through CommonJS. Do not open mass-generated issues or pull
requests, and do not imply affiliation with the original maintainer.

## Non-targets

- native ESM dependency interception;
- browser module replacement;
- production dependency injection;
- sandboxing untrusted code;
- projects that no longer use Proxyquire's API.
