# Architecture

## Core Loop

```text
signed agent history
      |
      v
0G Compute risk review
      |
      v
credit scoring policy
      |
      v
bounded mandate
      |
      +--> over-cap request -> MANDATE_REFUSED
      |
      +--> under-cap request -> CreditGateRouter.payWithMandate -> native 0G transfer
```

## 0G Usage

### Proof Roots

CreditGate builds content-addressed roots for the heavy proof material:

- signed YieldScout and DriftBot action histories
- credit score event
- mandate event
- refusal receipt
- allowed-use receipt

Those roots are replayable locally, uploaded as a canonical portfolio object to 0G Storage, and anchored on 0G Chain. The active mandate state is enforced inside the CreditGate registry path.

### 0G Chain

Stores and enforces roots through `AgentCreditRegistry`:

- agent registration
- credit score
- active mandate grant with root, cap, and expiry
- mandate refusal
- delegation use

The V2 mainnet proof emits the full loop twice: YieldScout earns a higher score and larger cap; DriftBot earns a lower score and tighter cap.

`useDelegation` is not just an event anchor. It requires an active mandate, checks the provided mandate root, rejects expired mandates, rejects over-cap amounts, and rejects zero recipients.

### CreditGateRouter

`CreditGateRouter` is the live fund-moving boundary:

- router: `0x7e2FD82AeE9Caa2eB72aBBefa797d9E3298f578b`
- over-cap refusal tx: `0x872eb2ffcdb24eff47088c73b92dc0fbdb1d51352ea0177dd6d76672454147e7`
- under-cap payment tx: `0x7ff16b984258a5613061faddf70a67f9545be00d058ccb4ec433d4c9861004aa`
- verifier: `npm run verify:router`

The router reads the active mandate from `AgentCreditRegistry`, rejects mismatched, expired, over-cap, or non-owner calls, and transfers native 0G only after the cap check passes.

### 0G Storage

Uploads the complete canonical portfolio proof JSON:

- Storage root: `0x9ab0a8d04beba5fa8dbcd7b465b0929cdda9a07e99ed2c4c33fd47e13a291500`
- object hash: `0xac1797a8a0f63a396bd323c1b43be7e3ba1164162c5dfb7e3ce41e29c23a4855`
- verifier: `npm run verify:storage`

The Storage verifier downloads the object by root hash, checks canonical JSON, compares the object hash, replays `CREDITGATE_PORTFOLIO_VALID`, and confirms the registry's Storage-root anchor points to the same Storage root.

### Boundary

CreditGate controls the CreditGate-authorized path. The router moves native 0G only for authorized calls, but it does not custody all agent funds and cannot stop an agent owner from spending through an unrelated wallet route. See `THREAT_MODEL.md`.

### OpenClaw Compatibility

The project is runtime-agnostic. An OpenClaw-compatible agent can call CreditGate as a public authority boundary after private planning:

```ts
const inspection = await inspectAgentCredit();
const decision = await requestAuthority(250);
const receipt = await recordGateReceipt(decision);
```

The runtime decides what the agent wants to do. CreditGate decides whether the agent has earned the authority to do it. See `examples/openclaw-creditgate/openclaw.module.json` and run `npm run openclaw:demo`.
