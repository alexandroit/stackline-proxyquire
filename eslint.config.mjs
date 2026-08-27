import js from '@eslint/js'

export default [
  {
    ignores: ['coverage/**', 'dist/**', 'node_modules/**', 'site-dist/**']
  },
  js.configs.recommended,
  {
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        AbortController: 'readonly',
        Buffer: 'readonly',
        TextEncoder: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        console: 'readonly',
        process: 'readonly',
        setImmediate: 'readonly',
        setTimeout: 'readonly'
      }
    },
    rules: {
      'no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_'
      }]
    }
  },
  {
    files: ['docs-site/**/*.js'],
    languageOptions: {
      globals: {
        document: 'readonly',
        globalThis: 'readonly',
        navigator: 'readonly'
      }
    }
  },
  {
    files: ['index.js', 'lib/**/*.js', 'test/**/*.js', 'examples/**/*.cjs'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: {
        __dirname: 'readonly',
        __filename: 'readonly',
        console: 'readonly',
        exports: 'writable',
        global: 'writable',
        module: 'writable',
        require: 'readonly',
        URLSearchParams: 'readonly'
      }
    },
    rules: {
      'no-constant-binary-expression': 'off'
    }
  }
]
