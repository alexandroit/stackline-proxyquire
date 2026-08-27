import { readFile } from 'node:fs/promises'

const root = new URL('../', import.meta.url)
const site = new URL('../site-dist/', import.meta.url)
const packageJson = JSON.parse(await readFile(new URL('package.json', root), 'utf8'))
const metadata = JSON.parse(await readFile(new URL('package-meta.json', site), 'utf8'))
const html = await readFile(new URL('index.html', site), 'utf8')
const app = await readFile(new URL('app.js', site), 'utf8')
const styles = await readFile(new URL('styles.css', site), 'utf8')
const robots = await readFile(new URL('robots.txt', site), 'utf8')
const sitemap = await readFile(new URL('sitemap.xml', site), 'utf8')
const llms = await readFile(new URL('llms.txt', site), 'utf8')
const llmsFull = await readFile(new URL('llms-full.txt', site), 'utf8')
const migration = await readFile(new URL('guides/migration.md', site), 'utf8')
const sourceClock = await readFile(new URL('examples/clock.cjs', root), 'utf8')
const sourceMessage = await readFile(new URL('examples/message.cjs', root), 'utf8')
const builtClock = await readFile(new URL('examples/clock.cjs', site), 'utf8')
const builtMessage = await readFile(new URL('examples/message.cjs', site), 'utf8')

assert(metadata.name === packageJson.name, 'documentation package name is stale')
assert(metadata.version === packageJson.version, 'documentation version is stale')
assert(metadata.runtimeDependencies === 1, 'documentation dependency count is stale')
assert(packageJson.dependencies.resolve === '1.22.12', 'documented resolver pin is stale')
assert(!html.includes('{{PACKAGE_VERSION}}'), 'HTML version placeholder was not replaced')
assert(html.includes('<link rel="canonical" href="https://alexandro.net/docs/vanilla/proxyquire/">'), 'canonical URL is missing')
assert(html.includes('SoftwareSourceCode'), 'structured software metadata is missing')
assert(html.includes('index,follow'), 'indexable robots metadata is missing')
assert(html.includes('Stub-resolution workbench'), 'stub-resolution workbench is missing')
assert(html.includes('createProxyquire(import.meta.url)'), 'caller-anchored example is missing')
assert(app.startsWith("'use strict';"), 'documentation app must start in strict mode')
assert(app.includes('function evaluateStubs'), 'interactive stub evaluator is missing')
assert(styles.includes('.proxyquire-hero'), 'Proxyquire hero styling is missing')
assert(!styles.includes('dynamic-dedupe-workbench.png'), 'copied background asset is still referenced')
assert(robots.includes('User-agent: *\nAllow: /'), 'robots policy is not open')
assert(count(sitemap, '/proxyquire/') === 6, 'sitemap must expose exactly six package URLs')
assert(sitemap.includes('/examples/commonjs.cjs'), 'CommonJS example is missing from the sitemap')
assert(sitemap.includes('/examples/esm.mjs'), 'ESM-host example is missing from the sitemap')
assert(llms.includes('npm install --save-dev @stackline/proxyquire'), 'LLM install reference is missing')
assert(llmsFull.includes('createProxyquire(import.meta.url)'), 'LLM ESM-host boundary is missing')
assert(migration.includes('proxyquire@npm:@stackline/proxyquire'), 'alias guide is missing')
assert(html.includes('./analytics.js'), 'documentation analytics is missing')
assert(builtClock === sourceClock, 'clock example support file is stale')
assert(builtMessage === sourceMessage, 'message example support file is stale')

for (const [name, value] of Object.entries({ html, app, styles, robots, sitemap, llms, llmsFull, migration })) {
  assert(!/(dynamic-dedupe|127\.0\.0\.1|localhost|verdaccio)/i.test(value), `${name} exposes copied or private content`)
}

console.log(JSON.stringify({ name: metadata.name, version: metadata.version }))

function count (haystack, needle) {
  return haystack.split(needle).length - 1
}

function assert (condition, message) {
  if (!condition) throw new Error(message)
}
