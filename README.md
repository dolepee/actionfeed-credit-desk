# CreditGate

CreditGate is a 0G-native credit gate for autonomous agents.

It reads a signed public agent history, calculates a replayable credit score, grants a bounded spend cap, refuses over-cap actions, stores the canonical proof packet on 0G Storage, and enforces active mandates on 0G Chain.

## 0G APAC Positioning

- **Primary track:** Track 1, Agentic Infrastructure & OpenClaw Lab
- **Secondary fit:** Track 3, Agentic Economy & Autonomous Applications
- **Demo agents:** YieldScout and DriftBot, two OpenClaw-style yield agents with different histories
- **Core claim:** signed 0G history becomes enforceable spend authority

This project is a standalone APAC submission with its own repo, UI, verifier, contract, Storage proof object, and 0G mainnet proof path.

## Why This Matters

Autonomous agents can already quote, rebalance, and spend. The harder problem is deciding how much authority an agent has earned.

CreditGate gives operators a concrete answer:

1. Read the agent's signed public history.
2. Calculate a deterministic credit score.
3. Grant a bounded mandate.
4. Refuse over-cap actions before spend.
5. Store the active mandate on 0G and reject invalid delegation use.

The product is not a yield agent. YieldScout and DriftBot are sample actors. The product is history-gated spend control for any 0G/OpenClaw-style agent.

## Demo Flow

The APAC demo is intentionally short:

1. Open `/`.
2. Start on the gate moment: `YieldScout` requests `$1,200`, cap is `$500`, payment is denied.
3. Open `/credit`.
4. Show `YieldScout` with a `73/100` credit score and `$500` cap.
5. Show `DriftBot` with a `41/100` credit score and `$150` cap.
6. Show both over-cap attempts being refused with `MANDATE_REFUSED`.
7. Show both under-cap actions being allowed with `DELEGATION_USED`.
8. Run `npm run verify:credit` and `npm run verify:storage`.

The comparison is the V2 product moment. Most agent projects show agents acting. CreditGate shows cleaner history earning more authority and weaker history receiving a tighter cap.

## 0G Components

Live submission state:

- Deterministic signed histories for two agents.
- Replayable score, mandate, refusal, and allowed-use roots.
- Active mandate state on 0G Chain: root, cap, expiry, and enforced delegation checks.
- `AgentCreditRegistry` deployed on 0G mainnet.
- Thirteen confirmed 0G mainnet transactions: deploy, two agent underwriting loops, one Storage upload, and one Storage-root anchor.
- One canonical portfolio record uploaded to 0G Storage and anchored back into the mainnet registry.
- Replayable verifier output in the repo and judge docs.

0G integration:

- **0G Chain:** contract state and events for `AgentRegistered`, `CreditScored`, `MandateGranted`, `MandateRefused`, and `DelegationUsed`. `useDelegation` rejects missing, mismatched, expired, or over-cap mandates.
- **0G Storage:** canonical signed portfolio JSON retrievable by root hash and replayed by `npm run verify:storage`.
- **0G Explorer:** public transaction links for judge verification.
- **Proof roots:** content-addressed JSON roots for the signed history, score, mandate, refusal, and allowed-use receipt.

Live links:

- App: `https://creditgate.vercel.app`
- GitHub: `https://github.com/dolepee/creditgate`
- 0G contract: `0x4D98ee9f1dc2F9852A54aDfae81937520498E12a`
- 0G explorer: `https://chainscan.0g.ai/address/0x4D98ee9f1dc2F9852A54aDfae81937520498E12a`

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
spend cap + mandate         onchain active mandate + refusal/use anchors
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
npm run demo:agent-loop
npm run proof:export
npm run openclaw:inspect
npm run typecheck
npm run build
npm run dev
```

Open:

- `http://localhost:3400`
- `http://localhost:3400/credit`

## Verifier

Run:

```bash
npm run verify:credit
```

Expected output:

```text
CREDITGATE_PORTFOLIO_VALID
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
- active mandate binding
- `noPaymentBroadcast=true`
- allowed under-cap use

For a fresh non-mutating runtime episode, run:

```bash
npm run demo:agent-loop
```

It creates a new wallet at runtime, signs a fresh YieldScout history, derives the score/cap, refuses an over-cap request, and prints `CREDITGATE_RUNTIME_LOOP_VALID`.

The Storage verifier additionally checks:

- the portfolio proof JSON downloads from 0G Storage
- the downloaded JSON is canonical
- the local object hash matches the stored object hash
- the 0G Chain registry points to the same Storage root
- the downloaded portfolio still passes `CREDITGATE_PORTFOLIO_VALID`

## Mainnet Proof

The 0G mainnet contract is deployed and seeded. Judges can verify the live anchors in:

- `src/credit/mainnet-anchors.json`
- `docs/0G_MAINNET_PROOF.json`
- `docs/JUDGE_GUIDE.md`

Storage proof:

- 0G Storage root: `0x4df825e71e0ad2d873c1518ce18b0cec6cd495981db1ea93e20d192cd29a2d98`
- Storage upload tx: `0xccf93435fb33743f0f55f943731545e55d98847f865bfd26dfa42beeae0d9cb9`
- Storage root anchor tx: `0xafe228382b6fb0e90b324bdfe4044fcd4acf5369e326fe5f56f3d7375e9be604`
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
