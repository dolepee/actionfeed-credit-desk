# CreditGate

CreditGate is a 0G-native credit gate for autonomous agents.

It reads a signed public agent history, adds a 0G Compute underwriting review, calculates a replayable credit score, grants a bounded spend cap, refuses over-cap actions, stores the canonical proof packet on 0G Storage, and moves native 0G only through an under-cap router call.

## 0G APAC Positioning

- **Primary track:** Track 3, Agentic Economy & Autonomous Applications
- **Secondary fit:** Track 1, Agentic Infrastructure & OpenClaw Lab
- **Demo agents:** YieldScout and DriftBot, two OpenClaw-compatible yield agents with different histories
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
6. Move native 0G through `CreditGateRouter` only when the use is inside the cap.

The product is not a yield agent. YieldScout and DriftBot are sample actors. The product is history-gated spend control for any 0G/OpenClaw-compatible agent.

## Demo Flow

The APAC demo is intentionally short:

1. Open `/`.
2. Start on the gate moment: `YieldScout` requests `$1,200`, cap is `$500`, payment is denied.
3. Open `/credit`.
4. Show `YieldScout` with a `73/100` credit score and `$500` cap.
5. Show `DriftBot` with a `41/100` credit score and `$150` cap.
6. Show both over-cap attempts being refused with `MANDATE_REFUSED`.
7. Show both under-cap actions being allowed with `DELEGATION_USED`.
8. Show the router refusing an over-cap transfer and moving `0.0001 OG` for the under-cap use.
9. Run `npm run verify:credit`, `npm run verify:compute`, `npm run verify:storage`, and `npm run verify:router`.

The comparison is the V2 product moment. Most agent projects show agents acting. CreditGate shows cleaner history earning more authority and weaker history receiving a tighter cap.

## 0G Components

Live submission state:

- Deterministic signed histories for two agents.
- Replayable score, mandate, refusal, and allowed-use roots.
- Active mandate state on 0G Chain: root, cap, expiry, and enforced delegation checks.
- `AgentCreditRegistry` deployed on 0G mainnet.
- Sixteen confirmed 0G mainnet transactions: registry deploy, two agent underwriting loops, one Storage upload, one Storage-root anchor, router deploy, router refusal, and router payment.
- One canonical portfolio record uploaded to 0G Storage and anchored back into the mainnet registry.
- One `CreditGateRouter` deployed on 0G mainnet. It refuses the over-cap request before transfer and moves native 0G for the under-cap mandate use.
- Compute reviewer path: `npm run compute:review` produced live 0G Compute underwriting reviews; `-- --fixture` keeps local verification reproducible without another broker call.
- Replayable verifier output in the repo and judge docs.

0G integration:

- **0G Chain:** contract state and events for `AgentRegistered`, `CreditScored`, `MandateGranted`, `MandateRefused`, and `DelegationUsed`. `useDelegation` rejects missing, mismatched, expired, or over-cap mandates. `CreditGateRouter` then uses the active mandate to refuse over-cap payment attempts and move native 0G only for under-cap requests.
- **0G Storage:** canonical signed portfolio JSON retrievable by root hash and replayed by `npm run verify:storage`.
- **0G Compute:** risk-review adapter for YieldScout and DriftBot histories. Live reviews use the 0G Compute broker and `processResponse`; fixture reviews are clearly labeled and only support local reproducibility before funding.
- **0G Explorer:** public transaction links for judge verification.
- **Proof roots:** content-addressed JSON roots for the signed history, score, mandate, refusal, and allowed-use receipt.

Live links:

- App: `https://creditgate.vercel.app`
- GitHub: `https://github.com/dolepee/creditgate`
- 0G contract: `0x3A4f5a2F65119b7C1d13914fC3875348392eDa7d`
- 0G explorer: `https://chainscan.0g.ai/address/0x3A4f5a2F65119b7C1d13914fC3875348392eDa7d`

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
0G Compute risk review
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
under-cap request -> CreditGateRouter.payWithMandate -> native 0G transfer
```

## Local Setup

```bash
npm install
npm run verify:credit
npm run verify:compute
npm run verify:storage
npm run verify:router
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
- Paste a signed history on `/credit`, or generate one locally with `npm run demo:agent-loop -- --json`.

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
YieldScout refusal: 1200 > 500, no authorized payment-use receipt
DriftBot refusal: 500 > 150, no authorized payment-use receipt
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
- authorized-path refusal flag
- allowed under-cap use

For a fresh non-mutating runtime episode, run:

```bash
npm run demo:agent-loop
```

It creates a new wallet at runtime, signs a fresh YieldScout history, derives the score/cap, refuses an over-cap request, and prints `CREDITGATE_RUNTIME_LOOP_VALID`.

