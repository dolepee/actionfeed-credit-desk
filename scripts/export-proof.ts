import { mkdir, writeFile } from "node:fs/promises";
import { computeVerifierLines, loadOrBuildComputeReviewSet } from "../src/credit/compute-review";
import { buildCreditGatePortfolio } from "../src/credit/demo";
import { verifyCreditGatePortfolio } from "../src/credit/verifier";

async function main() {
  const proof = await buildCreditGatePortfolio();
  const verification = verifyCreditGatePortfolio(proof);
  const computeReviews = await loadOrBuildComputeReviewSet(proof);
  const computeVerification = computeVerifierLines(computeReviews, proof);

  await mkdir("proof", { recursive: true });
  await writeFile("proof/creditgate-portfolio-proof.json", `${JSON.stringify(proof, null, 2)}\n`, "utf8");
  await writeFile("proof/creditgate-compute-reviews.json", `${JSON.stringify(computeReviews, null, 2)}\n`, "utf8");
  await writeFile("proof/creditgate-verifier-output.txt", `${verification.lines.join("\n")}\n`, "utf8");
  await writeFile("proof/creditgate-compute-verifier-output.txt", `${computeVerification.join("\n")}\n`, "utf8");

  console.log("proof/creditgate-portfolio-proof.json");
  console.log("proof/creditgate-compute-reviews.json");
  console.log("proof/creditgate-verifier-output.txt");
  console.log("proof/creditgate-compute-verifier-output.txt");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
