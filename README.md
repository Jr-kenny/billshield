# BillShield

Approve, review, or block invoices in one onchain AI decision.

Contract: [https://studio.genlayer.com/contracts?import-contract=0x929306EBd56BA813119bb2C60bDEF1059f399467](https://studio.genlayer.com/contracts?import-contract=0x929306EBd56BA813119bb2C60bDEF1059f399467)

## What this app is

BillShield is a treasury decision tool for finance, operations, and treasury teams. Paste an invoice request plus internal policy. The intelligent contract returns a wallet-signed treasury verdict with reasons and the next move.

## The problem it solves

Invoice approvals often stall when the request is urgent, the amount is above a threshold, or the supporting context is incomplete. BillShield compresses that messy judgment call into one signed onchain verdict with reasons that a finance lead can audit.

## How the product works

1. Connect a browser wallet on GenLayer Studionet.
2. Paste invoice or expense request.
3. Paste policy, budget notes, or manager context.
4. Sign one write transaction to the intelligent contract.
5. Wait for the contract to return the structured result.
6. Read the verdict, score, reasons, and next action in the UI.

## What the contract decides

The contract performs this judgment onchain:

> Review the invoice request and decide whether treasury should approve, review, or reject it right now.

Returned fields:

- headline
- verdict
- score
- reasons
- next_action
- proof_of_advantage

The verdict is always APPROVE, REVIEW, or REJECT. The score is an integer from 0 to 100, and the reasons array is always kept short enough to read instantly.

## Why GenLayer is necessary here

The hard part is not storing an invoice. The hard part is turning policy, urgency, spend size, and context into a judgment call that multiple validators can independently reproduce. That subjective reasoning step lives inside the intelligent contract.

Consensus mode: **Non-comparative equivalence**

Validators independently apply the same task and criteria to the case. This keeps the verdict stable when the app is enforcing a policy, gate, or approval rule with a tight output schema.

## Example input shape

Invoice or expense request:

~~~text
Vendor: Nova Logistics
Amount: $48,000
Reason: emergency reroute after supplier failure
Requested by: ops lead
Supporting note: ...
~~~

Policy, budget notes, or manager context:

~~~text
Budget rule: any spend above $20k needs CFO signoff unless operations are blocked for more than 24 hours.
~~~

## Important files

- contracts/billshield.py: intelligent contract
- deploy/001_deploy.mjs: deployment script for Studionet
- src/App.tsx: browser UI
- src/lib/genlayer.ts: wallet connection and contract calls
- src/appConfig.ts: app task, copy, placeholders, and mode

## Run locally

1. pnpm install
2. Ensure .env.local contains VITE_CONTRACT_ADDRESS=0x929306EBd56BA813119bb2C60bDEF1059f399467
3. Ensure .env.local contains VITE_GENLAYER_RPC_URL=https://studio.genlayer.com/api
4. pnpm dev
5. Open the app in a browser with Rabby, MetaMask, or another injected wallet that can switch to GenLayer Studionet.

## Deployed contract

- Address: 0x929306EBd56BA813119bb2C60bDEF1059f399467
- Studio import: [https://studio.genlayer.com/contracts?import-contract=0x929306EBd56BA813119bb2C60bDEF1059f399467](https://studio.genlayer.com/contracts?import-contract=0x929306EBd56BA813119bb2C60bDEF1059f399467)
