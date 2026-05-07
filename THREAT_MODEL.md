# Threat Model

CreditGate is an authority gate for the CreditGate-authorized path. It is not a custodial wallet yet.

## Enforced

- Active mandate exists for the agent.
- Mandate root matches the submitted use/refusal.
- Mandate has not expired.
- Delegation use amount is nonzero and inside the active cap.
- Delegation recipient is nonzero.
- Over-cap refusal can only be recorded when `attemptedUsd > capUsd`.
- Score/cap policy is computed from public metrics in the live registry via `scoreCreditFromMetrics`.

## Not Enforced Yet

- CreditGate does not custody funds.
- CreditGate does not move tokens or OG itself.
- CreditGate cannot stop an agent owner from spending through a wallet path that bypasses CreditGate.
- `noPaymentBroadcast` means no authorized payment-use receipt was emitted inside the CreditGate path; it is not a global proof that no external payment occurred anywhere.
- USD caps are policy units in this demo. A production router should denominate caps in token units or use an oracle.

## Production Path

- Add `CreditGateRouter.payWithMandate` so approved use and actual payment are one atomic call.
- Connect the router to an agent smart account or self-custodial wallet module.
- Add token-denominated caps or oracle-backed USD conversion.
- Add 0G Compute review as a second-opinion underwriting signal while keeping deterministic score replay as the source of truth.
