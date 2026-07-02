import fs from 'node:fs'
import path from 'node:path'
import { fetchMetadataFromSeeds, mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata'
import { publicKey } from '@metaplex-foundation/umi'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { getMint, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { Connection, PublicKey } from '@solana/web3.js'
import { assertRpcNetwork, configSha256, loadConfig, networkSettings, validateConfig, verifyRemoteMetadata } from './lib.js'

const config = loadConfig()
const { mainnet, rpc, cluster } = networkSettings()
const configErrors = validateConfig(config, mainnet)
if (configErrors.length) throw new Error(`Yapılandırma hataları:\n- ${configErrors.join('\n- ')}`)
const recordPath = path.resolve(`deployment/${cluster}.json`)
if (!fs.existsSync(recordPath)) throw new Error(`${recordPath} bulunamadı.`)
const record = JSON.parse(fs.readFileSync(recordPath, 'utf8')) as { mint: string; configSha256: string }

const connection = new Connection(rpc, 'finalized')
await assertRpcNetwork(connection, cluster)
const mintKey = new PublicKey(record.mint)
const mint = await getMint(connection, mintKey, 'finalized', TOKEN_PROGRAM_ID)
const expected = BigInt(config.supply) * 10n ** BigInt(config.decimals)
const umi = createUmi(rpc, 'finalized').use(mplTokenMetadata())
const metadata = await fetchMetadataFromSeeds(umi, { mint: publicKey(record.mint) }, { commitment: 'finalized' })
if (mainnet) await verifyRemoteMetadata(config)

const checks = {
  configUnchanged: record.configSha256 === configSha256(config),
  supplyCorrect: mint.supply === expected,
  decimalsCorrect: mint.decimals === config.decimals,
  mintAuthorityRevoked: mint.mintAuthority === null,
  freezeAuthorityRevoked: mint.freezeAuthority === null,
  metadataImmutable: metadata.isMutable === false,
  metadataNameCorrect: metadata.name === config.name,
  metadataSymbolCorrect: metadata.symbol === config.symbol,
  metadataUriCorrect: metadata.uri === config.metadataUri,
  metadataMintCorrect: metadata.mint.toString() === record.mint,
}
console.log(JSON.stringify({ network: cluster, mint: record.mint, checks }, null, 2))
if (Object.values(checks).some(value => !value)) process.exitCode = 1
