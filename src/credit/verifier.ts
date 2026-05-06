import { verifyMessage } from "ethers";
import { canonicalJson, hashCanonical } from "./canonical";
import { capForScore, scoreYieldScout } from "./policy";
import type { CreditDeskProof, Hex } from "./types";

export type CreditVerificationResult = {
  valid: true;
  lines: string[];
};

export function verifyCreditDeskProof(proof: CreditDeskProof): CreditVerificationResult {
  const lines: string[] = [];

  assert(proof.agent.name === "YieldScout", "unexpected agent");
  assert(proof.signedHistory.length >= 9, "history too short");

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
  assert(proof.credit.score === 73, "demo score must be 73");
  assert(proof.credit.capUsd === capForScore(proof.credit.score), "cap policy mismatch");
  assert(proof.credit.capUsd === 500, "demo cap must be 500");
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

  lines.push("CREDIT_DESK_VALID");
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

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

