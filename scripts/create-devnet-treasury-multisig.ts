import fs from 'node:fs'
import path from 'node:path'
import {
  AuthorityType, closeAccount, createAssociatedTokenAccount, createMultisig, createTransferCheckedInstruction,
  getAccount, getAssociatedTokenAddress, getMultisig, setAuthority, TOKEN_PROGRAM_ID, transferChecked,
} from '@solana/spl-token'
import { Connection, Keypair, PublicKey, Transaction, sendAndConfirmTransaction } from '@solana/web3.js'
import { atomicWriteJson } from './lib.js'

const RPC = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com'
const MINT = new PublicKey('AkGtTz4FgowEznDoxnnRpaVfAuBBKJbdEh8xkDgHA6nQ')
const EXPECTED_TREASURY = 2_000_000_000_000n
const recordPath = path.resolve('deployment/devnet-treasury-multisig.json')
const signerDir = path.resolve('.secrets/devnet-treasury-multisig')

function readKeypair(envName: string) {
  const file = process.env[envName]
  if (!file) throw new Error(`${envName} must point to a keypair JSON file.`)
  const resolved = path.resolve(file)
  if (!fs.existsSync(resolved) || fs.lstatSync(resolved).isSymbolicLink()) throw new Error(`${envName} keypair is missing or unsafe.`)
  const bytes = JSON.parse(fs.readFileSync(resolved, 'utf8')) as unknown
  if (!Array.isArray(bytes) || bytes.length !== 64 || bytes.some(value => !Number.isInteger(value) || value < 0 || value > 255)) throw new Error(`${envName} is not a valid 64-byte keypair.`)
  return Keypair.fromSecretKey(Uint8Array.from(bytes as number[]))
}

function writeSigner(name: string, signer: Keypair) {
  fs.writeFileSync(path.join(signerDir, `${name}.json`), JSON.stringify([...signer.secretKey]), { encoding: 'utf8', mode: 0o600 })
}

const payer = readKeypair('SOLANA_KEYPAIR')
const treasuryOwner = readKeypair('TREASURY_KEYPAIR')
const connection = new Connection(RPC, 'finalized')
const treasuryTokenAccount = await getAssociatedTokenAddress(MINT, treasuryOwner.publicKey)

if (fs.existsSync(recordPath)) {
  const record = JSON.parse(fs.readFileSync(recordPath, 'utf8')) as { multisig: string }
  const multisig = await getMultisig(connection, new PublicKey(record.multisig), 'finalized', TOKEN_PROGRAM_ID)
  const treasury = await getAccount(connection, treasuryTokenAccount, 'finalized', TOKEN_PROGRAM_ID)
  console.log(JSON.stringify({ alreadyCreated: true, multisig: record.multisig, requiredSignatures: multisig.m, signerCount: multisig.n, treasuryOwner: treasury.owner.toBase58(), treasuryBaseUnits: treasury.amount.toString() }, null, 2))
} else {
  const before = await getAccount(connection, treasuryTokenAccount, 'finalized', TOKEN_PROGRAM_ID)
  if (!before.owner.equals(treasuryOwner.publicKey) || before.amount !== EXPECTED_TREASURY) throw new Error('Treasury owner or balance does not match the verified allocation.')
  if (fs.existsSync(signerDir)) throw new Error('Multisig signer directory already exists without a deployment record; refusing to overwrite.')
  fs.mkdirSync(signerDir, { recursive: true })
  const signers = [Keypair.generate(), Keypair.generate(), Keypair.generate()]
  signers.forEach((signer, index) => writeSigner(`signer-${index + 1}`, signer))

  const multisig = await createMultisig(connection, payer, signers.map(signer => signer.publicKey), 2, undefined, { commitment: 'finalized' }, TOKEN_PROGRAM_ID)
  const authoritySignature = await setAuthority(connection, payer, treasuryTokenAccount, treasuryOwner, AuthorityType.AccountOwner, multisig, [], { commitment: 'finalized' }, TOKEN_PROGRAM_ID)
  const afterAuthority = await getAccount(connection, treasuryTokenAccount, 'finalized', TOKEN_PROGRAM_ID)
  if (!afterAuthority.owner.equals(multisig)) throw new Error('Treasury token account owner was not changed to the multisig.')

  const testRecipient = Keypair.generate()
  const testTokenAccount = await createAssociatedTokenAccount(connection, payer, MINT, testRecipient.publicKey, undefined, TOKEN_PROGRAM_ID)
  let oneSignerRejected = false
  try {
    const oneSignerInstruction = createTransferCheckedInstruction(treasuryTokenAccount, MINT, testTokenAccount, multisig, 1_000_000n, 6, [signers[0].publicKey], TOKEN_PROGRAM_ID)
    await sendAndConfirmTransaction(connection, new Transaction().add(oneSignerInstruction), [payer, signers[0]], { commitment: 'finalized' })
  } catch {
    oneSignerRejected = true
  }
  if (!oneSignerRejected) throw new Error('Security failure: a one-signer treasury transfer was accepted.')

  const outbound = await transferChecked(connection, payer, treasuryTokenAccount, MINT, testTokenAccount, multisig, 1_000_000n, 6, [signers[0], signers[1]], { commitment: 'finalized' }, TOKEN_PROGRAM_ID)
  const inbound = await transferChecked(connection, payer, testTokenAccount, MINT, treasuryTokenAccount, testRecipient, 1_000_000n, 6, [], { commitment: 'finalized' }, TOKEN_PROGRAM_ID)
  const close = await closeAccount(connection, payer, testTokenAccount, payer.publicKey, testRecipient, [], { commitment: 'finalized' }, TOKEN_PROGRAM_ID)
  const finalTreasury = await getAccount(connection, treasuryTokenAccount, 'finalized', TOKEN_PROGRAM_ID)
  const multisigInfo = await getMultisig(connection, multisig, 'finalized', TOKEN_PROGRAM_ID)
  const checks = {
    thresholdIsTwoOfThree: multisigInfo.m === 2 && multisigInfo.n === 3,
    oneSignerRejected,
    twoSignersAccepted: finalTreasury.amount === EXPECTED_TREASURY,
    treasuryOwnedByMultisig: finalTreasury.owner.equals(multisig),
  }
  if (Object.values(checks).some(value => !value)) throw new Error(`Treasury multisig verification failed: ${JSON.stringify(checks)}`)

  const record = {
    network: 'devnet', mint: MINT.toBase58(), treasuryTokenAccount: treasuryTokenAccount.toBase58(), multisig: multisig.toBase58(),
    threshold: 2, signerAddresses: signers.map(signer => signer.publicKey.toBase58()), authoritySignature,
    transferTest: { amountTokens: 1, outbound, inbound, close }, checks, createdAt: new Date().toISOString(),
  }
  atomicWriteJson(recordPath, record)
  console.log(JSON.stringify(record, null, 2))
}
