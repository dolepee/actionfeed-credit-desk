import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { JsonRpcProvider, Wallet } from "ethers";
import {
  buildComputePrompt,
  buildComputeReviewInput,
  buildComputeReviewSet,
  buildFixtureComputeReviewSet,
  buildReviewRecord,
  computeVerifierLines,
  COMPUTE_REVIEW_PATH,
  normalizeReviewPayload,
} from "../src/credit/compute-review";
import { buildCreditGatePortfolio } from "../src/credit/demo";
import { runZgComputeReview } from "../src/credit/zg-compute";
import type { ComputeReviewRecord } from "../src/credit/types";
import { loadLocalEnv, must } from "./lib/env";

const DEFAULT_RPC = "https://evmrpc.0g.ai";

async function main() {
  loadLocalEnv();
  const fixture = process.argv.includes("--fixture");
  const portfolio = await buildCreditGatePortfolio();

  const reviewSet = fixture
    ? buildFixtureComputeReviewSet(portfolio)
    : await buildLiveReviewSet(portfolio);

  await writeJson(COMPUTE_REVIEW_PATH, reviewSet);
  console.log(COMPUTE_REVIEW_PATH);
  console.log(computeVerifierLines(reviewSet, portfolio).join("\n"));
}

async function buildLiveReviewSet(portfolio: Awaited<ReturnType<typeof buildCreditGatePortfolio>>) {
  const rpc = process.env.ZG_MAINNET_RPC ?? DEFAULT_RPC;
  const wallet = new Wallet(must("ZG_PRIVATE_KEY"), new JsonRpcProvider(rpc));
  const records: ComputeReviewRecord[] = [];

  for (const proof of portfolio.proofs) {
    const input = buildComputeReviewInput(proof);
    const prompt = buildComputePrompt(input);
    const result = await runZgComputeReview(wallet, prompt, {
      modelHint: process.env.ZG_COMPUTE_MODEL_HINT,
      providerAddress: process.env.ZG_COMPUTE_PROVIDER,
    });
    const review = normalizeReviewPayload(
      input,
      result.reply,
      {
        network: "0G Compute",
        provider: result.provider,
        model: result.model,
        teeSignerAddress: result.teeSignerAddress,
        chatId: result.chatId,
        completionId: result.completionId,
      },
      true,
      "0g-compute-process-response",
    );
    records.push(buildReviewRecord(input, review));
  }

  return buildComputeReviewSet(records, "0g-compute");
}

async function writeJson(path: string, value: unknown) {
  await mkdir(dirname(resolve(path)), { recursive: true });
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
