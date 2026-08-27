# Publishing

## Release gate

```bash
npm ci
npm run verify
```

The gate includes the licensed upstream suite, differential and regression
tests, Node/runtime and TypeScript contracts, coverage, packed consumers,
`publint`, Are the Types Wrong, documentation validation, production/full
dependency audits, and registry-signature verification.

## Immutable artifact

Create one tarball from the reviewed source commit. Record its SHA-1, SHA-256,
SHA-512, npm integrity, complete file inventory, and CycloneDX SBOM. Inspect
the package version and publisher authority immediately before each registry
write. Publish and verify those exact bytes on Verdaccio before publishing the
same tarball to official npm. Never rebuild between registries and never
republish an existing version.

## GitHub trusted publishing

The `Publish to npm` workflow supports npm Trusted Publishers through GitHub
Actions OIDC. Configure npm with:

- organization or user: `alexandroit`
- repository: `stackline-proxyquire`
- workflow: `publish.yml`
- environment: none

The workflow requires the expected SHA-512 digest, reruns the release gate,
checks registry signatures, and rejects a version already present on public
npm. Token-based publication remains available to an authorized maintainer,
but it must follow the same immutable-artifact and verification requirements.

## Release completion

A release is incomplete until the exact artifact is verified on Verdaccio,
official npm, and the immutable GitHub release; direct scoped and legacy-name
npm-alias consumers pass; CI and CodeQL are green; and production documentation
and its catalog/search/sitemap discovery paths are verified.
