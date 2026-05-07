import { inspectAgentCredit, requestAuthority } from "./adapter";

async function main() {
  const inspection = await inspectAgentCredit();
  const refused = await requestAuthority(1_200);
  const allowed = await requestAuthority(250);

  console.log("OPENCLAW_CREDITGATE_ADAPTER_VALID");
  console.log(inspection.summary);
  console.log(refused.summary);
  console.log(allowed.summary);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
