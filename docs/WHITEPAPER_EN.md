# TokenLucid / TLCD

Version 0.9 - 2 July 2026 - Pre-genesis project paper

> This document is not an offer, prospectus, legal opinion, MiCA filing or promise of returns. TLCD has not been minted or offered to the public. The issuer, registered address and responsible management must be inserted after the legal entity is established and before any regulated publication or admission to trading.

## 1. Executive summary

TokenLucid is a Solana risk-intelligence product that turns verifiable on-chain facts into an explainable report. The initial product reads a token mint account and holder data to identify whether supply can still be increased, accounts can be frozen, supply appears anomalous, or ownership is highly concentrated.

TLCD is a proposed fixed-supply utility token for report credits, monitoring features and verified community contributions. It is not designed to represent equity, debt, profit-sharing, a claim on treasury assets, guaranteed redemption or guaranteed appreciation. The product must provide useful functionality before broad token distribution.

The proposed genesis supply is 10,000,000 TLCD with 6 decimals. Mint authority and freeze authority are permanently revoked in the same atomic Solana transaction that creates immutable Metaplex metadata and the full supply. The supply is delivered directly to a separately controlled custody address. No transfer tax, blacklist, hidden administrator or custom transfer program is used.

## 2. Problem

Solana makes token creation accessible, but users often encounter incomplete metadata, unclear administrator powers, concentrated ownership and promotional claims that are difficult to verify. Explorers expose raw data, yet many users do not understand the consequences of an active mint authority or freeze authority.

Risk scanners can create a second problem when they present one opaque score as proof that an asset is safe. No automated report can establish safety, legality, honest management or future market value. TokenLucid therefore publishes the reason for each score component, identifies unavailable data and directs users to independent explorer evidence.

## 3. Product

The beta scanner accepts a Solana mint address and performs server-side RPC queries. It validates that the address is a real mint, reads supply and authority fields, requests largest token accounts, and returns a structured result. The service does not connect a wallet, request a signature, collect a seed phrase or require registration.

The product roadmap includes liquidity analysis, holder changes, risk alerts, report history, community evidence and a paid API. These items are targets, not completed functionality. Public materials must distinguish current features from roadmap features.

## 4. Explainable risk model

| Signal | Current weight | Meaning |
|---|---:|---|
| Mint authority active | +25 | Total supply may be increased by the authority |
| Freeze authority active | +20 | Token accounts may be frozen by the authority |
| Largest account at least 40% | +30 | Severe single-account concentration indicator |
| Largest account 20% to 39.99% | +18 | Elevated single-account concentration indicator |
| Top five accounts at least 70% | +20 | Severe multi-account concentration indicator |
| Top five accounts 50% to 69.99% | +10 | Elevated multi-account concentration indicator |
| Zero reported supply | +5 | Supply anomaly requiring manual review |

Scores from 0 to 29 are labelled low automated risk, 30 to 59 medium, and 60 to 100 high. A low score is not a security certification or investment recommendation. Exchange wallets, liquidity vaults, vesting contracts and bridges may legitimately create concentration. If the RPC provider rate-limits holder data, the interface displays a partial score and does not pretend that concentration was checked.

## 5. Technical architecture

The website is a React application served by an Express API. RPC credentials remain on the server. API bodies are limited, mint inputs are validated, requests are rate-limited, upstream calls time out, and raw provider errors are not exposed to users. Production responses use security headers and the application never handles a user wallet key.

The TLCD asset uses the classic Solana Token Program and the Metaplex Fungible metadata standard. Avoiding a custom transfer program reduces integration complexity for wallets, explorers, DEXs and custodians. It also means the token itself does not implement fees, blacklist controls, rebasing, reflections or transfer restrictions.

## 6. Genesis security

The deployment tooling applies the following controls:

