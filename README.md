# BillShield

Approve, review, or block invoices in one onchain AI decision.

Contract: [https://studio.genlayer.com/contracts?import-contract=0x929306EBd56BA813119bb2C60bDEF1059f399467](https://studio.genlayer.com/contracts?import-contract=0x929306EBd56BA813119bb2C60bDEF1059f399467)

## What it does

Paste an invoice request plus internal policy. The intelligent contract returns a wallet-signed treasury verdict with reasons and the next move.

## Why GenLayer

Clear AI use: subjective treasury screening happens inside the contract.
Fast demo loop: paste invoice, sign transaction, get decision.
Easy to understand in under one minute.

## Contract mode

- Non-comparative equivalence

## Browser wallet flow

1. Open the app in a browser with the GenLayer Studio wallet available.
2. Paste the case input plus policy or rubric context.
3. Sign with the browser wallet and let the intelligent contract return the decision onchain.

## Local run

1. `pnpm install`
2. `pnpm dev`
3. Keep `.env.local` pointed at Studionet and the deployed contract address.

## Deployed contract

- Address: `0x929306EBd56BA813119bb2C60bDEF1059f399467`
- Studio import: [https://studio.genlayer.com/contracts?import-contract=0x929306EBd56BA813119bb2C60bDEF1059f399467](https://studio.genlayer.com/contracts?import-contract=0x929306EBd56BA813119bb2C60bDEF1059f399467)
