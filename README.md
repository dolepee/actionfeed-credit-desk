# CreditGate

CreditGate is a 0G-native underwriting and authority gate for autonomous agents.

It reads a signed public agent history, calculates a replayable credit score, grants a bounded spend cap, refuses over-cap actions, stores the canonical proof packet on 0G Storage, and anchors every decision root on 0G Chain.

## 0G APAC Positioning

- **Primary track:** Track 1, Agentic Infrastructure & OpenClaw Lab
- **Secondary fit:** Track 3, Agentic Economy & Autonomous Applications
- **Demo agents:** YieldScout and DriftBot, two OpenClaw-style yield agents with different histories
- **Core claim:** signed 0G history becomes enforceable agent authority

This project is a standalone APAC submission. It uses ActionFeed's signed-history idea as a base, but packages it as a new product with its own repo, UI, verifier, contract, and 0G mainnet proof path.

## Why This Matters

Autonomous agents can already quote, rebalance, and spend. The harder problem is deciding how much authority an agent has earned.

CreditGate gives operators a concrete answer:

1. Read the agent's signed public history.
2. Calculate a deterministic credit score.
3. Grant a bounded mandate.
4. Refuse over-cap actions before spend.
5. Anchor the score, mandate, refusal, and allowed use on 0G.

The product is not a yield agent. YieldScout and DriftBot are sample actors. The product is history-gated authority for any 0G/OpenClaw-style agent.

## Demo Flow

The APAC demo is intentionally short:

1. Open `/credit`.
2. Show `YieldScout` with a `73/100` credit score and `$500` cap.
3. Show `DriftBot` with a `41/100` credit score and `$150` cap.
4. Show both over-cap attempts being refused with `MANDATE_REFUSED`.
5. Show both under-cap actions being allowed with `DELEGATION_USED`.
6. Open `/proof`, run `npm run verify:credit`, then run `npm run verify:storage`.

The comparison is the V2 product moment. Most agent projects show agents acting. CreditGate shows cleaner history earning more authority and weaker history receiving a tighter cap.

## 0G Components

Live submission state:

- Deterministic signed histories for two agents.
- Replayable score, mandate, refusal, and allowed-use roots.
- `AgentCreditRegistry` deployed on 0G mainnet.
- Thirteen confirmed 0G mainnet transactions: deploy, two agent underwriting loops, one Storage upload, and one Storage-root anchor.
- One canonical portfolio proof object uploaded to 0G Storage and anchored back into the mainnet registry.
- `/proof` page with verifier output.

0G integration:

- **0G Chain:** contract events for `AgentRegistered`, `CreditScored`, `MandateGranted`, `MandateRefused`, and `DelegationUsed`.
- **0G Storage:** canonical signed portfolio JSON retrievable by root hash and replayed by `npm run verify:storage`.
- **0G Explorer:** public transaction links for judge verification.
- **Proof roots:** content-addressed JSON roots for the signed history, score, mandate, refusal, and allowed-use receipt.

Live links:

- App: `https://creditgate.vercel.app`
- GitHub: `https://github.com/dolepee/actionfeed-credit-desk`
- 0G contract: `0xd65BE781fF6e6b8Dd514Aa4A13EfD3860a509854`
- 0G explorer: `https://chainscan.0g.ai/address/0xd65BE781fF6e6b8Dd514Aa4A13EfD3860a509854`

Network defaults:

- RPC: `https://evmrpc.0g.ai`
- Chain ID: `16661`
- Explorer: `https://chainscan.0g.ai`

## Architecture

```text
YieldScout + DriftBot
      |
      v
signed action histories
      |
      v
content-addressed proof roots ----+----> canonical portfolio JSON on 0G Storage
      |                            |                         |
      v                            v                         v
Credit score policy          AgentCreditRegistry on 0G Chain  storage root anchor
      |                            |
      v                            v
spend cap + mandate         onchain score/mandate/refusal/use anchors
      |
      v
over-cap request -> MANDATE_REFUSED
under-cap request -> DELEGATION_USED
```

## Local Setup

```bash
npm install
npm run verify:credit
npm run verify:storage
npm run proof:export
npm run openclaw:inspect
npm run typecheck
npm run build
npm run dev
```

Open:

- `http://localhost:3400`
- `http://localhost:3400/credit`
- `http://localhost:3400/proof`

## Verifier

Run:

```bash
npm run verify:credit
```

Expected output:

```text
CREDIT_DESK_PORTFOLIO_VALID
agents: YieldScout, DriftBot
comparison: 73/100 -> $500; 41/100 -> $150
YieldScout refusal: 1200 > 500, no payment broadcast
DriftBot refusal: 500 > 150, no payment broadcast
```

The verifier checks:

- signed history length
- event signatures
- payload hashes
- evidence root
- score policy
- cap policy
- score divergence between clean and weak histories
- mandate root
- over-cap refusal
- `noPaymentBroadcast=true`
- allowed under-cap use

The Storage verifier additionally checks:

- the portfolio proof JSON downloads from 0G Storage
- the downloaded JSON is canonical
- the local object hash matches the stored object hash
- the 0G Chain registry points to the same Storage root
- the downloaded portfolio still passes `CREDIT_DESK_PORTFOLIO_VALID`

## Mainnet Proof

The 0G mainnet contract is deployed and seeded. Judges can verify the live anchors in:

- `src/credit/mainnet-anchors.json`
- `docs/0G_MAINNET_PROOF.json`
- `https://creditgate.vercel.app/proof`

Storage proof:

- 0G Storage root: `0x89364a379ffb896ffcc4042b18faeeb35000548862ad214feb9f7c12d92fbe1f`
- Storage upload tx: `0x937300da7fb5ca718ed4a7ba88bf3506e5e5a6a978bc3637a8e6e5e932a19492`
- Storage root anchor tx: `0x498876ec3eae9ba3cbb3602c8ce6a9f9d8efbc7366d1e46c78a3b42d47a5d541`
- Verifier: `npm run verify:storage`

Deployment commands are kept for reproducibility:

```bash
forge build --root contracts
ZG_PRIVATE_KEY=0x... npm run deploy:mainnet
ZG_PRIVATE_KEY=0x... npm run seed:mainnet
ZG_PRIVATE_KEY=0x... npm run seed:v2-mainnet
ZG_PRIVATE_KEY=0x... npm run storage:upload
```


## One-Liner

CreditGate gives 0G agents a credit history, then turns that history into bounded spend authority.