- exact dependency versions and a committed lockfile;
- explicit mainnet flag, confirmation phrase and one-time payer acknowledgement;
- dedicated HTTPS RPC requirement and genesis-hash network verification;
- expected payer address and separate genesis custody address;
- key file validation and rejection of a mainnet key stored inside the project folder;
- immutable Arweave or IPFS metadata with a precommitted SHA-256 hash;
- a single atomic transaction for mint creation, full supply, immutable metadata and authority revocation;
- transaction-size testing against Solana's 1,232-byte limit;
- finalized commitment and post-transaction reads of supply, decimals, authorities and metadata;
- duplicate-mint prevention and a pending-record recovery procedure.

Setting a Solana authority to `None` permanently removes that role. After successful genesis, no party can increase TLCD supply or freeze TLCD token accounts through the mint.

## 7. Token role and limitations

The intended utility categories are detailed report credits, monitored-address alerts, API usage and rewards for verified research or data contributions. Exact pricing and redemption rules will be published only when the corresponding product feature is operational.

TLCD does not provide voting control over a legal entity, dividends, revenue share, interest, guaranteed buybacks, guaranteed liquidity or a right to redemption. Marketing must not use language such as risk-free, guaranteed return, early buyers win or fixed income.

## 8. Supply and allocation

| Allocation | Share | Tokens | Status before genesis |
|---|---:|---:|---|
| Community contributions | 50% | 5,000,000 | Distribution rules and evidence required |
| Product treasury | 20% | 2,000,000 | Multisig custody required |
| Founder allocation | 15% | 1,500,000 | At least 12-month verifiable lock required |
| Future liquidity | 10% | 1,000,000 | Not circulating until deposited |
| Partnerships | 5% | 500,000 | Not circulating until distributed |
| Total | 100% | 10,000,000 | Fixed maximum supply |

Allocation addresses must be distinct and publicly disclosed. Founder and team tokens must use verifiable vesting rather than a promise in this paper. Treasury custody should use multisig controls. Any change to this allocation before genesis requires an updated paper, configuration hash and legal review.

## 9. Circulating supply

Circulating supply is not automatically equal to total supply. It must exclude locked founder tokens, undistributed treasury and partnership reserves, unused liquidity reserves, and any other provably unavailable balance. Every published figure must include a UTC timestamp, finalized Solana slot, included and excluded addresses, balances, formula and evidence links.

Before a token generation event, circulating supply is zero. After launch, TokenLucid will publish one methodology and use the same figure consistently across its website, explorers and market-data applications. Artificially splitting wallets does not create legitimate circulation.

## 10. Distribution and custody

The one-time transaction payer is not the supply custodian. Genesis sends the supply directly to a separately controlled `genesisCustody` address, preferably a hardware-backed or multisig treasury. The command-line tool intentionally refuses automated mainnet distribution through a JSON private key. Mainnet transfers must be reviewed and signed through the approved custody workflow.

Development-network distribution is idempotent: it reads destination balances and transfers only a verified deficit. This prevents a restart from silently sending the same allocation twice. Production distribution evidence must retain every finalized signature and reconcile the source balance to zero or the declared reserve.

## 11. Product economics

The proposed business model is software-first. Potential revenue sources are paid reports, monitoring subscriptions, API plans and enterprise integrations. Token market price is not a revenue model. Operating costs include hosting, dedicated RPC access, domain and email, security review, legal advice, monitoring and customer support.

The initial EUR 200 budget can support a prototype, domain and small technical expenses, but it cannot provide credible global liquidity, professional legal advice, an independent audit or centralized-exchange readiness. Those gates require separate budgets and must not be hidden from users.

## 12. Market and listing principles

A DEX pool may be created only after legal clearance, final distribution design and publication of the initial-price and liquidity policy. A wrong initial AMM price can cause immediate arbitrage losses. Liquidity ownership, lock or custody must be disclosed accurately.

TokenLucid will not buy fake followers, fabricate volume, wash trade, split wallets to simulate holders, spam listing forms or pay unofficial intermediaries promising guaranteed listings. Major data platforms evaluate liquidity, organic activity, team credibility, product maturity and consistent evidence. Meeting a checklist does not guarantee acceptance.

