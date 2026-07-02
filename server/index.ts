import 'dotenv/config'
import express from 'express'
import helmet from 'helmet'
import { rateLimit } from 'express-rate-limit'
import { z } from 'zod'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'
import { scanMint } from './solana.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const tokenConfig = JSON.parse(await fs.promises.readFile(path.join(root, 'config/token.config.json'), 'utf8')) as { name: string; symbol: string; decimals: number; supply: number }
const projectConfig = JSON.parse(await fs.promises.readFile(path.join(root, 'config/project.config.json'), 'utf8')) as {
  status: string; mintAddress: string; devnetMintAddress?: string; officialWebsite: string; englishWhitepaperUrl: string
  circulatingSupply: { amount: number; asOfUtc: string; methodologyUrl: string }
}
if (projectConfig.status === 'launched' && (
  !/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(projectConfig.mintAddress)
  || !projectConfig.circulatingSupply.asOfUtc
  || projectConfig.officialWebsite.includes('YOUR_DOMAIN')
)) throw new Error('Launched durumu için gerçek mint, dolaşım zamanı ve resmî alan adı zorunludur.')
const app = express()
const port = Number(process.env.PORT || 5173)
const rpcUrls = (process.env.SOLANA_RPC_URLS || process.env.SOLANA_RPC_URL || 'https://solana-rpc.publicnode.com,https://api.mainnet-beta.solana.com')
  .split(',').map(value => value.trim()).filter(Boolean)

if (process.env.TRUST_PROXY === '1') app.set('trust proxy', 1)
app.disable('x-powered-by')
app.use(helmet(process.env.NODE_ENV === 'production'
  ? { crossOriginEmbedderPolicy: false }
  : { contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }))
app.use((_req, res, next) => { res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()'); next() })
app.use(express.json({ limit: '8kb' }))
app.use('/api', rateLimit({ windowMs: 60_000, limit: 30, standardHeaders: 'draft-8', legacyHeaders: false }))

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'tokenlucid-api' }))
app.get('/.well-known/security.txt', (_req, res) => res.type('text/plain').sendFile(path.join(root, 'public', '.well-known', 'security.txt'), { dotfiles: 'allow' }))
app.get('/api/token', (_req, res) => {
  res.set('cache-control', projectConfig.status === 'launched' ? 'public, max-age=300' : 'no-store')
  res.json({
    status: projectConfig.status, name: tokenConfig.name, symbol: tokenConfig.symbol, network: 'solana',
    mintAddress: projectConfig.mintAddress || null, decimals: tokenConfig.decimals,
    devnetMintAddress: projectConfig.devnetMintAddress || null,
    maximumSupply: tokenConfig.supply, totalSupply: projectConfig.status === 'launched' ? tokenConfig.supply : 0,
    circulatingSupply: projectConfig.status === 'launched' && projectConfig.circulatingSupply.asOfUtc ? projectConfig.circulatingSupply.amount : null,
    circulatingSupplyAsOfUtc: projectConfig.circulatingSupply.asOfUtc || null,
    mintAuthority: projectConfig.status === 'launched' ? null : 'planned-revocation-at-genesis',
    freezeAuthority: projectConfig.status === 'launched' ? null : 'planned-revocation-at-genesis',
    website: projectConfig.officialWebsite, whitepaper: projectConfig.englishWhitepaperUrl,
    methodology: projectConfig.circulatingSupply.methodologyUrl,
  })
})
app.get('/api/token/supply/total', (_req, res) => res.type('text/plain').send(projectConfig.status === 'launched' ? String(tokenConfig.supply) : '0'))
app.get('/api/token/supply/max', (_req, res) => res.type('text/plain').send(String(tokenConfig.supply)))
app.get('/api/token/supply/circulating', (_req, res) => {
  if (projectConfig.status !== 'launched' || !projectConfig.circulatingSupply.asOfUtc) { res.status(503).json({ error: 'Circulating supply is not published before launch.' }); return }
  res.type('text/plain').send(String(projectConfig.circulatingSupply.amount))
})
app.post('/api/scan', async (req, res) => {
  const parsed = z.object({ address: z.string().trim().min(32).max(44) }).safeParse(req.body)
  if (!parsed.success) { res.status(400).json({ error: 'Geçerli bir Solana token adresi girin.' }); return }
  try {
    let lastError: unknown
    for (const rpcUrl of rpcUrls) {
      try { res.json(await scanMint(parsed.data.address, rpcUrl)); return }
      catch (error) { lastError = error }
    }
    throw lastError
  }
  catch (error) {
    const message = error instanceof Error ? error.message : 'Analiz tamamlanamadı.'
    const clientError = message.includes('geçerli') || message.includes('mint adresi')
    res.status(clientError ? 400 : 502).json({ error: clientError ? message : 'Solana veri sağlayıcısı şu anda yanıt vermiyor. Lütfen tekrar deneyin.' })
  }
})

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(root, 'dist'), { maxAge: '1h', etag: true }))
  app.get(/.*/, (_req, res) => res.sendFile(path.join(root, 'dist', 'index.html')))
} else {
  const { createServer: createViteServer } = await import('vite')
  const vite = await createViteServer({ root, server: { middlewareMode: true }, appType: 'spa' })
  app.use(vite.middlewares)
}

const host = process.env.HOST || (process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1')
app.listen(port, host, () => console.log(`TokenLucid: http://${host}:${port}`))
