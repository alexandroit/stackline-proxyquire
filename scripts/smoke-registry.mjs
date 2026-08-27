import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

const registryArgument = process.argv.find((value) => value.startsWith('--registry='))
const registry = registryArgument
  ? registryArgument.slice('--registry='.length)
  : process.env.STACKLINE_REGISTRY || 'http://127.0.0.1:4873'
const version = process.env.STACKLINE_VERSION || '1.0.0'
const temporary = await mkdtemp(path.join(os.tmpdir(), 'stackline-proxyquire-registry-'))

function run (args) {
  const result = spawnSync(process.execPath, args, {
    cwd: temporary,
    encoding: 'utf8',
    maxBuffer: 4 * 1024 * 1024
  })
  assert.equal(result.status, 0, result.stdout + result.stderr)
}

try {
  await writeFile(path.join(temporary, 'package.json'), JSON.stringify({
    private: true,
    type: 'module',
    dependencies: {
      '@stackline/proxyquire': version,
      proxyquire: `npm:@stackline/proxyquire@${version}`
    }
  }))
  await writeFile(path.join(temporary, 'dependency.cjs'), "module.exports = { value: 'real' }\n")
  await writeFile(path.join(temporary, 'subject.cjs'), "module.exports = require('./dependency.cjs').value\n")

  const installed = spawnSync('npm', [
    'install',
    '--ignore-scripts',
    '--no-audit',
    '--no-fund',
    '--registry',
    registry
  ], { cwd: temporary, encoding: 'utf8', maxBuffer: 4 * 1024 * 1024 })
  assert.equal(installed.status, 0, installed.stdout + installed.stderr)

  run(['--input-type=commonjs', '-e', [
    "const direct = require('@stackline/proxyquire')",
    "const alias = require('proxyquire')",
    "const first = direct('./subject.cjs', { './dependency.cjs': { value: 'direct', '@noCallThru': true } })",
    "const second = alias('./subject.cjs', { './dependency.cjs': { value: 'alias', '@noCallThru': true } })",
    "if (first !== 'direct' || second !== 'alias') process.exit(1)"
  ].join(';')])

  await writeFile(path.join(temporary, 'consumer.mjs'), [
    "import { createProxyquire } from '@stackline/proxyquire'",
    'const proxyquire = createProxyquire(import.meta.url)',
    "const value = proxyquire('./subject.cjs', { './dependency.cjs': { value: 'esm', '@noCallThru': true } })",
    "if (value !== 'esm') process.exit(1)"
  ].join('\n'))
  run(['consumer.mjs'])
} finally {
  await rm(temporary, { force: true, recursive: true })
}

console.log(`Registry direct, legacy-alias, CJS, and ESM checks passed against ${registry}.`)
