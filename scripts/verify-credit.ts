import { buildCreditDeskProof } from "../src/credit/demo";
import { verifyCreditDeskProof } from "../src/credit/verifier";

async function main() {
  const proof = await buildCreditDeskProof();
  const result = verifyCreditDeskProof(proof);
  console.log(result.lines.join("\n"));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

