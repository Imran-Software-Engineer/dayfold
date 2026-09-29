import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import { defineConfig } from 'astro/config'

export default defineConfig({
  site: process.env.SITE_URL ?? 'https://dayfold.vercel.app',
  integrations: [
    react(),
    sitemap({
      i18n: { defaultLocale: 'en', locales: { en: 'en', ar: 'ar' } },
      serialize: (item) => ({ ...item, lastmod: new Date().toISOString() }),
    }),
  ],
  trailingSlash: 'always',
  build: { inlineStylesheets: 'always' },
})
