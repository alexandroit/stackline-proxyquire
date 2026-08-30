# Dependency Decisions

## Runtime

The maintained package has no runtime, optional, or peer dependencies.

| Upstream dependency | Upstream range | Decision | Rationale |
| --- | --- | --- | --- |
| `fill-keys` | `^1.0.2` | remove | Preserve the small descriptor-copy/call-through behavior internally without the `is-object` and `merge-descriptors` subtree. |
| `module-not-found-error` | `^1.0.1` | remove | Construct and test the small Node-shaped `MODULE_NOT_FOUND` error internally. |
| `resolve` | `^1.11.1` | internalize the required resolver boundary | Native canonical resolution collapses distinct symlink and package-export-alias request identities. A focused lexical CommonJS resolver preserves those identities and the upstream matching contract without carrying the seven-package subtree. |

A fresh `proxyquire@2.1.3` production install contains eleven external package
nodes below those three direct dependencies. The maintained package now
internalizes only the narrow behavior it uses and has no external production
nodes. Differential and targeted identity tests cover the internalized
behavior; the reduction is not a claim that the upstream graph is vulnerable.

## Development

Development tools are exact-pinned for reproducibility:

- pinned modern Mocha, Should, and Sinon versions run the licensed upstream
  suite without carrying its obsolete dependency versions;
- Node's built-in test runner and `node:assert` cover new compatibility,
  differential, cache, and dependent-usage cases; fixture scripts exercise
  legacy Node lines where `node:test` is not available;
- `proxyquire-upstream` is an npm alias of `proxyquire@2.1.3` used only for
  deterministic differential checks;
- ESLint replaces the old Standard/ESLint toolchain;
- c8 enforces coverage;
- publint and Are the Types Wrong inspect the packed contract;
- TypeScript 3.9 and current TypeScript verify declarations.

Mocha's and Sinon's declared transitive ranges still admit advisory-affected
`diff` and `serialize-javascript` releases. Root overrides pin `diff@9.0.0` and
`serialize-javascript@7.1.0`; the complete development graph and the separate
production graph both audited with zero findings on 2026-08-27. Development
tools run on Node 20/24, while the minimal runtime harness covers Node 12-24
in clean installs independent from development tooling.

The upstream development audit reported 13 findings in obsolete tooling. No
development dependency is shipped to consumers, and the release gate requires
`npm audit --omit=dev` to remain clean.
