# CreditGate

CreditGate is a 0G-native underwriting and authority gate for autonomous agents.

It reads a signed public agent history, calculates a replayable credit score, grants a bounded spend cap, refuses over-cap actions, and anchors every decision root on 0G Chain.

## 0G APAC Positioning

- **Primary track:** Track 1, Agentic Infrastructure & OpenClaw Lab
- **Secondary fit:** Track 3, Agentic Economy & Autonomous Applications
- **Demo agent:** YieldScout, an OpenClaw-style autonomous yield agent
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

The product is not a yield agent. YieldScout is only the sample actor. The product is history-gated authority for any 0G/OpenClaw-style agent.

## Demo Flow

The APAC demo is intentionally short:

1. Open `/credit`.
2. Show `YieldScout` with a `73/100` credit score.
3. Show the authorized cap: `$500`.
4. Show an attempted `$1,200` action.
5. CreditGate refuses the action with `MANDATE_REFUSED`.
6. Show an allowed `$250` action under the same mandate.
7. Open `/proof` or run `npm run verify:credit`.

The refusal is the core product moment. Most agent projects show agents acting. CreditGate shows an agent being denied when its public history does not justify the requested authority.

## 0G Components

Live submission state:

- Deterministic signed agent history.
- Replayable score, mandate, refusal, and allowed-use roots.
- `AgentCreditRegistry` deployed on 0G mainnet.
- Six confirmed 0G mainnet transactions: deploy, register, score, grant, refuse, and allowed use.
- `/proof` page with verifier output.

0G integration:

- **0G Chain:** contract events for `AgentRegistered`, `CreditScored`, `MandateGranted`, `MandateRefused`, and `DelegationUsed`.
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
YieldScout agent
      |
      v
signed action history
      |
      v
content-addressed proof roots ----+
      |                            |
      v                            v
Credit score policy          AgentCreditRegistry on 0G Chain
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
CREDIT_DESK_VALID
agent: YieldScout
score: 73/100
cap: 500 USD
refusal: 1200 > 500, no payment broadcast
allowed use: 250 <= 500
```

The verifier checks:

- signed history length
- event signatures
- payload hashes
- evidence root
- score policy
- cap policy
- mandate root
- over-cap refusal
- `noPaymentBroadcast=true`
- allowed under-cap use

## Mainnet Proof

The 0G mainnet contract is deployed and seeded. Judges can verify the live anchors in:

- `src/credit/mainnet-anchors.json`
- `docs/0G_MAINNET_PROOF.json`
- `https://creditgate.vercel.app/proof`

Deployment commands are kept for reproducibility:

```bash
forge build --root contracts
ZG_PRIVATE_KEY=0x... npm run deploy:mainnet
ZG_PRIVATE_KEY=0x... npm run seed:mainnet
```

Remaining submission tasks:

- Record a sub-3-minute demo video.
- Publish the required X post with `#0GHackathon`, `#BuildOn0G`, `@0G_labs`, `@0g_CN`, `@0g_Eco`, and `@HackQuest_`.

## One-Liner

CreditGate gives 0G agents a credit history, then turns that history into bounded spend authority.
