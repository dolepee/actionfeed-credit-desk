import { buildCreditDeskPortfolio } from "../src/credit/demo";
import { verifyCreditDeskPortfolio } from "../src/credit/verifier";

async function main() {
  const proof = await buildCreditDeskPortfolio();
  const result = verifyCreditDeskPortfolio(proof);
  console.log(result.lines.join("\n"));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
