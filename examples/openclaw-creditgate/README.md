# OpenClaw CreditGate Module

This example shows the integration shape for an OpenClaw-compatible runtime.

OpenClaw handles private planning and tool execution. CreditGate handles the public authority boundary:

1. summarize signed agent history
2. calculate score and cap
3. refuse over-cap actions
4. allow under-cap actions
5. return proof roots for 0G anchoring

Files:

- `openclaw.module.json` declares the module and its three public tools.
- `adapter.ts` implements `inspect_agent_credit`, `request_authority`, and `record_gate_receipt`.
- `runtime-loop.ts` simulates a planner using the tools before spend.
- `inspect.ts` is a short smoke test for the adapter.

Run:

```bash
npm run openclaw:inspect
npm run openclaw:demo
```
