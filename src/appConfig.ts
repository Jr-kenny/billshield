export const appConfig = {
  "slug": "billshield",
  "name": "BillShield",
  "oneLiner": "Approve, review, or block invoices in one onchain AI decision.",
  "pitch": "Paste an invoice request plus internal policy. The intelligent contract returns a wallet-signed treasury verdict with reasons and the next move.",
  "mode": "nonComparative",
  "primaryLabel": "Invoice or expense request",
  "secondaryLabel": "Policy, budget notes, or manager context",
  "primaryPlaceholder": "Vendor: Nova Logistics\nAmount: $48,000\nReason: emergency reroute after supplier failure\nRequested by: ops lead\nSupporting note: ...",
  "secondaryPlaceholder": "Budget rule: any spend above $20k needs CFO signoff unless operations are blocked for more than 24 hours.",
  "task": "Review the invoice request and decide whether treasury should approve, review, or reject it right now.",
  "criteria": "Output must be valid JSON with keys headline, verdict, score, reasons, next_action, proof_of_advantage. verdict must be APPROVE, REVIEW, or REJECT. score must be an integer 0-100. reasons must contain exactly 3 short strings tied to treasury risk or fit.",
  "judgingPoints": [
    "Clear AI use: subjective treasury screening happens inside the contract.",
    "Fast demo loop: paste invoice, sign transaction, get decision.",
    "Easy to understand in under one minute."
  ],
  "theme": {
    "accent": "#ff8a3d",
    "accentSoft": "#ffe2c8",
    "surface": "#fff7ef",
    "ink": "#1d140f"
  },
  "modeLabel": "Non-comparative equivalence"
} as const;
