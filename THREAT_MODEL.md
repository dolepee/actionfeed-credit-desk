# Threat Model

CreditGate is an authority gate for the CreditGate-authorized path. It is not a custodial wallet yet.

## Enforced

- Active mandate exists for the agent.
- Mandate root matches the submitted use/refusal.
- Mandate has not expired.
- Delegation use amount is nonzero and inside the active cap.
- Delegation recipient is nonzero.
- `CreditGateRouter.payWithMandate` moves native 0G only after owner, mandate root, expiry, cap, recipient, and value checks pass.
- `CreditGateRouter.refusePayment` records an over-cap refusal without moving native 0G.
- Over-cap refusal can only be recorded when `attemptedUsd > capUsd`.
- Score/cap policy is computed from public metrics in the live registry via `scoreCreditFromMetrics`.
- Compute review artifacts hash their input/output and are included in the live 0G Storage proof packet.

## Not Enforced Yet

- CreditGate does not custody funds globally; the router only moves native 0G that is sent through the CreditGate-authorized path.
- CreditGate does not move ERC-20 tokens yet.
- CreditGate cannot stop an agent owner from spending through a wallet path that bypasses CreditGate.
- `noPaymentBroadcast` means no authorized payment-use receipt was emitted inside the CreditGate path; it is not a global proof that no external payment occurred anywhere.
- USD caps are policy units in this demo. A production router should denominate caps in token units or use an oracle.
- 0G Compute reviews are advisory underwriting signals. They explain risk; deterministic score/cap policy remains the enforceable source of truth.

## Production Path

- Connect `CreditGateRouter` to an agent smart account or self-custodial wallet module so agents cannot route around it.
- Add ERC-20 payment support.
- Add token-denominated caps or oracle-backed USD conversion.
- Add slashing or reputation penalties when an agent bypasses the authorized path.
