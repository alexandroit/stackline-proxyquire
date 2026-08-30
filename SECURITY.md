# Security Policy

## Supported versions

| Version | Supported |
| --- | --- |
| 1.x | Yes |
| Upstream `proxyquire` releases | Maintained by their upstream owner |

## Report privately

Do not open a public issue for an undisclosed vulnerability. Use GitHub private
vulnerability reporting for
[`alexandroit/stackline-proxyquire`](https://github.com/alexandroit/stackline-proxyquire/security/advisories/new).

Include the affected package and Node versions, operating system, module
format, cache/call-through/global settings, loader order, a minimal fixture
tree, expected impact, and any known workaround. We will acknowledge a complete
report within five business days and coordinate remediation and disclosure.

## Security boundary

Proxyquire temporarily changes process-wide CommonJS cache entries, extension
handlers, and per-module `require` behavior. `@global` and `@runtimeGlobal` can
cause module initialization and its side effects to run again. Tests must use
trusted subjects and stubs and should prefer direct local stubs.

The package is not a sandbox, module-integrity verifier, permission system, or
safe evaluator for untrusted code. It does not intercept native ESM imports or
isolate other code running in the same process.

The published package has no runtime, optional, or peer dependencies. Release
verification must confirm the packed manifest, lockfile, direct and historical
alias installation trees, registry signatures, SBOM, and clean full and
production audits.
