import { execFileSync } from 'node:child_process'
import { mkdir, readFile, writeFile } from 'node:fs/promises'

const root = new URL('../', import.meta.url)
const output = new URL('../dist/', import.meta.url)
const packageJson = JSON.parse(await readFile(new URL('package.json', root), 'utf8'))

for (const file of [
  'index.js',
  'index.mjs',
  'lib/is.js',
  'lib/is.mjs',
  'lib/proxyquire-error.js',
  'lib/proxyquire.js',
  'examples/clock.cjs',
  'examples/commonjs.cjs',
  'examples/esm.mjs',
  'examples/message.cjs'
]) {
  execFileSync(process.execPath, ['--check', new URL(file, root).pathname], { stdio: 'inherit' })
}

await mkdir(output, { recursive: true })
await writeFile(new URL('build-meta.json', output), `${JSON.stringify({
  name: packageJson.name,
  runtimeDependencies: Object.keys(packageJson.dependencies || {}).length,
  version: packageJson.version
}, null, 2)}\n`, 'utf8')

console.log(`Validated runtime entries for ${packageJson.name}@${packageJson.version}.`)