For an interactive/non-fixture path, paste a signed history into `/credit` or run:

```bash
npm run demo:agent-loop -- --json > /tmp/creditgate-runtime.json
npm run credit:ingest -- --file /tmp/creditgate-runtime.json
```

The ingest path verifies signatures, hashes the uploaded history, derives the score, and returns the cap before any mandate is anchored.

The Storage verifier additionally checks:

- the portfolio proof JSON downloads from 0G Storage
- the downloaded JSON is canonical
- the local object hash matches the stored object hash
- the 0G Chain registry points to the same Storage root
- the downloaded portfolio still passes `CREDITGATE_PORTFOLIO_VALID`

The Compute verifier checks:

- review inputs hash back to the signed histories
- review outputs hash back to the stored review JSON
- YieldScout and DriftBot receive different risk tiers and cap classes
- live 0G Compute reviews are marked `0g-compute-process-response`; fixture reviews are marked `fixture-hash-inclusion`

```bash
npm run compute:review -- --fixture
npm run verify:compute
```

To refresh the live 0G Compute path, fund the `ZG_PRIVATE_KEY` wallet with enough broker balance plus gas, then run:

```bash
npm run compute:review
npm run proof:export
npm run storage:upload
```

The mainnet verifier checks live 0G registry state, transaction receipts, active mandates, score metrics, and the Storage-root anchor:

```bash
npm run verify:mainnet
```

The router verifier checks the fund-moving path: the over-cap request emits a refusal with no native value sent, while the under-cap request sends native 0G to the recipient and leaves no value trapped in the router:

```bash
npm run verify:router
```

## Mainnet Proof

The 0G mainnet contract is deployed and seeded. Judges can verify the live anchors in:

- `src/credit/mainnet-anchors.json`
- `docs/0G_MAINNET_PROOF.json`

Storage proof:

- 0G Storage root: `0x9ab0a8d04beba5fa8dbcd7b465b0929cdda9a07e99ed2c4c33fd47e13a291500`
- Storage upload tx: `0x53248020d2212f9214b61ee12a77d34bfd557212c4c326d8a0a5a7ecbab2818c`
- Storage root anchor tx: `0x083b3732a484907120e621286386d6ebdb92b262b02d756a871fd7ff893163fd`
- Verifier: `npm run verify:storage`

Router proof:

- CreditGateRouter: `0x7e2FD82AeE9Caa2eB72aBBefa797d9E3298f578b`
- Router deploy tx: `0x76885d18496df6ed94fa3fa9a017f3584e7826ac8ed53b92de5f7482455f0901`
- Over-cap refusal tx: `0x872eb2ffcdb24eff47088c73b92dc0fbdb1d51352ea0177dd6d76672454147e7`
- Under-cap payment tx: `0x7ff16b984258a5613061faddf70a67f9545be00d058ccb4ec433d4c9861004aa`
- Verifier: `npm run verify:router`

Deployment commands are kept for reproducibility:

```bash
forge build --root contracts
ZG_PRIVATE_KEY=0x... npm run deploy:mainnet
ZG_PRIVATE_KEY=0x... npm run seed:mainnet
ZG_PRIVATE_KEY=0x... npm run seed:v2-mainnet
ZG_PRIVATE_KEY=0x... npm run storage:upload
ZG_PRIVATE_KEY=0x... npm run deploy:router-mainnet
ZG_PRIVATE_KEY=0x... npm run seed:router-mainnet
```

## OpenClaw-Compatible Module

CreditGate ships an OpenClaw-compatible module example in `examples/openclaw-creditgate/`.

- `openclaw.module.json` declares the public authority tools.
- `adapter.ts` implements credit inspection, authority request, and receipt-root return.
- `runtime-loop.ts` simulates a private planner calling the gate before spend.

Run:

```bash
npm run openclaw:inspect
npm run openclaw:demo
```

This is intentionally a small module surface, not a competing runtime. OpenClaw or another agent runtime keeps private planning; CreditGate controls the public spend boundary.

## Contract Boundary

The registry enforces active mandate use on-chain: mandate root match, cap, expiry, nonzero recipient, and no over-cap delegation use. `CreditGateRouter` reads that live mandate and only moves native 0G when the requested amount is inside the cap. The live registry also includes `scoreCreditFromMetrics`, which computes score and cap from public history metrics. The replay verifier remains the canonical proof that the submitted portfolio roots match the signed histories and score policy.

For explicit proof boundaries and non-goals, see [THREAT_MODEL.md](THREAT_MODEL.md).

## One-Liner

CreditGate gives 0G agents a credit history, then turns that history into bounded spend authority.
