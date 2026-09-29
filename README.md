# dayfold monorepo

Headless, accessible date picker — [docs & demos](https://dayfold.vercel.app) · [npm](https://www.npmjs.com/package/dayfold)

| Path | What |
| --- | --- |
| [`packages/dayfold`](packages/dayfold) | The npm package — headless, accessible date picker ([README](packages/dayfold/README.md)) |
| [`apps/site`](apps/site) | Demo & docs site (Astro, static, English + Arabic) |

```bash
npm install
npm test              # vitest + axe-core
npm run size          # bundle budgets (fails if exceeded)
npm run site:dev      # demo site on http://localhost:4321
npm run site:build    # builds the package, then the static site
```

## Publishing

```bash
cd packages/dayfold
npm publish --access public   # prepublishOnly runs build, tests and size budgets
```

Set `SITE_URL` when building the site if it is not deployed at `https://dayfold.vercel.app`.
