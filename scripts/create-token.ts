import fs from 'node:fs'
import path from 'node:path'
import { fetchMetadataFromSeeds, mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata'
import { keypairIdentity, publicKey } from '@metaplex-foundation/umi'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { LAMPORTS_PER_SOL, Connection, PublicKey } from '@solana/web3.js'
import { getMint, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import {
  assertExpectedPayer, assertFreshDeployment, assertRpcNetwork, atomicWriteJson, configSha256,
  loadConfig, loadKeypair, networkSettings, requireMainnetSafety, validateConfig, verifyRemoteMetadata,
} from './lib.js'
import { buildAtomicGenesis } from './genesis.js'

const config = loadConfig()
const { mainnet, rpc, cluster } = networkSettings()
requireMainnetSafety(config, mainnet)
const configErrors = validateConfig(config, mainnet)
if (configErrors.length) throw new Error(`Yapılandırma hataları:\n- ${configErrors.join('\n- ')}`)
assertFreshDeployment(cluster)

const payer = loadKeypair(mainnet)
assertExpectedPayer(config, payer, mainnet)
const connection = new Connection(rpc, 'finalized')
await assertRpcNetwork(connection, cluster)
const balance = await connection.getBalance(payer.publicKey, 'finalized')
if (balance < 0.05 * LAMPORTS_PER_SOL) throw new Error('Güvenli oluşturma için imzalayan cüzdanda en az 0,05 SOL bulunmalıdır.')
if (mainnet) await verifyRemoteMetadata(config)

const umi = createUmi(rpc, 'finalized').use(mplTokenMetadata())
const umiKeypair = umi.eddsa.createKeypairFromSecretKey(payer.secretKey)
umi.use(keypairIdentity(umiKeypair))
const custody = mainnet ? publicKey(config.genesisCustody) : umi.identity.publicKey
const { mint, amount, transaction, transactionBytes } = buildAtomicGenesis(umi, config, custody)
const mintKey = new PublicKey(mint.publicKey.toString())
const pendingPath = path.resolve(`deployment/${cluster}.pending.json`)
const createdAt = new Date().toISOString()

if (transactionBytes > 1232) throw new Error(`Atomik oluşturma işlemi Solana işlem sınırını aşıyor: ${transactionBytes} byte.`)
atomicWriteJson(pendingPath, {
  network: cluster, mint: mintKey.toBase58(), payer: payer.publicKey.toBase58(), custody: custody.toString(),
  status: 'atomic-transaction-prepared', transactionBytes, configSha256: configSha256(config), createdAt,
})

console.log(`${cluster}: ${config.name} tek atomik işlemle oluşturuluyor...`)
const sent = await transaction.sendAndConfirm(umi, { confirm: { commitment: 'finalized' } })

const verified = await getMint(connection, mintKey, 'finalized', TOKEN_PROGRAM_ID)
const metadata = await fetchMetadataFromSeeds(umi, { mint: mint.publicKey }, { commitment: 'finalized' })
const checks = {
  supplyCorrect: verified.supply === amount,
  decimalsCorrect: verified.decimals === config.decimals,
  mintAuthorityRevoked: verified.mintAuthority === null,
  freezeAuthorityRevoked: verified.freezeAuthority === null,
  metadataImmutable: metadata.isMutable === false,
  metadataCorrect: metadata.name === config.name && metadata.symbol === config.symbol && metadata.uri === config.metadataUri,
}
if (Object.values(checks).some(value => !value)) throw new Error(`Zincir üstü güvenlik doğrulaması başarısız: ${JSON.stringify(checks)}`)

const record = {
  network: cluster, mint: mintKey.toBase58(), payer: payer.publicKey.toBase58(), custody: custody.toString(),
  supply: config.supply, decimals: config.decimals, mintAuthority: null, freezeAuthority: null,
  metadataUri: config.metadataUri, metadataImmutable: true, configSha256: configSha256(config),
  transactionSignatureBase64: Buffer.from(sent.signature).toString('base64'), transactionBytes, createdAt,
  explorer: `https://explorer.solana.com/address/${mintKey.toBase58()}?cluster=${cluster}`,
}
atomicWriteJson(`deployment/${cluster}.json`, record)
fs.rmSync(pendingPath, { force: true })
console.log(JSON.stringify({ ...record, checks }, null, 2))
