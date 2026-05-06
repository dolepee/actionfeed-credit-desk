import { buildCreditDeskProof } from "../../src/credit/demo";
import { verifyCreditDeskProof } from "../../src/credit/verifier";

export type OpenClawToolResult = {
  ok: boolean;
  summary: string;
  data: unknown;
};

export async function inspectAgentCredit(): Promise<OpenClawToolResult> {
  const proof = await buildCreditDeskProof();
  const verification = verifyCreditDeskProof(proof);

  return {
    ok: true,
    summary: `${proof.agent.name} score ${proof.credit.score}/100, cap $${proof.credit.capUsd}`,
    data: {
      agent: proof.agent.name,
      score: proof.credit.score,
      capUsd: proof.credit.capUsd,
      evidenceRoot: proof.evidenceRoot,
      verifier: verification.lines,
    },
  };
}

export async function requestAuthority(amountUsd: number): Promise<OpenClawToolResult> {
  const proof = await buildCreditDeskProof();

  if (amountUsd > proof.mandate.capUsd) {
    return {
      ok: false,
      summary: `MANDATE_REFUSED: requested $${amountUsd}, cap $${proof.mandate.capUsd}`,
      data: {
        receipt: proof.refusal,
        root: proof.refusalRoot,
      },
    };
  }

  return {
    ok: true,
    summary: `DELEGATION_USED: requested $${amountUsd}, cap $${proof.mandate.capUsd}`,
    data: {
      receipt: proof.allowedUse,
      root: proof.allowedUseRoot,
    },
  };
}

