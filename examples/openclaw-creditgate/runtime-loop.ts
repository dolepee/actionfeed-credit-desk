import { inspectAgentCredit, recordGateReceipt, requestAuthority } from "./adapter";

async function main() {
  const inspection = await inspectAgentCredit();
  if (!inspection.ok) throw new Error("credit inspection failed");

  const refused = await requestAuthority(1_200);
  const refusedAnchor = await recordGateReceipt(refused);

  const allowed = await requestAuthority(250);
  const allowedAnchor = await recordGateReceipt(allowed);

  console.log("OPENCLAW_CREDITGATE_RUNTIME_VALID");
  console.log("planner: private yield deposit plan");
  console.log(`tool.inspect_agent_credit: ${inspection.summary}`);
  console.log(`tool.request_authority: ${refused.summary}`);
  console.log(`tool.record_gate_receipt: ${refusedAnchor.summary}`);
  console.log(`tool.request_authority: ${allowed.summary}`);
  console.log(`tool.record_gate_receipt: ${allowedAnchor.summary}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
