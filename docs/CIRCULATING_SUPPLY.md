# Circulating supply methodology

TLCD maximum and total genesis supply is fixed at 10,000,000 tokens (10,000,000,000,000 base units with 6 decimals). Mint authority is permanently revoked during the same atomic genesis transaction.

## Circulating definition

Circulating supply must be calculated from finalized Solana balances and must exclude, at minimum:

- team/founder tokens subject to vesting;
- treasury tokens not available to the public market;
- partnership reserves not distributed;
- liquidity reserves not yet deposited into a live pool;
- tokens provably locked, escrowed, burned or otherwise unavailable.

The amount must never be inferred from “total supply minus one wallet” without checking every disclosed allocation address. Each publication must state the UTC observation time, finalized slot, included/excluded addresses, balance of each address, calculation formula and evidence links.

Before TGE the circulating supply is 0. After launch, update `config/project.config.json`, publish a signed snapshot, and expose the same number consistently on the website, CoinGecko, CoinMarketCap and all applications. A self-reported amount is not independent verification.
