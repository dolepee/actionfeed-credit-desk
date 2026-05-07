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

### 0G Storage

Uploads the complete canonical portfolio proof JSON:

- Storage root: `0x37414d25ef5962398687339d851d28aee5abad81893166e2189ac7ae4d8912a0`
- object hash: `0x650e77fc2a35a002025727d5392034435570e6fb07c72b358490f8eb6a881ca8`
- verifier: `npm run verify:storage`

The Storage verifier downloads the object by root hash, checks canonical JSON, compares the object hash, replays `CREDITGATE_PORTFOLIO_VALID`, and confirms the registry's Storage-root anchor points to the same Storage root.

### Boundary

CreditGate controls the CreditGate-authorized path. It does not custody funds or prevent an agent owner from spending through an unrelated wallet route. See `THREAT_MODEL.md`.

### OpenClaw Compatibility

The project is runtime-agnostic. An OpenClaw-compatible agent can call CreditGate as a public authority boundary after private planning:

```ts
const inspection = await inspectAgentCredit();
const decision = await requestAuthority(250);
const receipt = await recordGateReceipt(decision);
```

The runtime decides what the agent wants to do. CreditGate decides whether the agent has earned the authority to do it. See `examples/openclaw-creditgate/openclaw.module.json` and run `npm run openclaw:demo`.
