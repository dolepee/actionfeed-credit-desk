import { readFile } from "node:fs/promises";
import {
  computeVerifierLines,
  COMPUTE_REVIEW_PATH,
} from "../src/credit/compute-review";
import { buildCreditGatePortfolio } from "../src/credit/demo";
import type { ComputeReviewSet } from "../src/credit/types";

async function main() {
  const portfolio = await buildCreditGatePortfolio();
  const reviewSet = JSON.parse(await readFile(COMPUTE_REVIEW_PATH, "utf8")) as ComputeReviewSet;
  console.log(computeVerifierLines(reviewSet, portfolio).join("\n"));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
