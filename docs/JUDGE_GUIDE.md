# Judge Guide

## What To Open First

1. `/credit` - product demo screen
2. `/proof` - verifier output and root packet
3. `npm run verify:credit` - local replay

## What This Proves

CreditGate proves that an autonomous agent's public signed history can control future authority.

The V2 demo compares two agents. YieldScout receives a `73/100` credit score and a `$500` spend cap. DriftBot receives a `41/100` credit score and a `$150` spend cap. Both over-cap attempts are refused before spend and recorded as `MANDATE_REFUSED`; under-cap requests are allowed as `DELEGATION_USED`.

## What Makes It Different

Many projects show agents acting. This one shows agents being underwritten differently and denied when their history does not justify the requested authority.

The refusal is the point: autonomous agents need public accountability before they receive spend power.

## Current State

The 0G mainnet registry is deployed and seeded:

- Contract: `0xd65BE781fF6e6b8Dd514Aa4A13EfD3860a509854`
- Explorer: `https://chainscan.0g.ai/address/0xd65BE781fF6e6b8Dd514Aa4A13EfD3860a509854`
- Live app: `https://creditgate.vercel.app`
- Mainnet evidence: 11 confirmed transactions, including deploy and two full underwriting loops

The local verifier should print `CREDIT_DESK_PORTFOLIO_VALID`.
