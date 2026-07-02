import fs from 'node:fs'
import path from 'node:path'
import { fetchMetadataFromSeeds, mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata'
import { publicKey } from '@metaplex-foundation/umi'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { getMint, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { Connection, PublicKey } from '@solana/web3.js'
import { assertRpcNetwork, atomicWriteJson, configSha256, loadConfig, networkSettings } from './lib.js'

if (!process.argv.includes('--confirm-recovery=TLCD_PENDING')) throw new Error('Kurtarma için --confirm-recovery=TLCD_PENDING gerekli.')
const config = loadConfig()
const { rpc, cluster } = networkSettings()
const pendingPath = path.resolve(`deployment/${cluster}.pending.json`)
if (!fs.existsSync(pendingPath)) throw new Error('Bekleyen oluşturma kaydı yok.')
const pending = JSON.parse(fs.readFileSync(pendingPath, 'utf8')) as { mint: string; payer: string; custody: string; configSha256: string; createdAt: string; transactionBytes: number }
if (pending.configSha256 !== configSha256(config)) throw new Error('Bekleyen kayıt farklı bir yapılandırmaya ait; dosyayı silmeyin.')

const connection = new Connection(rpc, 'finalized')
await assertRpcNetwork(connection, cluster)
const mintKey = new PublicKey(pending.mint)
if (!await connection.getAccountInfo(mintKey, 'finalized')) {
  fs.rmSync(pendingPath)
  console.log('Atomik işlem zincire ulaşmamış; bekleyen kayıt kaldırıldı. Preflight sonrası güvenle yeniden çalıştırılabilir.')
  process.exit(0)
}

const mint = await getMint(connection, mintKey, 'finalized', TOKEN_PROGRAM_ID)
const expected = BigInt(config.supply) * 10n ** BigInt(config.decimals)
const umi = createUmi(rpc, 'finalized').use(mplTokenMetadata())
const metadata = await fetchMetadataFromSeeds(umi, { mint: publicKey(pending.mint) }, { commitment: 'finalized' })
const checks = {
  supplyCorrect: mint.supply === expected,
  decimalsCorrect: mint.decimals === config.decimals,
  mintAuthorityRevoked: mint.mintAuthority === null,
  freezeAuthorityRevoked: mint.freezeAuthority === null,
  metadataImmutable: metadata.isMutable === false,
  metadataCorrect: metadata.name === config.name && metadata.symbol === config.symbol && metadata.uri === config.metadataUri,
}
if (Object.values(checks).some(value => !value)) throw new Error(`Zincirde mint var fakat güvenli son durum doğrulanamadı. Bekleyen kaydı silmeyin: ${JSON.stringify(checks)}`)
const record = {
  network: cluster, mint: pending.mint, payer: pending.payer, custody: pending.custody, supply: config.supply, decimals: config.decimals,
  mintAuthority: null, freezeAuthority: null, metadataUri: config.metadataUri, metadataImmutable: true,
  configSha256: pending.configSha256, recoveredFromPending: true, transactionBytes: pending.transactionBytes,
  createdAt: pending.createdAt, explorer: `https://explorer.solana.com/address/${pending.mint}?cluster=${cluster}`,
}
atomicWriteJson(`deployment/${cluster}.json`, record)
fs.rmSync(pendingPath)
console.log(JSON.stringify({ recovered: true, record, checks }, null, 2))
