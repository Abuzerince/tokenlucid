import 'dotenv/config'
import { Connection, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { assertExpectedPayer, assertFreshDeployment, assertRpcNetwork, loadConfig, loadKeypair, networkSettings, requireMainnetSafety, validateConfig, verifyRemoteMetadata } from './lib.js'

const config = loadConfig()
const { mainnet, rpc, cluster } = networkSettings()
requireMainnetSafety(config, mainnet)
const errors = validateConfig(config, mainnet)
if (errors.length) throw new Error(`Yapılandırma hataları:\n- ${errors.join('\n- ')}`)

assertFreshDeployment(cluster)
const payer = loadKeypair(mainnet)
assertExpectedPayer(config, payer, mainnet)
const connection = new Connection(rpc, 'finalized')
await assertRpcNetwork(connection, cluster)
if (mainnet) await verifyRemoteMetadata(config)
const balance = await connection.getBalance(payer.publicKey, 'finalized')
console.log(JSON.stringify({
  ready: balance >= 0.05 * LAMPORTS_PER_SOL,
  cluster,
  payer: payer.publicKey.toBase58(),
  balanceSol: balance / LAMPORTS_PER_SOL,
  token: `${config.name} (${config.symbol})`,
  fixedSupply: config.supply,
  metadataUri: config.metadataUri,
  note: balance >= 0.05 * LAMPORTS_PER_SOL ? 'RPC, ağ kimliği, metadata ve cüzdan kontrolleri hazır.' : 'Güvenli oluşturma için bu cüzdanda en az 0,05 SOL bulunmalı.',
}, null, 2))
