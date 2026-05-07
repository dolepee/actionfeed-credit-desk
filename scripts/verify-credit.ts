import { buildCreditGatePortfolio } from "../src/credit/demo";
import { verifyCreditGatePortfolio } from "../src/credit/verifier";

async function main() {
  const proof = await buildCreditGatePortfolio();
  const result = verifyCreditGatePortfolio(proof);
  console.log(result.lines.join("\n"));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
