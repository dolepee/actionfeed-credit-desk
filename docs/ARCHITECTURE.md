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

- signed YieldScout action history
- credit score event
- mandate event
- refusal receipt
- allowed-use receipt

Those roots are replayable locally and anchored on 0G Chain for the APAC mainnet proof.

### 0G Chain

Anchors roots through `AgentCreditRegistry`:

- agent registration
- credit score
- mandate grant
- mandate refusal
- delegation use

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
