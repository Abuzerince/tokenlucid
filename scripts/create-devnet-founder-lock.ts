import fs from 'node:fs'
import path from 'node:path'
import { getAccount, getAssociatedTokenAddress } from '@solana/spl-token'
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, sendAndConfirmTransaction } from '@solana/web3.js'
import { getBN, ICluster, SolanaStreamClient, type ICreateStreamData } from '@streamflow/stream'
import { atomicWriteJson } from './lib.js'

const RPC = 'https://api.devnet.solana.com'
const MINT = new PublicKey('AkGtTz4FgowEznDoxnnRpaVfAuBBKJbdEh8xkDgHA6nQ')
const RECIPIENT = '5tAEAScgLZCpZkPFHLaFGUij18vLY9ELgoXNb98XDyBo'
const FOUNDER_AMOUNT = 1_500_000
const DECIMALS = 6
const UNLOCK_AT = Math.floor(Date.UTC(2027, 6, 2, 0, 0, 0) / 1000)
const recordPath = path.resolve('deployment/devnet-founder-lock.json')

function readKeypair(envName: string) {
  const file = process.env[envName]
  if (!file) throw new Error(`${envName} must point to a keypair JSON file.`)
  const resolved = path.resolve(file)
  if (!fs.existsSync(resolved) || fs.lstatSync(resolved).isSymbolicLink()) throw new Error(`${envName} keypair is missing or unsafe.`)
  const bytes = JSON.parse(fs.readFileSync(resolved, 'utf8')) as unknown
  if (!Array.isArray(bytes) || bytes.length !== 64 || bytes.some(value => !Number.isInteger(value) || value < 0 || value > 255)) throw new Error(`${envName} is not a valid 64-byte keypair.`)
  return Keypair.fromSecretKey(Uint8Array.from(bytes as number[]))
}

const payer = readKeypair('SOLANA_KEYPAIR')
const founder = readKeypair('FOUNDER_KEYPAIR')
const connection = new Connection(RPC, 'finalized')
const founderTokenAccount = await getAssociatedTokenAddress(MINT, founder.publicKey)

if (fs.existsSync(recordPath)) {
  const record = JSON.parse(fs.readFileSync(recordPath, 'utf8')) as { metadataId: string }
  const client = new SolanaStreamClient(RPC, ICluster.Devnet, 'finalized')
  const stream = await client.getOne({ id: record.metadataId })
  console.log(JSON.stringify({ alreadyCreated: true, metadataId: record.metadataId, depositedBaseUnits: stream.depositedAmount.toString(), cliff: stream.cliff, cancelableBySender: stream.cancelableBySender, cancelableByRecipient: stream.cancelableByRecipient, transferableBySender: stream.transferableBySender, transferableByRecipient: stream.transferableByRecipient }, null, 2))
} else {
const founderBalance = await connection.getBalance(founder.publicKey, 'finalized')
let fundingSignature: string | null = null
if (founderBalance < 0.1 * LAMPORTS_PER_SOL) {
  fundingSignature = await sendAndConfirmTransaction(connection, new Transaction().add(SystemProgram.transfer({ fromPubkey: payer.publicKey, toPubkey: founder.publicKey, lamports: Math.round(0.15 * LAMPORTS_PER_SOL) })), [payer], { commitment: 'finalized' })
}

const sourceBefore = await getAccount(connection, founderTokenAccount, 'finalized')
const amount = getBN(FOUNDER_AMOUNT, DECIMALS)
if (sourceBefore.amount !== BigInt(amount.toString())) throw new Error(`Founder balance must be exactly ${FOUNDER_AMOUNT} TLCD before locking.`)

const params: ICreateStreamData = {
  recipient: RECIPIENT,
  tokenId: MINT.toBase58(),
  start: UNLOCK_AT,
  amount,
  period: 1,
  cliff: UNLOCK_AT,
  cliffAmount: amount.subn(1),
  amountPerPeriod: getBN(0.000001, DECIMALS),
  name: 'TLCD founder allocation - 12 month devnet lock',
  canTopup: false,
  canPause: false,
  canUpdateRate: false,
  cancelableBySender: false,
  cancelableByRecipient: false,
  transferableBySender: false,
  transferableByRecipient: false,
  automaticWithdrawal: false,
  withdrawalFrequency: 0,
}

const client = new SolanaStreamClient(RPC, ICluster.Devnet, 'finalized')
const created = await client.create(params, { sender: founder, isNative: false })
const stream = await client.getOne({ id: created.metadataId })
const sourceAfter = await getAccount(connection, founderTokenAccount, 'finalized')
const checks = {
  sourceEmptied: sourceAfter.amount === 0n,
  depositedCorrectly: stream.depositedAmount.toString() === amount.toString(),
  unlockDateCorrect: stream.cliff === UNLOCK_AT,
  senderCannotCancel: stream.cancelableBySender === false,
  recipientCannotCancel: stream.cancelableByRecipient === false,
  senderCannotTransfer: stream.transferableBySender === false,
  recipientCannotTransfer: stream.transferableByRecipient === false,
}
if (Object.values(checks).some(value => !value)) throw new Error(`Founder lock verification failed: ${JSON.stringify(checks)}`)

const record = {
  network: 'devnet', mint: MINT.toBase58(), amountTokens: FOUNDER_AMOUNT, sender: founder.publicKey.toBase58(), recipient: RECIPIENT,
  unlockAtUtc: new Date(UNLOCK_AT * 1000).toISOString(), metadataId: created.metadataId, transaction: created.txId,
  fundingSignature, protocol: 'Streamflow', protocolProgram: client.getProgramId(), createdAt: new Date().toISOString(), checks,
}
atomicWriteJson(recordPath, record)
console.log(JSON.stringify(record, null, 2))
}
