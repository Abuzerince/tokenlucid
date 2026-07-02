import fs from 'node:fs'
import path from 'node:path'
import { Keypair } from '@solana/web3.js'

const dir = path.resolve('.secrets')
const file = path.join(dir, 'devnet-wallet.json')
if (fs.existsSync(file)) throw new Error(`${file} zaten var; üzerine yazılmadı.`)
fs.mkdirSync(dir, { recursive: true })
const wallet = Keypair.generate()
fs.writeFileSync(file, JSON.stringify([...wallet.secretKey]))
console.log(`Devnet cüzdanı: ${wallet.publicKey.toBase58()}`)
console.log(`Gizli dosya: ${file} (git tarafından dışlanır)`)
console.log('Devnet faucet üzerinden bu adrese test SOL gönderin.')
