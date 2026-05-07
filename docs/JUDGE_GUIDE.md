# Judge Guide

## What To Open First

1. `/` - gate moment: over-cap request denied before spend
2. `/credit` - product demo screen
3. `npm run verify:credit` - local semantic replay
4. `npm run verify:storage` - 0G Storage download + onchain root replay
5. `src/credit/mainnet-anchors.json` - full 0G mainnet tx packet

## What This Proves

CreditGate proves that an autonomous agent's public signed history can control future authority.

The V2 demo compares two agents. YieldScout receives a `73/100` credit score and a `$500` spend cap. DriftBot receives a `41/100` credit score and a `$150` spend cap. Both over-cap attempts are refused before spend and recorded as `MANDATE_REFUSED`; under-cap requests are allowed as `DELEGATION_USED`. The complete portfolio record is also retrievable from 0G Storage and linked back to the same 0G mainnet registry.

## What Makes It Different

Many projects show agents acting. This one shows agents being underwritten differently and denied when their history does not justify the requested authority.

The refusal is the point: autonomous agents need public accountability before they receive spend power.

## Current State

The 0G mainnet registry is deployed and seeded:

- Contract: `0xd65BE781fF6e6b8Dd514Aa4A13EfD3860a509854`
- Explorer: `https://chainscan.0g.ai/address/0xd65BE781fF6e6b8Dd514Aa4A13EfD3860a509854`
- Live app: `https://creditgate.vercel.app`
- Mainnet evidence: 13 confirmed transactions, including deploy, two full underwriting loops, one Storage upload, and one Storage-root anchor

The local verifier should print `CREDITGATE_PORTFOLIO_VALID`.

The Storage verifier should print `CREDITGATE_STORAGE_VALID`.
