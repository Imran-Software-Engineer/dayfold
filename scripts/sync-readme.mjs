// The npm README (packages/dayfold/README.md) is the source of truth; the GitHub
// README is the same text plus a development section.
import { readFileSync, writeFileSync } from 'node:fs'

const pkg = readFileSync('packages/dayfold/README.md', 'utf8')
const dev = `
---

## Development

This repository is a monorepo:

| Path | What |
| --- | --- |
| [\`packages/dayfold\`](packages/dayfold) | The npm package |
| [\`apps/site\`](apps/site) | Demo & docs site (Astro, English + Arabic), deployed on Vercel |

\`\`\`bash
npm install
npm test              # unit + integration tests, including axe-core accessibility checks
npm run size          # bundle-size budgets (fails if exceeded)
npm run check         # lint + format (Biome)
npm run site:dev      # demo site on http://localhost:4321
npm run site:build    # builds the package, then the static site
\`\`\`

Publishing: \`cd packages/dayfold && npm publish\` — \`prepublishOnly\` checks the metadata, builds, tests and enforces the size budgets.

<!-- Generated from packages/dayfold/README.md by scripts/sync-readme.mjs — edit that file instead. -->
`
writeFileSync('README.md', pkg.replace(/\n## License[\s\S]*$/, dev + '\n## License\n\n[MIT](./LICENSE)\n'))
console.log('README.md synced')
