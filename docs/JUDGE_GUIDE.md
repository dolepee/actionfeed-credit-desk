# Judge Guide

## What To Open First

1. `/` - gate moment: over-cap request denied before spend
2. `/credit` - product demo screen
3. `npm run verify:credit` - local semantic replay
4. `npm run verify:compute` - Compute risk-review hash/inclusion replay
5. `npm run verify:storage` - 0G Storage download + onchain root replay
6. `npm run verify:mainnet` - live 0G event/state replay
7. `npm run verify:router` - live native 0G refusal/payment replay
8. `npm run demo:agent-loop -- --json` - fresh runtime-generated signed episode
9. `npm run credit:ingest -- --file <json>` - score a pasted/uploaded signed history
10. `npm run openclaw:demo` - OpenClaw-compatible module loop
11. `src/credit/mainnet-anchors.json` - full 0G mainnet tx packet

## What This Proves

CreditGate proves that an autonomous agent's public signed history can control future authority.

The V2 demo compares two agents. YieldScout receives a `73/100` credit score and a `$500` spend cap. DriftBot receives a `41/100` credit score and a `$150` spend cap. Compute review records add risk context without replacing deterministic scoring. Both over-cap attempts are refused before spend and recorded as `MANDATE_REFUSED`; under-cap requests are allowed as `DELEGATION_USED`. The onchain registry stores active mandate root/cap/expiry and rejects delegation use when the mandate is missing, mismatched, expired, or over cap. The router then proves the fund-moving boundary: an over-cap request sends no native value, while an under-cap request sends native 0G and leaves no value trapped in the router. The complete portfolio record is retrievable from 0G Storage and linked back to the same 0G mainnet registry.

## What Makes It Different

Many projects show agents acting. This one shows agents being underwritten differently and denied when their history does not justify the requested authority.

The refusal is the point: autonomous agents need public accountability before they receive spend power.

## Current State

The 0G mainnet registry is deployed and seeded:

- Contract: `0x3A4f5a2F65119b7C1d13914fC3875348392eDa7d`
- Explorer: `https://chainscan.0g.ai/address/0x3A4f5a2F65119b7C1d13914fC3875348392eDa7d`
- Router: `0x7e2FD82AeE9Caa2eB72aBBefa797d9E3298f578b`
- Live app: `https://creditgate.vercel.app`
- Mainnet evidence: 16 confirmed transactions, including registry deploy, two full underwriting loops, one Storage upload, one Storage-root anchor, router deploy, router refusal, and router payment

The local verifier should print `CREDITGATE_PORTFOLIO_VALID`.

The Compute verifier should print `CREDITGATE_COMPUTE_VALID` against the live 0G Compute review records included in the proof packet.

The Storage verifier should print `CREDITGATE_STORAGE_VALID`.

The mainnet verifier should print `CREDITGATE_MAINNET_VALID`.

The router verifier should print `CREDITGATE_ROUTER_VALID`.

The runtime loop should print `CREDITGATE_RUNTIME_LOOP_VALID`, and the OpenClaw-compatible module should print `OPENCLAW_CREDITGATE_RUNTIME_VALID`.
