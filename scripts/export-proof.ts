import { mkdir, writeFile } from "node:fs/promises";
import { buildCreditDeskProof } from "../src/credit/demo";
import { verifyCreditDeskProof } from "../src/credit/verifier";

async function main() {
  const proof = await buildCreditDeskProof();
  const verification = verifyCreditDeskProof(proof);

  await mkdir("proof", { recursive: true });
  await writeFile("proof/yieldscout-credit-proof.json", `${JSON.stringify(proof, null, 2)}\n`, "utf8");
  await writeFile("proof/yieldscout-verifier-output.txt", `${verification.lines.join("\n")}\n`, "utf8");

  console.log("proof/yieldscout-credit-proof.json");
  console.log("proof/yieldscout-verifier-output.txt");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

