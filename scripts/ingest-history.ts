import { readFile } from "node:fs/promises";
import { verifyMessage } from "ethers";
import { canonicalJson, hashCanonical } from "../src/credit/canonical";
import { scoreAgentHistory } from "../src/credit/policy";
import type { SignedAgentAction } from "../src/credit/types";

async function main() {
  const input = await readInput();
  const parsed = JSON.parse(extractJson(input)) as unknown;
  const signedHistory = extractSignedHistory(parsed);
  if (signedHistory.length === 0) throw new Error("signed history is empty");

  let validSignatures = 0;
  for (const signed of signedHistory) {
    const recovered = verifyMessage(canonicalJson(signed.payload), signed.signature);
    if (recovered.toLowerCase() !== signed.signer.toLowerCase()) {
      throw new Error(`signature mismatch at seq ${signed.payload.seq}`);
    }
    if (signed.payloadHash !== hashCanonical(signed.payload)) {
      throw new Error(`payload hash mismatch at seq ${signed.payload.seq}`);
    }
    validSignatures += 1;
  }

  const evidenceRoot = hashCanonical(signedHistory);
  const credit = scoreAgentHistory(signedHistory.map((event) => event.payload));

  console.log("CREDITGATE_INGEST_VALID");
  console.log(`agent: ${credit.agent}`);
  console.log(`signatures: ${validSignatures}/${signedHistory.length}`);
  console.log(`score: ${credit.score}/100`);
  console.log(`cap: ${credit.capUsd} USD`);
  console.log(`evidence root: ${evidenceRoot}`);
}

async function readInput(): Promise<string> {
  const fileIndex = process.argv.indexOf("--file");
  if (fileIndex !== -1) {
    const file = process.argv[fileIndex + 1];
    if (!file) throw new Error("missing --file path");
    return readFile(file, "utf8");
  }

  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const input = Buffer.concat(chunks).toString("utf8").trim();
  if (!input) {
    throw new Error("provide JSON on stdin or pass --file <path>");
  }
  return input;
}

function extractJson(input: string): string {
  const objectIndex = input.indexOf("{");
  const arrayIndex = input.indexOf("[");
  const starts = [objectIndex, arrayIndex].filter((index) => index >= 0);
  if (starts.length === 0) throw new Error("input does not contain JSON");
  return input.slice(Math.min(...starts));
}

function extractSignedHistory(value: unknown): SignedAgentAction[] {
  if (Array.isArray(value)) return value as SignedAgentAction[];
  if (isRecord(value) && Array.isArray(value.signedHistory)) {
    return value.signedHistory as SignedAgentAction[];
  }
  throw new Error("expected signed history array or object with signedHistory");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
