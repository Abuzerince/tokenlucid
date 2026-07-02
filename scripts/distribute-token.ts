import fs from 'node:fs'
import path from 'node:path'
import { getAccount, getAssociatedTokenAddress, getMint, getOrCreateAssociatedTokenAccount, TOKEN_PROGRAM_ID, transferChecked } from '@solana/spl-token'
import { Connection, PublicKey } from '@solana/web3.js'
import {
  allocationBaseUnits, assertExpectedPayer, assertRpcNetwork, atomicWriteJson, genesisConfigSha256, loadConfig, loadKeypair,
  networkSettings, requireMainnetSafety, validateConfig,
} from './lib.js'

const config = loadConfig()
const { mainnet, rpc, cluster } = networkSettings()
requireMainnetSafety(config, mainnet)
if (mainnet) throw new Error('Ana ağ dağıtımı JSON özel anahtarla otomatik yapılmaz. Arz genesisCustody adresine gider; dağıtım Phantom/donanım cüzdanı veya multisig ile imzalanmalıdır.')
const configErrors = validateConfig(config, mainnet)
if (config.allocations.some(item => !isPublicKey(item.address))) configErrors.push('Tüm dağıtım cüzdanları geçerli Solana adresleri olmalıdır.')
if (new Set(config.allocations.map(item => item.address)).size !== config.allocations.length) configErrors.push('Her dağıtım kalemi farklı bir cüzdan kullanmalıdır.')
if (configErrors.length) throw new Error(`Dağıtım yapılandırma hataları:\n- ${configErrors.join('\n- ')}`)

const recordPath = path.resolve(`deployment/${cluster}.json`)
if (!fs.existsSync(recordPath)) throw new Error(`${recordPath} bulunamadı.`)
const record = JSON.parse(fs.readFileSync(recordPath, 'utf8')) as { mint: string; genesisConfigSha256?: string }
if (record.genesisConfigSha256 !== genesisConfigSha256(config)) throw new Error('Token oluşturulduktan sonra değişmez genesis yapılandırması değişmiş. Güvenlik için dağıtım durduruldu.')

const payer = loadKeypair(mainnet)
assertExpectedPayer(config, payer, mainnet)
const connection = new Connection(rpc, 'finalized')
await assertRpcNetwork(connection, cluster)
const mint = new PublicKey(record.mint)
const mintInfo = await getMint(connection, mint, 'finalized', TOKEN_PROGRAM_ID)
const { total: totalUnits, amounts: expectedAmounts } = allocationBaseUnits(config)
if (mintInfo.supply !== totalUnits || mintInfo.decimals !== config.decimals || mintInfo.mintAuthority || mintInfo.freezeAuthority) {
  throw new Error('Mint arzı, decimals veya iptal edilmiş yetkiler beklenen güvenli durumla eşleşmiyor.')
}

const source = await getAssociatedTokenAddress(mint, payer.publicKey, false, TOKEN_PROGRAM_ID)
const sourceBefore = await getAccount(connection, source, 'finalized', TOKEN_PROGRAM_ID)
const journalPath = path.resolve(`deployment/${cluster}-distribution.json`)
const journal = fs.existsSync(journalPath)
  ? JSON.parse(fs.readFileSync(journalPath, 'utf8')) as Array<Record<string, unknown>>
  : []

for (const [index, allocation] of config.allocations.entries()) {
  const owner = new PublicKey(allocation.address)
  const expected = expectedAmounts[index]
  const destination = await getOrCreateAssociatedTokenAccount(
    connection, payer, mint, owner, false, 'finalized',
    { commitment: 'finalized', preflightCommitment: 'finalized' }, TOKEN_PROGRAM_ID,
  )
  const current = (await getAccount(connection, destination.address, 'finalized', TOKEN_PROGRAM_ID)).amount
  if (current > expected) throw new Error(`${allocation.name} cüzdanı beklenen paydan fazla TLCD tutuyor; otomatik işlem durduruldu.`)
  const deficit = expected - current
  if (deficit === 0n) {
    console.log(`${allocation.name}: zincir üstünde tamamlanmış, atlandı.`)
    continue
  }
  const sourceNow = (await getAccount(connection, source, 'finalized', TOKEN_PROGRAM_ID)).amount
  if (sourceNow < deficit) throw new Error(`${allocation.name} için kaynak bakiyesi yetersiz.`)
  const signature = await transferChecked(
    connection, payer, source, mint, destination.address, payer, deficit, config.decimals, [],
    { commitment: 'finalized', preflightCommitment: 'finalized' }, TOKEN_PROGRAM_ID,
  )
  journal.push({ name: allocation.name, percent: allocation.percent, owner: owner.toBase58(), amountBaseUnits: deficit.toString(), signature, finalizedAt: new Date().toISOString() })
  atomicWriteJson(journalPath, journal)
  console.log(`${allocation.name}: %${allocation.percent} tamamlandı (${signature})`)
}

const sourceAfter = await getAccount(connection, source, 'finalized', TOKEN_PROGRAM_ID)
console.log(JSON.stringify({ mint: mint.toBase58(), sourceBefore: sourceBefore.amount.toString(), sourceAfter: sourceAfter.amount.toString(), distributionComplete: sourceAfter.amount === 0n }, null, 2))
if (sourceAfter.amount !== 0n) throw new Error('Dağıtım bitti ancak kaynak cüzdanda TLCD kaldı.')

function isPublicKey(value: string) {
  try { return new PublicKey(value).toBase58() === value } catch { return false }
}
