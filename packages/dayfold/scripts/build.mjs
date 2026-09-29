import { execSync } from 'node:child_process'
import { rmSync } from 'node:fs'
import { build } from 'esbuild'

const entryPoints = ['index', 'react', 'vue', 'dom', 'shortcuts', 'locales/ar'].map(
  (e) => `src/${e}.ts`,
)

rmSync('dist', { recursive: true, force: true })
await build({
  entryPoints,
  outdir: 'dist',
  outbase: 'src',
  bundle: true,
  splitting: true,
  format: 'esm',
  target: 'es2022',
  platform: 'neutral',
  external: ['react', 'vue'],
  chunkNames: 'chunks/[name]-[hash]',
  legalComments: 'none',
})
execSync('tsc -p tsconfig.build.json', { stdio: 'inherit' })
console.log('built dist/')
