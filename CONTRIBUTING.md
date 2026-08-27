# Contributing

1. Use a supported Node.js release.
2. Run `npm ci`.
3. Add an upstream characterization or differential case for every changed
   historical behavior.
4. Add focused cache, parent/child, and loader-restoration assertions whenever
   code touches CommonJS internals.
5. Run `npm run verify` before opening a pull request.
6. Keep the `proxyquire@2.1.3` CommonJS API stable across the 1.x line.

Native ESM interception is outside this package. ESM and native-TypeScript host
tests must exercise `createProxyquire(import.meta.url)` against a CommonJS
subject without describing it as ESM mocking.

Do not include credentials, registry tokens, private hostnames, proprietary
consumer fixtures, or unlicensed upstream test material. Security reports
belong in private vulnerability reporting as described in
[SECURITY.md](./SECURITY.md).
