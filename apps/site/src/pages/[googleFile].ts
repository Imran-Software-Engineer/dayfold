import type { APIRoute, GetStaticPaths } from 'astro'

// GOOGLE_SITE_VERIFICATION may hold Google's "HTML file" name (google1234abcd.html)
// instead of a meta-tag code; in that case serve the file Google asks for.
const value = import.meta.env.GOOGLE_SITE_VERIFICATION ?? ''
const isFile = /^google[0-9a-f]+\.html$/i.test(value)

export const getStaticPaths: GetStaticPaths = () =>
  isFile ? [{ params: { googleFile: value } }] : []

export const GET: APIRoute = () =>
  new Response(`google-site-verification: ${value}`, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
