# Judge Guide

## What To Open First

1. `/credit` - product demo screen
2. `/proof` - verifier output and root packet
3. `npm run verify:credit` - local replay

## What This Proves

ActionFeed Credit Desk proves that an autonomous agent's public 0G history can control future authority.

The demo agent, YieldScout, receives a `73/100` credit score and a `$500` spend cap. A `$1,200` attempt is refused before spend and recorded as `MANDATE_REFUSED`. A `$250` action is allowed under the same mandate.

## What Makes It Different

Many projects show agents acting. This one shows an agent being denied.

The refusal is the point: autonomous agents need public accountability before they receive spend power.

## Current State

This repo currently contains the local deterministic proof and contract scaffold. The next milestone is 0G mainnet deployment and Storage upload.

