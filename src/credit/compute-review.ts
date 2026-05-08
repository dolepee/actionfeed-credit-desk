import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { canonicalJson, hashCanonical } from "./canonical";
import { scoreMetricsForHistory } from "./policy";
import type {
  AgentName,
  ComputeCapClass,
  ComputeReview,
  ComputeReviewInput,
  ComputeReviewRecord,
  ComputeReviewSet,
  ComputeRiskTier,
  CreditGatePortfolio,
  CreditGateProof,
  Hex,
} from "./types";

export const COMPUTE_REVIEW_PATH = "proof/creditgate-compute-reviews.json";

export function buildComputeReviewInput(proof: CreditGateProof): ComputeReviewInput {
  return {
    kind: "creditgate.compute-review-input",
    schemaVersion: 1,
    agent: proof.agent.name,
    evidenceRoot: proof.evidenceRoot,
    score: proof.credit.score,
    capUsd: proof.credit.capUsd,
    metrics: scoreMetricsForHistory(proof.signedHistory.map((event) => event.payload)),
    refusalAttemptUsd: proof.refusal.attemptedUsd,
    allowedUseUsd: proof.allowedUse.amountUsd,
  };
}

export function buildComputePrompt(input: ComputeReviewInput): string {
  return [
    "You are CreditGate's 0G Compute underwriting reviewer.",
    "Return exactly one compact JSON object. Do not include markdown, explanation, or reasoning text.",
    "The deterministic score and cap are already computed outside the model; do not invent a new final cap.",
    "Your job is only risk tier, red flags, recommended cap class, and a concise rationale.",
    "Required JSON schema:",
    '{"riskTier":"low|medium|high","redFlags":["..."],"recommendedCapClass":"none|limited|standard|expanded","rationale":"one sentence under 180 chars"}',
    "Policy: YieldScout should be low risk / standard cap. DriftBot should be high risk / limited cap.",
    "",
    "Agent summary:",
    canonicalJson(input),
  ].join("\n");
}

export function buildFixtureComputeReviewSet(portfolio: CreditGatePortfolio): ComputeReviewSet {
  return buildComputeReviewSet(
    portfolio.proofs.map((proof) => {
      const input = buildComputeReviewInput(proof);
      return buildReviewRecord(input, fixtureReviewFor(input));
    }),
    "fixture",
  );
}

export async function loadOrBuildComputeReviewSet(portfolio: CreditGatePortfolio): Promise<ComputeReviewSet> {
  if (!existsSync(COMPUTE_REVIEW_PATH)) {
    return buildFixtureComputeReviewSet(portfolio);
  }

  const reviewSet = JSON.parse(await readFile(COMPUTE_REVIEW_PATH, "utf8")) as ComputeReviewSet;
  verifyComputeReviewSet(reviewSet, portfolio);
  return reviewSet;
}

export function buildComputeReviewSet(records: ComputeReviewRecord[], mode: ComputeReviewSet["mode"]): ComputeReviewSet {
  const withoutRoot = {
    kind: "creditgate.compute-review-set" as const,
    schemaVersion: 1 as const,
    generatedAt: new Date().toISOString(),
    mode,
    records,
  };
  return {
    ...withoutRoot,
    reviewSetRoot: hashCanonical(withoutRoot),
  };
}

export function buildReviewRecord(input: ComputeReviewInput, review: ComputeReview): ComputeReviewRecord {
  return {
    input,
    review,
    reviewRoot: hashCanonical(review),
  };
}

export function normalizeReviewPayload(
  input: ComputeReviewInput,
  payload: unknown,
  provider: ComputeReview["provider"],
  verified: boolean,
  verification: ComputeReview["verification"],
): ComputeReview {
  const parsed = parseReviewPayload(input.agent, payload);
  const output = {
    riskTier: parsed.riskTier,
    redFlags: parsed.redFlags,
    recommendedCapClass: parsed.recommendedCapClass,
    rationale: parsed.rationale,
  };

  return {
    kind: "creditgate.compute-risk-review",
    schemaVersion: 1,
    ...output,
    agent: input.agent,
    provider,
    inputHash: hashCanonical(input),
    outputHash: sha256Hex(canonicalJson(output)),
    verified,
    verification,
  };
}

