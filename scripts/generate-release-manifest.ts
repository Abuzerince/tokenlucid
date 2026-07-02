import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { atomicWriteJson } from './lib.js'

const candidates = [
  'package-lock.json', 'config/token.config.json', 'config/project.config.json',
  'public/token-metadata.json', 'public/tokenlucid-token.svg', 'public/tokenlucid-token-512.png',
  'output/pdf/tokenlucid-whitepaper.pdf', 'output/pdf/tokenlucid-whitepaper-en.pdf',
  'deployment/mainnet-beta.json',
]
const files = candidates.filter(file => fs.existsSync(path.resolve(file))).map(file => ({
  file: file.replaceAll('\\', '/'),
  bytes: fs.statSync(path.resolve(file)).size,
  sha256: crypto.createHash('sha256').update(fs.readFileSync(path.resolve(file))).digest('hex'),
}))
atomicWriteJson('output/security/release-manifest.json', { generatedAt: new Date().toISOString(), files })
console.log(JSON.stringify({ files: files.length, output: 'output/security/release-manifest.json' }))
