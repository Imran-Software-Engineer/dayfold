// Measures what each entry costs a consumer: bundled, minified, gzip + brotli.
import { brotliCompressSync, gzipSync } from 'node:zlib'
import { build } from 'esbuild'

const budgets = {
  'dayfold (createDatePicker)': ["import { createDatePicker } from './src/index.ts'", 7],
  'dayfold/react': ["import { useDatePicker } from './src/react.ts'", 7.2],
  'dayfold/vue': ["import { useDatePicker } from './src/vue.ts'", 7.5],
  'dayfold/dom': ["import { spread, h } from './src/dom.ts'", 0.5],
  'dayfold/shortcuts': ["import { withShortcuts } from './src/shortcuts.ts'", 2.5],
}

let failed = false
for (const [name, [code, limitKb]] of Object.entries(budgets)) {
  const out = await build({
    stdin: {
      contents: `${code}\nconsole.log(${code.match(/\{ (\w+)/)[1]})`,
      resolveDir: '.',
      loader: 'ts',
    },
    bundle: true,
    minify: true,
    write: false,
    format: 'esm',
    external: ['react', 'vue'],
    legalComments: 'none',
  })
  const buf = out.outputFiles[0].contents
  const gz = gzipSync(buf, { level: 9 }).length / 1024
  const br = brotliCompressSync(buf).length / 1024
  const ok = gz <= limitKb
  failed ||= !ok
  console.log(
    `${ok ? '✓' : '✗'} ${name.padEnd(28)} ${gz.toFixed(2)} kB gzip  ${br.toFixed(2)} kB brotli  (budget ${limitKb} kB)`,
  )
}
if (failed) process.exit(1)
