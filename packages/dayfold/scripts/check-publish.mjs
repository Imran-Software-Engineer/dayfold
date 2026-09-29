// Refuses to publish until the npm page will show complete metadata.
import { readFileSync } from 'node:fs'

const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
const missing = ['repository', 'bugs', 'homepage', 'author'].filter((key) => !pkg[key])
if (missing.length) {
  console.error(`✗ package.json is missing: ${missing.join(', ')}`)
  console.error(
    '  These fill the npm sidebar and count towards npm search quality. Add them, then publish.',
  )
  process.exit(1)
}
console.log('✓ package metadata complete')
