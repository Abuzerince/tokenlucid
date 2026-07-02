import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { Connection, Keypair, PublicKey } from '@solana/web3.js'

export type TokenConfig = {
  name: string; symbol: string; decimals: number; supply: number; description: string
  metadataUri: string; metadataSha256: string; expectedMainnetPayer: string; genesisCustody: string; mainnetReady: boolean
  allocations: Array<{ name: string; percent: number; address: string }>
}

const GENESIS_HASHES = {
  'mainnet-beta': '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d',
  devnet: 'EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG',
} as const

export function loadConfig(): TokenConfig {
  return JSON.parse(fs.readFileSync(path.resolve('config/token.config.json'), 'utf8')) as TokenConfig
}

export function loadKeypair(mainnet = false): Keypair {
  const keypairPath = process.env.SOLANA_KEYPAIR
  if (!keypairPath) throw new Error('SOLANA_KEYPAIR ortam değişkeni bir cüzdan JSON dosyasını göstermeli.')
  const resolved = path.resolve(keypairPath)
  if (!fs.existsSync(resolved)) throw new Error(`Cüzdan dosyası bulunamadı: ${resolved}`)
  if (fs.lstatSync(resolved).isSymbolicLink()) throw new Error('Güvenlik için sembolik bağlantı cüzdan dosyaları reddedilir.')
  if (mainnet) {
    const root = `${path.resolve('.')}${path.sep}`.toLowerCase()
    if (resolved.toLowerCase().startsWith(root)) throw new Error('Ana ağ cüzdan dosyası proje klasörü dışında, çevrimdışı ve güvenli bir konumda olmalıdır.')
  }
  const secret = JSON.parse(fs.readFileSync(resolved, 'utf8')) as unknown
  if (!Array.isArray(secret) || secret.length !== 64 || secret.some(value => !Number.isInteger(value) || value < 0 || value > 255)) {
    throw new Error('Cüzdan dosyası tam olarak 64 geçerli byte içermelidir.')
  }
  return Keypair.fromSecretKey(Uint8Array.from(secret as number[]))
}

export function networkSettings() {
  const mainnet = process.argv.includes('--mainnet')
  const configured = process.env.SOLANA_RPC_URL?.trim()
  if (mainnet && !configured) throw new Error('Ana ağ işlemleri için özel SOLANA_RPC_URL zorunludur; ücretsiz ortak RPC kullanılmaz.')
  const rpc = configured || 'https://api.devnet.solana.com'
  if (!rpc.startsWith('https://')) throw new Error('RPC adresi HTTPS olmalıdır.')
  return { mainnet, rpc, cluster: mainnet ? 'mainnet-beta' as const : 'devnet' as const }
}

export async function assertRpcNetwork(connection: Connection, cluster: keyof typeof GENESIS_HASHES) {
  const actual = await connection.getGenesisHash()
  if (actual !== GENESIS_HASHES[cluster]) throw new Error(`RPC yanlış ağa bağlı. Beklenen ${cluster} genesis hash bulunamadı.`)
}

export function requireMainnetSafety(config: TokenConfig, mainnet: boolean) {
  if (!mainnet) return
  if (!config.mainnetReady) throw new Error('config/token.config.json içinde mainnetReady=true olmadan ana ağ işlemi yapılamaz.')
  const marker = process.argv.find(arg => arg.startsWith('--confirm-mainnet='))?.split('=')[1]
  if (marker !== 'TLCD_FIXED_SUPPLY') throw new Error('Ana ağ için --confirm-mainnet=TLCD_FIXED_SUPPLY gerekli.')
  if (!process.argv.includes('--allow-one-time-key=TLCD_EPHEMERAL_PAYER')) throw new Error('Ana ağ için --allow-one-time-key=TLCD_EPHEMERAL_PAYER gerekli.')
}

export function isImmutableAssetUri(uri: string) {
  try {
    const parsed = new URL(uri)
    if (parsed.protocol !== 'https:') return false
    if (parsed.hostname === 'arweave.net') return /^\/[A-Za-z0-9_-]{43}$/.test(parsed.pathname)
    return /\/ipfs\/(bafy[a-z2-7]{20,}|Qm[1-9A-HJ-NP-Za-km-z]{44})(?:\/|$)/.test(parsed.pathname)
  } catch { return false }
}

