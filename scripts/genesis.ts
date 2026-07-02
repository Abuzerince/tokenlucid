import { createFungible } from '@metaplex-foundation/mpl-token-metadata'
import { AuthorityType, createTokenIfMissing, findAssociatedTokenPda, mintTokensTo, setAuthority } from '@metaplex-foundation/mpl-toolbox'
import { generateSigner, percentAmount, some, type PublicKey, type Umi } from '@metaplex-foundation/umi'
import type { TokenConfig } from './lib.js'

export function buildAtomicGenesis(umi: Umi, config: TokenConfig, custody: PublicKey = umi.identity.publicKey) {
  const mint = generateSigner(umi)
  const amount = BigInt(config.supply) * 10n ** BigInt(config.decimals)
  const transaction = createFungible(umi, {
    mint, name: config.name, symbol: config.symbol, uri: config.metadataUri,
    sellerFeeBasisPoints: percentAmount(0), decimals: some(config.decimals), isMutable: false,
  })
    .add(createTokenIfMissing(umi, { mint: mint.publicKey, owner: custody }))
    .add(mintTokensTo(umi, {
      mint: mint.publicKey,
      token: findAssociatedTokenPda(umi, { mint: mint.publicKey, owner: custody }),
      amount,
    }))
    .add(setAuthority(umi, { owned: mint.publicKey, owner: umi.identity, authorityType: AuthorityType.FreezeAccount, newAuthority: null }))
    .add(setAuthority(umi, { owned: mint.publicKey, owner: umi.identity, authorityType: AuthorityType.MintTokens, newAuthority: null }))
  return { mint, amount, transaction, transactionBytes: transaction.getTransactionSize(umi) }
}
