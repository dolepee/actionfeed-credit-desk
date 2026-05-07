import { buildCreditGateProof } from "../../src/credit/demo";
import { verifyCreditGateProof } from "../../src/credit/verifier";

export type OpenClawToolResult = {
  ok: boolean;
  summary: string;
  data: unknown;
};

export type GateReceipt = {
  status: "MANDATE_REFUSED" | "DELEGATION_USED";
  root: string;
  amountUsd: number;
  capUsd: number;
  noPaymentBroadcast?: true;
};

export async function inspectAgentCredit(): Promise<OpenClawToolResult> {
  const proof = await buildCreditGateProof();
  const verification = verifyCreditGateProof(proof);

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
  const proof = await buildCreditGateProof();

  if (amountUsd > proof.mandate.capUsd) {
    return {
      ok: false,
      summary: `MANDATE_REFUSED: requested $${amountUsd}, cap $${proof.mandate.capUsd}`,
      data: {
        receipt: {
          status: "MANDATE_REFUSED",
          root: proof.refusalRoot,
          amountUsd,
          capUsd: proof.mandate.capUsd,
          noPaymentBroadcast: true,
        } satisfies GateReceipt,
        payload: proof.refusal,
      },
    };
  }

  return {
    ok: true,
    summary: `DELEGATION_USED: requested $${amountUsd}, cap $${proof.mandate.capUsd}`,
    data: {
      receipt: {
        status: "DELEGATION_USED",
        root: proof.allowedUseRoot,
        amountUsd,
        capUsd: proof.mandate.capUsd,
      } satisfies GateReceipt,
      payload: proof.allowedUse,
    },
  };
}

export async function recordGateReceipt(result: OpenClawToolResult): Promise<OpenClawToolResult> {
  const receipt = extractReceipt(result.data);
  return {
    ok: true,
    summary: `0G anchor candidate: ${receipt.status} ${receipt.root}`,
    data: {
      anchorType: receipt.status,
      root: receipt.root,
      amountUsd: receipt.amountUsd,
      capUsd: receipt.capUsd,
      noPaymentBroadcast: receipt.noPaymentBroadcast ?? false,
    },
  };
}

function extractReceipt(data: unknown): GateReceipt {
  if (!isRecord(data) || !isRecord(data.receipt)) {
    throw new Error("missing gate receipt");
  }
  return data.receipt as GateReceipt;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
