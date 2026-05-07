# Architecture

## Core Loop

```text
signed agent history
      |
      v
credit scoring policy
      |
      v
bounded mandate
      |
      +--> over-cap request -> MANDATE_REFUSED
      |
      +--> under-cap request -> DELEGATION_USED
```

## 0G Usage

### Proof Roots

CreditGate builds content-addressed roots for the heavy proof material:

- signed YieldScout and DriftBot action histories
- credit score event
- mandate event
- refusal receipt
- allowed-use receipt

Those roots are replayable locally, uploaded as a canonical portfolio object to 0G Storage, and anchored on 0G Chain for the APAC mainnet proof.

### 0G Chain

Anchors roots through `AgentCreditRegistry`:

- agent registration
- credit score
- mandate grant
- mandate refusal
- delegation use

The V2 mainnet proof emits the full loop twice: YieldScout earns a higher score and larger cap; DriftBot earns a lower score and tighter cap.

### 0G Storage

Uploads the complete canonical portfolio proof JSON:

- Storage root: `0x89364a379ffb896ffcc4042b18faeeb35000548862ad214feb9f7c12d92fbe1f`
- object hash: `0x1943358c4b9efe7e6582736079a4b61522facbf4fb37e4731d687a290c5d6929`
- verifier: `npm run verify:storage`

The Storage verifier downloads the object by root hash, checks canonical JSON, compares the object hash, replays `CREDIT_DESK_PORTFOLIO_VALID`, and confirms the registry's proof-packet anchor points to the same Storage root.

### OpenClaw Compatibility

The project is runtime-agnostic. An OpenClaw-style agent can call the Credit Desk as a public accountability layer after private planning:

```ts
await creditDesk.recordAction({
  agent: "YieldScout",
  action: "yield.deposit",
  amountUsd: 250,
});
```

The runtime decides what the agent wants to do. Credit Desk decides whether the agent has earned the authority to do it.
