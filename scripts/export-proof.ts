import { mkdir, writeFile } from "node:fs/promises";
import { buildCreditDeskPortfolio } from "../src/credit/demo";
import { verifyCreditDeskPortfolio } from "../src/credit/verifier";

async function main() {
  const proof = await buildCreditDeskPortfolio();
  const verification = verifyCreditDeskPortfolio(proof);

  await mkdir("proof", { recursive: true });
  await writeFile("proof/creditgate-portfolio-proof.json", `${JSON.stringify(proof, null, 2)}\n`, "utf8");
  await writeFile("proof/creditgate-verifier-output.txt", `${verification.lines.join("\n")}\n`, "utf8");

  console.log("proof/creditgate-portfolio-proof.json");
  console.log("proof/creditgate-verifier-output.txt");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
