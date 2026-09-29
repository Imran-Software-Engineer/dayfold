import { execSync } from 'node:child_process'
import { copyFileSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { build } from 'esbuild'

const entryPoints = [
  ...['index', 'react', 'vue', 'dom', 'shortcuts', 'locales/ar'].map((e) => `src/${e}.ts`),
  { in: 'src/react-field.tsx', out: 'react/field' },
]

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
  external: ['react', 'react/jsx-runtime', 'vue'],
  jsx: 'automatic',
  chunkNames: 'chunks/[name]-[hash]',
  legalComments: 'none',
})
execSync('tsc -p tsconfig.build.json', { stdio: 'inherit' })
// Place the field typings next to its bundle and ship the optional stylesheet.
mkdirSync('dist/react', { recursive: true })
writeFileSync(
  'dist/react/field.d.ts',
  readFileSync('dist/react-field.d.ts', 'utf8').replaceAll("from './", "from '../"),
)
rmSync('dist/react-field.d.ts')
copyFileSync('src/field.css', 'dist/field.css')
console.log('built dist/')
