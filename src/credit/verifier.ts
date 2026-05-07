import { verifyMessage } from "ethers";
import { canonicalJson, hashCanonical } from "./canonical";
import { capForScore, scoreYieldScout } from "./policy";
import type { CreditGatePortfolio, CreditGateProof, Hex } from "./types";

export type CreditVerificationResult = {
  valid: true;
  lines: string[];
};

export function verifyCreditGateProof(proof: CreditGateProof): CreditVerificationResult {
  const lines: string[] = [];

  assert(proof.signedHistory.length >= 6, "history too short");

  let validSignatures = 0;
  for (const signed of proof.signedHistory) {
    const recovered = verifyMessage(canonicalJson(signed.payload), signed.signature) as Hex;
    assert(
      recovered.toLowerCase() === signed.signer.toLowerCase(),
      `signature mismatch at seq ${signed.payload.seq}`,
    );
    assert(signed.payloadHash === hashCanonical(signed.payload), `payload hash mismatch at seq ${signed.payload.seq}`);
    validSignatures += 1;
  }

  assert(proof.evidenceRoot === hashCanonical(proof.signedHistory), "evidence root mismatch");

  const expectedCredit = scoreYieldScout(proof.signedHistory.map((event) => event.payload));
  assert(proof.credit.score === expectedCredit.score, "score mismatch");
  assert(proof.credit.capUsd === capForScore(proof.credit.score), "cap policy mismatch");
  assert(proof.credit.evidenceRoot === proof.evidenceRoot, "credit evidence root mismatch");
  assert(proof.creditRoot === hashCanonical(proof.credit), "credit root mismatch");

  assert(proof.mandate.evidenceRoot === proof.evidenceRoot, "mandate evidence root mismatch");
  assert(proof.mandate.capUsd === proof.credit.capUsd, "mandate cap mismatch");
  assert(proof.mandateRoot === hashCanonical(proof.mandate), "mandate root mismatch");

  assert(proof.refusal.mandateRoot === proof.mandateRoot, "refusal mandate root mismatch");
  assert(proof.refusal.attemptedUsd > proof.refusal.capUsd, "refusal must be over cap");
  assert(proof.refusal.capUsd === proof.mandate.capUsd, "refusal cap mismatch");
  assert(proof.refusal.reason === "over_budget", "refusal reason mismatch");
  assert(proof.refusal.noPaymentBroadcast === true, "refusal must prove no payment broadcast");
  assert(proof.refusalRoot === hashCanonical(proof.refusal), "refusal root mismatch");

  assert(proof.allowedUse.mandateRoot === proof.mandateRoot, "allowed use mandate root mismatch");
  assert(proof.allowedUse.amountUsd <= proof.mandate.capUsd, "allowed use exceeds cap");
  assert(proof.mandate.allowedActions.includes(proof.allowedUse.action), "allowed use action not in mandate");
  assert(proof.allowedUseRoot === hashCanonical(proof.allowedUse), "allowed use root mismatch");

  lines.push("CREDITGATE_VALID");
  lines.push(`agent: ${proof.agent.name}`);
  lines.push(`owner: ${proof.agent.owner}`);
  lines.push(`signatures: ${validSignatures}/${proof.signedHistory.length}`);
  lines.push(`score: ${proof.credit.score}/100`);
  lines.push(`cap: ${proof.credit.capUsd} USD`);
  lines.push(`refusal: ${proof.refusal.attemptedUsd} > ${proof.refusal.capUsd}, no payment broadcast`);
  lines.push(`allowed use: ${proof.allowedUse.amountUsd} <= ${proof.mandate.capUsd}`);
  lines.push(`evidence root: ${proof.evidenceRoot}`);
  lines.push(`mandate root: ${proof.mandateRoot}`);
  lines.push(`refusal root: ${proof.refusalRoot}`);
  lines.push(`allowed use root: ${proof.allowedUseRoot}`);

  return { valid: true, lines };
}

export function verifyCreditGatePortfolio(portfolio: CreditGatePortfolio): CreditVerificationResult {
  const primary = verifyCreditGateProof(portfolio.primary);
  const challenger = verifyCreditGateProof(portfolio.challenger);

  assert(portfolio.proofs.length === 2, "portfolio must contain two agents");
  assert(portfolio.primary.agent.name === "YieldScout", "primary agent mismatch");
  assert(portfolio.challenger.agent.name === "DriftBot", "challenger agent mismatch");
  assert(portfolio.primary.credit.score === 73, "YieldScout score must be 73");
  assert(portfolio.primary.credit.capUsd === 500, "YieldScout cap must be 500");
  assert(portfolio.challenger.credit.score === 41, "DriftBot score must be 41");
  assert(portfolio.challenger.credit.capUsd === 150, "DriftBot cap must be 150");
  assert(portfolio.primary.credit.score > portfolio.challenger.credit.score, "score comparison failed");
  assert(portfolio.primary.credit.capUsd > portfolio.challenger.credit.capUsd, "cap comparison failed");

  return {
    valid: true,
    lines: [
      "CREDITGATE_PORTFOLIO_VALID",
      `agents: ${portfolio.primary.agent.name}, ${portfolio.challenger.agent.name}`,
      `comparison: ${portfolio.primary.credit.score}/100 -> $${portfolio.primary.credit.capUsd}; ${portfolio.challenger.credit.score}/100 -> $${portfolio.challenger.credit.capUsd}`,
      `primary: ${primary.lines[0]}`,
      `challenger: ${challenger.lines[0]}`,
      `YieldScout refusal: ${portfolio.primary.refusal.attemptedUsd} > ${portfolio.primary.refusal.capUsd}, no payment broadcast`,
      `DriftBot refusal: ${portfolio.challenger.refusal.attemptedUsd} > ${portfolio.challenger.refusal.capUsd}, no payment broadcast`,
      `YieldScout evidence root: ${portfolio.primary.evidenceRoot}`,
      `DriftBot evidence root: ${portfolio.challenger.evidenceRoot}`,
    ],
  };
}

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}
