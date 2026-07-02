import { mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { keypairIdentity } from '@metaplex-foundation/umi'
import { describe, expect, it } from 'vitest'
import { buildAtomicGenesis } from '../scripts/genesis.js'
import { loadConfig } from '../scripts/lib.js'

describe('atomik TLCD genesis işlemi', () => {
  it('Solana işlem boyutu sınırının içinde kalır', () => {
    const umi = createUmi('https://api.devnet.solana.com').use(mplTokenMetadata())
    umi.use(keypairIdentity(umi.eddsa.generateKeypair()))
    const { amount, transactionBytes } = buildAtomicGenesis(umi, loadConfig())
    expect(amount).toBe(10_000_000_000_000n)
    expect(transactionBytes).toBeLessThanOrEqual(1232)
  })
})
