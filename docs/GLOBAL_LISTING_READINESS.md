# Global listing readiness

Date: 2 July 2026. Platform rules change; re-check every official source immediately before submission.

## Current verdict

The technical token design is compatible with standard Solana wallets, explorers and DEXs: classic SPL Token, 6 decimals, fixed supply, Metaplex Fungible metadata, no transfer tax, no blacklist, immutable metadata, and permanently revoked mint/freeze authorities. It is **not yet eligible for a credible global listing** because the legal entity, public team/contact, real domain, immutable production metadata, independent audit, mainnet mint, liquidity pool, organic market activity and final circulating-supply evidence do not exist yet.

## Platform matrix

| Platform | Key official expectation | Project status | Gate before application |
|---|---|---:|---|
| Phantom | Accurate and consistent name, symbol, logo and metadata; recognition by sources such as Jupiter/CoinGecko helps verification | Technical format ready | Mainnet mint, immutable logo/metadata, Jupiter or CoinGecko recognition |
| Solscan | Working website, official-domain email, public logo, neutral description, valid socials; optional white paper/audit | Partial | Domain/email, English assets, mint, social links, form submission |
| Jupiter | Token API observes mint/freeze status, holder concentration, liquidity, volume and organic activity | Design ready | Pool, distributed holders, organic activity; no wash trading |
| DEX Screener | Automatically indexes after a supported liquidity pool and at least one transaction | Not launched | Create pool and conduct a genuine test swap |
| GeckoTerminal | DEX pool discovery | Not launched | Supported DEX pool and market activity |
| CoinGecko | Actively tradable on a tracked exchange; evaluates liquidity, team presence, maturity, website and security | Not eligible | Product traction, live pool, team/legal identity, complete application |
| CoinMarketCap | Functional website/explorer, material trading on a tracked market, verifiable supply and project representative | Not eligible | Live market/liquidity, supply endpoint, representative and evidence pack |
| Orca | A new token can use a Splash Pool; initial price and deposits must be reviewed carefully; token-list request improves display | Technically compatible | Mainnet mint, price policy, both assets, liquidity budget |
| Coinbase/Kraken | Legal, compliance, technical security, custody, distribution, liquidity, team and market-fit review | Far too early | Legal opinions, audit, substantial traction/liquidity and operational history |

## Mandatory launch order

1. Complete trademark/name/ticker review; the web search found no authoritative TLCD listing conflict, but this is not a legal clearance.
2. Establish the issuer/legal entity and obtain jurisdiction-specific MiCA and other target-market advice.
3. Acquire the official domain, domain email, English site, public repository and official social accounts.
4. Publish immutable English metadata and 512×512 PNG logo on Arweave/IPFS; record SHA-256.
5. Obtain an independent review of the final commit and publish its immutable report.
6. Run devnet rehearsal, then mainnet genesis. The full supply goes directly to `genesisCustody`; the fee payer never holds it.
7. Publish mint, genesis signature, config hash, authority proofs and allocation/vesting wallets.
8. Create the TLCD/USDC pool only after legal clearance. Publish initial-price reasoning and liquidity ownership/lock policy.
9. Execute one small real swap, verify quotes, decimals, deposits/withdrawals and explorer/wallet display.
10. Wait for organic users, holders and volume. Never manufacture volume, holders, reviews or social activity.
11. Submit once to Solscan/Orca, then pursue Jupiter/CoinGecko/CMC using consistent information.
12. Consider CEX applications only after meaningful product and market traction.

## Evidence package to retain

- Final source commit hash and dependency lockfile
- Mainnet mint and transaction signatures
- SHA-256 of token config, metadata, logo, white papers and audit
- Mint/freeze authority proof and immutable metadata proof
- Allocation wallet list, vesting contracts and circulating-supply calculation
- Legal entity records and jurisdictional legal memo
- Domain ownership and official-domain email
- Pool address, liquidity funding source and LP custody/lock policy
- Product usage, holder and volume data with anti-wash-trading statement

## Official sources

- CoinGecko listing: https://support.coingecko.com/hc/en-us/articles/7291312302617-How-to-List-a-New-Cryptocurrency-on-CoinGecko
- CoinGecko rejection factors: https://support.coingecko.com/hc/en-us/articles/4498809321369-Why-is-my-token-not-listed-on-CoinGecko
- CoinMarketCap criteria: https://support.coinmarketcap.com/hc/en-us/articles/360043659351-Listings-Criteria
- Phantom verification: https://help.phantom.com/hc/en-us/articles/36284556853139-What-makes-a-token-appear-as-verified-in-Phantom
- Solscan token update: https://info.solscan.io/solscan-token-update-guideline
- DEX Screener listing: https://docs.dexscreener.com/token-listing
- Jupiter token data: https://dev.jup.ag/api-reference/tokens/v2/category
- Orca Splash Pool: https://docs.orca.so/create/pools/splash
- Coinbase listings: https://www.coinbase.com/listings
- Kraken listings: https://www.kraken.com/get-listed