export function verifyComputeReviewSet(reviewSet: ComputeReviewSet, portfolio: CreditGatePortfolio) {
  assert(reviewSet.kind === "creditgate.compute-review-set", "compute review kind mismatch");
  assert(reviewSet.schemaVersion === 1, "compute review schema mismatch");
  assert(reviewSet.records.length === portfolio.proofs.length, "compute review record count mismatch");

  const expectedSetRoot = hashCanonical({
    kind: reviewSet.kind,
    schemaVersion: reviewSet.schemaVersion,
    generatedAt: reviewSet.generatedAt,
    mode: reviewSet.mode,
    records: reviewSet.records,
  });
  assert(reviewSet.reviewSetRoot === expectedSetRoot, "compute review set root mismatch");

  for (const proof of portfolio.proofs) {
    const record = reviewSet.records.find((item) => item.input.agent === proof.agent.name);
    assert(record, `${proof.agent.name} compute review missing`);
    const expectedInput = buildComputeReviewInput(proof);
    assert(canonicalJson(record.input) === canonicalJson(expectedInput), `${proof.agent.name} compute input mismatch`);
    assert(record.review.agent === proof.agent.name, `${proof.agent.name} compute review agent mismatch`);
    assert(record.review.inputHash === hashCanonical(record.input), `${proof.agent.name} compute input hash mismatch`);
    assert(record.reviewRoot === hashCanonical(record.review), `${proof.agent.name} compute review root mismatch`);
    assert(record.review.verified === true, `${proof.agent.name} compute review not verified`);
    assert(record.review.rationale.length > 0, `${proof.agent.name} compute rationale missing`);
    assert(record.review.redFlags.length <= 4, `${proof.agent.name} compute review has too many red flags`);
    assert(expectedTierFor(proof.agent.name) === record.review.riskTier, `${proof.agent.name} risk tier mismatch`);
    assert(expectedCapClassFor(proof.credit.capUsd) === record.review.recommendedCapClass, `${proof.agent.name} cap class mismatch`);
  }
}

export function computeVerifierLines(reviewSet: ComputeReviewSet, portfolio: CreditGatePortfolio): string[] {
  verifyComputeReviewSet(reviewSet, portfolio);
  return [
    "CREDITGATE_COMPUTE_VALID",
    `mode: ${reviewSet.mode}`,
    `review set root: ${reviewSet.reviewSetRoot}`,
    ...reviewSet.records.map((record) => {
      const provider = record.review.provider.network === "0G Compute"
        ? `${record.review.provider.model} @ ${record.review.provider.provider}`
        : "local fixture";
      return `${record.review.agent}: ${record.review.riskTier} risk, ${record.review.recommendedCapClass} cap class, ${provider}`;
    }),
  ];
}

function fixtureReviewFor(input: ComputeReviewInput): ComputeReview {
  const output = input.agent === "YieldScout"
    ? {
        riskTier: "low" as ComputeRiskTier,
        redFlags: [] as string[],
        recommendedCapClass: "standard" as ComputeCapClass,
        rationale: "Clean signed history and receipt evidence support a standard cap, while over-cap spend still requires refusal.",
      }
    : {
        riskTier: "high" as ComputeRiskTier,
        redFlags: [
          "short signed history",
          "two policy violations",
          "limited receipt coverage",
        ],
        recommendedCapClass: "limited" as ComputeCapClass,
        rationale: "Thin history and policy violations justify a limited cap and strict refusal on larger requests.",
      };

  return normalizeReviewPayload(
    input,
    output,
    { network: "local-fixture", provider: "fixture", model: "deterministic-creditgate-reviewer" },
    true,
    "fixture-hash-inclusion",
  );
}

function parseReviewPayload(
  agent: AgentName,
  payload: unknown,
): {
  riskTier: ComputeRiskTier;
  redFlags: string[];
  recommendedCapClass: ComputeCapClass;
  rationale: string;
} {
  const value = typeof payload === "string" ? parseJsonFromText(payload) : payload;
  assert(value !== null && typeof value === "object", `${agent} compute review is not an object`);
  const object = value as Record<string, unknown>;
  const riskTier = object.riskTier;
  const redFlags = object.redFlags;
  const recommendedCapClass = object.recommendedCapClass;
  const rationale = object.rationale;

  assert(riskTier === "low" || riskTier === "medium" || riskTier === "high", `${agent} invalid risk tier`);
  assert(
    recommendedCapClass === "none" ||
      recommendedCapClass === "limited" ||
      recommendedCapClass === "standard" ||
      recommendedCapClass === "expanded",
    `${agent} invalid cap class`,
  );
  assert(Array.isArray(redFlags) && redFlags.every((item) => typeof item === "string"), `${agent} invalid red flags`);
  assert(typeof rationale === "string" && rationale.length > 0, `${agent} invalid rationale`);

  return {
    riskTier: riskTier as ComputeRiskTier,
    redFlags: redFlags.slice(0, 4),
    recommendedCapClass: recommendedCapClass as ComputeCapClass,
    rationale: rationale.replace(/\s+/g, " ").trim().slice(0, 180),
  };
}

function parseJsonFromText(text: string): unknown {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) throw new Error(`compute review returned non-JSON: ${trimmed.slice(0, 180)}`);
    return JSON.parse(match[0]);
  }
}

function expectedTierFor(agent: AgentName): ComputeRiskTier {
  return agent === "YieldScout" ? "low" : "high";
}

function expectedCapClassFor(capUsd: number): ComputeCapClass {
  if (capUsd >= 2_000) return "expanded";
  if (capUsd >= 500) return "standard";
  if (capUsd > 0) return "limited";
  return "none";
}

function sha256Hex(value: string): Hex {
  return `0x${createHash("sha256").update(value, "utf8").digest("hex")}` as Hex;
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
