import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import os from 'node:os'
import path from 'node:path'

const root = fileURLToPath(new URL('../', import.meta.url))
const temporary = await mkdtemp(path.join(os.tmpdir(), 'stackline-proxyquire-pack-'))
let tarball

function run (command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd || temporary,
    encoding: 'utf8',
    maxBuffer: 4 * 1024 * 1024
  })
  assert.equal(result.status, 0, result.stdout + result.stderr)
  return result
}

try {
  const packed = run('npm', ['pack', '--json', '--ignore-scripts'], { cwd: root })
  const packResult = JSON.parse(packed.stdout)[0]
  tarball = path.join(root, packResult.filename)

  const paths = packResult.files.map((file) => file.path)
  for (const required of [
    'LICENSE',
    'NOTICE',
    'THIRD_PARTY_LICENSES.md',
    'index.js',
    'index.mjs',
    'index.d.ts',
    'index.d.cts',
    'index.d.mts',
    'lib/proxyquire.js',
    'lib/proxyquire-error.js',
    'lib/is.mjs',
    'examples/commonjs.cjs',
    'examples/esm.mjs',
    'examples/clock.cjs',
    'examples/message.cjs'
  ]) assert.equal(paths.includes(required), true, `missing packed file: ${required}`)
  assert.equal(paths.some((file) => file.startsWith('test/')), false)
  assert.equal(paths.some((file) => file.startsWith('scripts/')), false)
  assert.equal(paths.some((file) => file.startsWith('docs-site/')), false)

  await writeFile(path.join(temporary, 'package.json'), JSON.stringify({
    private: true,
    type: 'module',
    dependencies: {
      '@stackline/proxyquire': `file:${tarball}`
    }
  }))
  await writeFile(path.join(temporary, 'dependency.cjs'), "module.exports = { value: 'real' }\n")
  await writeFile(path.join(temporary, 'subject.cjs'), "module.exports = require('./dependency.cjs').value\n")

  run('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund'])

  run(process.execPath, ['--input-type=commonjs', '-e', [
    "const proxyquire = require('@stackline/proxyquire')",
    "const ProxyquireError = require('@stackline/proxyquire/lib/proxyquire-error')",
    "const value = proxyquire('./subject.cjs', { './dependency.cjs': { value: 'packed', '@noCallThru': true } })",
    "if (value !== 'packed' || ProxyquireError.name !== 'ProxyquireError') process.exit(1)"
  ].join(';')])

  await writeFile(path.join(temporary, 'consumer.mjs'), [
    "import proxyquire, { createProxyquire } from '@stackline/proxyquire'",
    "import is from '@stackline/proxyquire/lib/is'",
    'if (typeof proxyquire !== "function") process.exit(1)',
    'if (!is.String("packed")) process.exit(1)',
    'const anchored = createProxyquire(import.meta.url)',
    "const value = anchored('./subject.cjs', { './dependency.cjs': { value: 'esm-packed', '@noCallThru': true } })",
    "if (value !== 'esm-packed') process.exit(1)"
  ].join('\n'))
  run(process.execPath, ['consumer.mjs'])

  await writeFile(path.join(temporary, 'consumer.mts'), [
    "import proxyquire, { createProxyquire, type ProxyquireInstance } from '@stackline/proxyquire'",
    "import is from '@stackline/proxyquire/lib/is'",
    'const anchored: ProxyquireInstance = createProxyquire(import.meta.url)',
    "const value = anchored<string>('./subject.cjs', { './dependency.cjs': { value: 'typed' } })",
    'value.toUpperCase()',
    'proxyquire.preserveCache().callThru()',
    'is.String(value)'
  ].join('\n'))
  await writeFile(path.join(temporary, 'tsconfig.json'), JSON.stringify({
    compilerOptions: {
      module: 'nodenext',
      moduleResolution: 'nodenext',
      noEmit: true,
      strict: true,
      target: 'es2022',
      types: []
    },
    files: ['consumer.mts']
  }))
  run(process.execPath, [path.join(root, 'node_modules', 'typescript', 'bin', 'tsc'), '-p', 'tsconfig.json'])

  const installedRoot = path.join(temporary, 'node_modules', '@stackline', 'proxyquire')
  run(process.execPath, [path.join(installedRoot, 'examples', 'commonjs.cjs')])
  run(process.execPath, [path.join(installedRoot, 'examples', 'esm.mjs')])

  const manifest = JSON.parse(await readFile(path.join(installedRoot, 'package.json'), 'utf8'))
  assert.equal(manifest.name, '@stackline/proxyquire')
  assert.equal(manifest.version, '1.0.0')
  assert.deepEqual(manifest.dependencies, { resolve: '1.22.12' })
  const resolver = JSON.parse(await readFile(path.join(temporary, 'node_modules', 'resolve', 'package.json'), 'utf8'))
  assert.equal(resolver.version, '1.22.12')
} finally {
  if (tarball) await rm(tarball, { force: true })
  await rm(temporary, { force: true, recursive: true })
}

console.log('Packed direct, deep-import, CJS, ESM, TypeScript, and example checks passed.')
