# TLCD Devnet Distribution Report

Date: 2 July 2026  
Network: Solana devnet  
Mint: `AkGtTz4FgowEznDoxnnRpaVfAuBBKJbdEh8xkDgHA6nQ`  
Total test supply: 10,000,000 TLCD

These tokens have no monetary value and are used only to test allocation, custody and verification workflows.

| Allocation | Share | Tokens | Owner address | Transaction |
|---|---:|---:|---|---|
| Community contributions | 50% | 5,000,000 | `aiYnFAQH7LbGu9yqTALCtJpVrPjY9UpCGPsd72DzvaY` | `4Qtp7bxniEgnJonBKUBNRPuVGokisRg5A93N8vi7TEuMnseiu95EzxrRvtyy3k6LmVjGn9ni1utNETh8DqNEXWi9` |
| Product treasury | 20% | 2,000,000 | `FByDtjbqibhUoVsXFgis648K7PxRRhPrr9NL4kKitRYX` | `TVQjZ83nPwU4w7akfzURPZxtHrHQYeDHQcPc56STj9sRvEtkATHJkqZYJEZ5PBaXsfqoBzjqMem1kwEhovmgnri` |
| Founder - test lock allocation | 15% | 1,500,000 | `57L9RJyoEoHsnNBgfQPM2sJH3q4Ug3xRLxsEGeJMyy4V` | `3i8rHMZt93FF7b4dUmAVNYZ8tybYb5a5Q9StrSkMFnPLxwQULvToRkByErxTLmLPdas6A1nauuLMbKL241RWCVJt` |
| Future liquidity | 10% | 1,000,000 | `3iX9X128rqiYzjWPXHi1C1UYr1YhXtVzzTm2NvsoNHF8` | `2x1FoBgcqf5oi3ZYtjQgphrcizUn9TDdynzi6fWQbJqi4H8bqgQDJkT4vGeT4QxVg4RZk81861kmsC7mKfZtY41T` |
| Partnerships | 5% | 500,000 | `97KRNJxrkqTQyKB358q5jr5fvzbSNZTfRqxLpVegncSo` | `EWi2bY5UtLhfxiNMmqj9Prw748P7bdX7ZsSoQV7joG6b7JhoRMRcBC7WRzD9G7tBjzeC4e8XuRnq9wrXX5xmMyv` |

Verification after distribution confirmed:

- the source token account balance is zero;
- rerunning the distributor sends no duplicate transfers;
- mint and freeze authorities remain permanently revoked;
- supply, decimals and immutable metadata still match the genesis record.

The founder allocation is not yet enforced by an on-chain vesting program. A separate devnet vesting test is required before any mainnet design is approved.
