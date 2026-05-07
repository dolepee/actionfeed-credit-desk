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

Those roots are replayable locally, uploaded as a canonical portfolio object to 0G Storage, and enforced/anchored on 0G Chain for the APAC mainnet proof.

### 0G Chain

Stores and enforces roots through `AgentCreditRegistry`:

- agent registration
- credit score
- active mandate grant with root, cap, and expiry
- mandate refusal
- delegation use

The V2 mainnet proof emits the full loop twice: YieldScout earns a higher score and larger cap; DriftBot earns a lower score and tighter cap.

`useDelegation` is not just an event anchor. It requires an active mandate, checks the provided mandate root, rejects expired mandates, rejects over-cap amounts, and rejects zero recipients.

### 0G Storage

Uploads the complete canonical portfolio proof JSON:

- Storage root: `0x4df825e71e0ad2d873c1518ce18b0cec6cd495981db1ea93e20d192cd29a2d98`
- object hash: `0x1d3638b09da7600c336b6f84791e6c81e25a12b1d514873970dde7f6e722e3ce`
- verifier: `npm run verify:storage`

The Storage verifier downloads the object by root hash, checks canonical JSON, compares the object hash, replays `CREDITGATE_PORTFOLIO_VALID`, and confirms the registry's Storage-root anchor points to the same Storage root.

### OpenClaw Compatibility

The project is runtime-agnostic. An OpenClaw-style agent can call CreditGate as a public authority boundary after private planning:

```ts
await creditGate.recordAction({
  agent: "YieldScout",
  action: "yield.deposit",
  amountUsd: 250,
});
```

The runtime decides what the agent wants to do. CreditGate decides whether the agent has earned the authority to do it.