## 13. Legal and regulatory status

For an EU public offer or admission to trading, Regulation (EU) 2023/1114 (MiCA) Title II may require a legal-person offeror, a compliant crypto-asset white paper, notification to the competent authority, publication and compliant marketing. Exceptions are fact-specific and may disappear when admission to trading is sought. A voluntary paper can also have legal consequences.

This project paper is not the machine-readable iXBRL white paper required for a regulatory filing. The issuer, competent authority, target countries, offer terms, complaint process, conflicts, management details and final environmental disclosures are unresolved. No public sale or admission-to-trading application should occur before qualified counsel completes the classification and filing analysis.

Other jurisdictions, including the United States, may apply securities, commodities, money-transmission, sanctions, consumer-protection, tax and advertising rules. Website availability is not permission to offer the token in every country. Geofencing or exclusions may be required after legal review.

## 14. Sustainability

TLCD uses Solana's proof-of-stake network and introduces no separate consensus system. Solana Foundation's September 2024 report estimated network electricity consumption of 8,755 MWh for 2024 and average transaction energy of 0.00412 Wh. These are Foundation estimates for the network, not TLCD-specific measurements. A final MiCA disclosure must use current data and the applicable methodology under Commission Delegated Regulation (EU) 2025/422.

## 15. Principal risks

- Product risk: scoring errors, RPC outages or incomplete data may produce misleading results.
- Token risk: utility may be delayed or never achieve meaningful demand.
- Market risk: price, liquidity and volume may be extremely volatile or disappear.
- Custody risk: compromised keys or incorrect transfers may cause irreversible loss.
- Distribution risk: concentrated or unlocked allocations can undermine trust and market integrity.
- Regulatory risk: classification, offering and marketing rules can change or differ by country.
- Platform risk: wallets, explorers, DEXs and data providers may flag, hide or reject the token.
- Metadata risk: unavailable gateways can impair display even when content is immutable.
- Operational risk: a small team or limited budget may fail to maintain the service.

## 16. Governance and disclosures still required

Before genesis, this section must identify the legal entity, registered address, management, beneficial ownership, conflicts of interest, advisors, official-domain contact, complaint channel and responsible treasury signers. Public team biographies and independently verifiable professional history improve accountability but do not eliminate risk.

Material incidents, allocation changes, security findings and regulatory developments should be disclosed promptly through the official website and versioned repository. Official links and the final mint address must be consistent across every platform.

## 17. References

1. Regulation (EU) 2023/1114: https://eur-lex.europa.eu/eli/reg/2023/1114
2. ESMA MiCA implementation: https://www.esma.europa.eu/esmas-activities/digital-finance-and-innovation/markets-crypto-assets-regulation-mica
3. Commission Delegated Regulation (EU) 2025/422: https://eur-lex.europa.eu/eli/reg_del/2025/422/oj
4. Solana authority documentation: https://solana.com/docs/tokens/basics/set-authority
5. Metaplex fungible token documentation: https://developers.metaplex.com/tokens/create-a-token
6. CoinGecko listing guide: https://support.coingecko.com/hc/en-us/articles/7291312302617-How-to-List-a-New-Cryptocurrency-on-CoinGecko
7. CoinMarketCap listing criteria: https://support.coinmarketcap.com/hc/en-us/articles/360043659351-Listings-Criteria
8. Phantom token verification: https://help.phantom.com/hc/en-us/articles/36284556853139-What-makes-a-token-appear-as-verified-in-Phantom
9. Solscan token update guideline: https://info.solscan.io/solscan-token-update-guideline
10. DEX Screener token listing: https://docs.dexscreener.com/token-listing
11. Orca Splash Pools: https://docs.orca.so/create/pools/splash
12. Solana energy methodology: https://climate.solana.com/methodology
