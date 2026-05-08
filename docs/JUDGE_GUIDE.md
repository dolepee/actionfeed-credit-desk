# Judge Guide

## What To Open First

1. `/` - gate moment: over-cap request denied before spend
2. `/credit` - product demo screen
3. `npm run verify:credit` - local semantic replay
4. `npm run verify:compute` - Compute risk-review hash/inclusion replay
5. `npm run verify:storage` - 0G Storage download + onchain root replay
6. `npm run verify:mainnet` - live 0G event/state replay
7. `npm run demo:agent-loop -- --json` - fresh runtime-generated signed episode
8. `npm run credit:ingest -- --file <json>` - score a pasted/uploaded signed history
9. `npm run openclaw:demo` - OpenClaw-compatible module loop
10. `src/credit/mainnet-anchors.json` - full 0G mainnet tx packet

## What This Proves

CreditGate proves that an autonomous agent's public signed history can control future authority.

The V2 demo compares two agents. YieldScout receives a `73/100` credit score and a `$500` spend cap. DriftBot receives a `41/100` credit score and a `$150` spend cap. Compute review records add risk context without replacing deterministic scoring. Both over-cap attempts are refused before spend and recorded as `MANDATE_REFUSED`; under-cap requests are allowed as `DELEGATION_USED`. The onchain registry stores active mandate root/cap/expiry and rejects delegation use when the mandate is missing, mismatched, expired, or over cap. The complete portfolio record is also retrievable from 0G Storage and linked back to the same 0G mainnet registry.

## What Makes It Different

Many projects show agents acting. This one shows agents being underwritten differently and denied when their history does not justify the requested authority.

The refusal is the point: autonomous agents need public accountability before they receive spend power.

## Current State

The 0G mainnet registry is deployed and seeded:

- Contract: `0x3A4f5a2F65119b7C1d13914fC3875348392eDa7d`
- Explorer: `https://chainscan.0g.ai/address/0x3A4f5a2F65119b7C1d13914fC3875348392eDa7d`
- Live app: `https://creditgate.vercel.app`
- Mainnet evidence: 13 confirmed transactions, including deploy, two full underwriting loops, one Storage upload, and one Storage-root anchor

The local verifier should print `CREDITGATE_PORTFOLIO_VALID`.

The Compute verifier should print `CREDITGATE_COMPUTE_VALID`. Until the Compute wallet is funded, it uses a clearly labeled fixture artifact; after funding, `npm run compute:review` replaces it with live 0G Compute review records.

The Storage verifier should print `CREDITGATE_STORAGE_VALID`.

The mainnet verifier should print `CREDITGATE_MAINNET_VALID`.

The runtime loop should print `CREDITGATE_RUNTIME_LOOP_VALID`, and the OpenClaw-compatible module should print `OPENCLAW_CREDITGATE_RUNTIME_VALID`.