export function validateConfig(config: TokenConfig, mainnet = false): string[] {
  const errors: string[] = []
  if (!config.name?.trim() || !/^[A-Z0-9]{2,10}$/.test(config.symbol ?? '')) errors.push('Token adı ve 2-10 karakterlik sembol zorunludur.')
  if (Buffer.byteLength(config.name ?? '', 'utf8') > 32) errors.push('Token adı UTF-8 olarak en fazla 32 byte olabilir.')
  if (Buffer.byteLength(config.symbol ?? '', 'utf8') > 10) errors.push('Token sembolü UTF-8 olarak en fazla 10 byte olabilir.')
  if (!config.description?.trim() || config.description.length > 1000) errors.push('Açıklama zorunlu ve en fazla 1000 karakter olmalıdır.')
  if (Buffer.byteLength(config.metadataUri ?? '', 'utf8') > 200) errors.push('Metadata URI UTF-8 olarak en fazla 200 byte olabilir.')
  if (!Number.isInteger(config.decimals) || config.decimals < 0 || config.decimals > 9) errors.push('Decimals 0-9 arasında bir tam sayı olmalıdır.')
  if (!Number.isSafeInteger(config.supply) || config.supply <= 0) errors.push('Arz pozitif ve güvenli bir tam sayı olmalıdır.')
  else if (BigInt(config.supply) * 10n ** BigInt(config.decimals) > 18_446_744_073_709_551_615n) errors.push('Ondalıklı toplam arz SPL Token u64 sınırını aşamaz.')
  const allocations = Array.isArray(config.allocations) ? config.allocations : []
  if (allocations.length === 0) errors.push('En az bir dağıtım kalemi zorunludur.')
  const total = allocations.reduce((sum, item) => sum + item.percent, 0)
  if (total !== 100) errors.push(`Dağıtım yüzdeleri 100 olmalı; mevcut toplam ${total}.`)
  if (allocations.some(item => !item.name?.trim() || !Number.isInteger(item.percent) || item.percent <= 0)) errors.push('Dağıtım adları dolu, yüzdeleri pozitif tam sayı olmalıdır.')
  if (new Set(allocations.map(item => item.name)).size !== allocations.length) errors.push('Dağıtım adları benzersiz olmalıdır.')
  if (mainnet && allocations.some(item => !isPublicKey(item.address))) errors.push('Ana ağ için tüm dağıtım cüzdanları geçerli olmalıdır.')
  if (mainnet && new Set(allocations.map(item => item.address)).size !== allocations.length) errors.push('Ana ağda her dağıtım kalemi farklı bir cüzdan kullanmalıdır.')
  if (mainnet && !isPublicKey(config.expectedMainnetPayer)) errors.push('Ana ağ için expectedMainnetPayer geçerli bir Solana adresi olmalıdır.')
  if (mainnet && !isPublicKey(config.genesisCustody)) errors.push('Ana ağ için genesisCustody geçerli bir Solana saklama adresi olmalıdır.')
  if (mainnet && config.genesisCustody === config.expectedMainnetPayer) errors.push('Ana ağ saklama cüzdanı tek kullanımlık işlem cüzdanından farklı olmalıdır.')
  if (mainnet && !isImmutableAssetUri(config.metadataUri)) errors.push('Ana ağ metadata URI, içerik adresli Arweave veya IPFS HTTPS adresi olmalıdır.')
  if (mainnet && !/^[a-f0-9]{64}$/i.test(config.metadataSha256 ?? '')) errors.push('Ana ağ için metadataSha256 zorunludur.')
  return errors
}

export function allocationBaseUnits(config: TokenConfig) {
  const total = BigInt(config.supply) * 10n ** BigInt(config.decimals)
  const amounts = config.allocations.map(item => total * BigInt(item.percent) / 100n)
  if (amounts.reduce((sum, value) => sum + value, 0n) !== total) throw new Error('Dağıtım yüzdeleri baz birimlerde toplam arza tam bölünmüyor.')
  return { total, amounts }
}

export function assertExpectedPayer(config: TokenConfig, payer: Keypair, mainnet: boolean) {
  if (mainnet && payer.publicKey.toBase58() !== config.expectedMainnetPayer) throw new Error('İmzalayan cüzdan expectedMainnetPayer ile eşleşmiyor.')
}

export function assertFreshDeployment(cluster: string) {
  for (const file of [`deployment/${cluster}.json`, `deployment/${cluster}.pending.json`]) {
    if (fs.existsSync(path.resolve(file))) throw new Error(`${file} zaten var. İkinci mint oluşturmayı önlemek için işlem durduruldu.`)
  }
}

export function atomicWriteJson(file: string, value: unknown) {
  const target = path.resolve(file)
  fs.mkdirSync(path.dirname(target), { recursive: true })
  const temporary = `${target}.${process.pid}.tmp`
  fs.writeFileSync(temporary, JSON.stringify(value, null, 2), { encoding: 'utf8', mode: 0o600 })
  fs.renameSync(temporary, target)
}

export function configSha256(config: TokenConfig) {
  return crypto.createHash('sha256').update(JSON.stringify(config)).digest('hex')
}

export async function verifyRemoteMetadata(config: TokenConfig) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10_000)
  try {
    const response = await fetch(config.metadataUri, { signal: controller.signal, redirect: 'error' })
    if (!response.ok) throw new Error(`Metadata alınamadı: HTTP ${response.status}`)
    const declared = Number(response.headers.get('content-length') || 0)
    if (declared > 65_536) throw new Error('Metadata 64 KB sınırını aşıyor.')
    const bytes = new Uint8Array(await response.arrayBuffer())
    if (bytes.length > 65_536) throw new Error('Metadata 64 KB sınırını aşıyor.')
    const hash = crypto.createHash('sha256').update(bytes).digest('hex')
    if (hash.toLowerCase() !== config.metadataSha256.toLowerCase()) throw new Error('Metadata SHA-256 yapılandırmayla eşleşmiyor.')
    const metadata = JSON.parse(new TextDecoder().decode(bytes)) as Record<string, unknown>
    if (metadata.name !== config.name || metadata.symbol !== config.symbol || metadata.description !== config.description) throw new Error('Metadata içeriği token yapılandırmasıyla eşleşmiyor.')
    if (typeof metadata.image !== 'string' || !isImmutableAssetUri(metadata.image)) throw new Error('Metadata görseli de içerik adresli Arweave/IPFS URI olmalıdır.')
    return hash
  } finally { clearTimeout(timeout) }
}

function isPublicKey(value: string) {
  try { return new PublicKey(value).toBase58() === value } catch { return false }
}
