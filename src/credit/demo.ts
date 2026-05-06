import { Wallet } from "ethers";
import { canonicalJson, hashCanonical } from "./canonical";
import mainnetAnchors from "./mainnet-anchors.json";
import { capForScore, isOverCap, scoreYieldScout } from "./policy";
import type {
  AgentActionEvent,
  CreditDeskProof,
  CreditScoredEvent,
  DelegationUsedEvent,
  Hex,
  MandateGrantedEvent,
  MandateRefusedEvent,
  SignedAgentAction,
} from "./types";

const YIELDSCOUT_PRIVATE_KEY =
  "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

const RECIPIENT: Hex = "0x1111111111111111111111111111111111111111";

export async function buildCreditDeskProof(): Promise<CreditDeskProof> {
  const wallet = new Wallet(YIELDSCOUT_PRIVATE_KEY);
  const unsignedHistory = buildHistory();
  const signedHistory = await Promise.all(
    unsignedHistory.map((payload) => signAction(wallet, payload)),
  );
  const evidenceRoot = hashCanonical(signedHistory);

  const scored = scoreYieldScout(unsignedHistory);
  const credit: CreditScoredEvent = {
    ...scored,
    evidenceRoot,
  };
  const creditRoot = hashCanonical(credit);

  if (credit.score !== 73 || capForScore(credit.score) !== 500) {
    throw new Error("demo score policy drifted; expected score 73 and cap 500");
  }

  const mandate: MandateGrantedEvent = {
    type: "mandate.granted",
    agent: "YieldScout",
    capUsd: credit.capUsd,
    allowedActions: ["yield.quote", "yield.deposit", "yield.rebalance"],
    expiresAt: "2026-05-20T00:00:00Z",
    evidenceRoot,
  };
  const mandateRoot = hashCanonical(mandate);

  const attemptedUsd = 1_200;
  if (!isOverCap(attemptedUsd, mandate.capUsd)) {
    throw new Error("demo refusal must be over cap");
  }

  const refusal: MandateRefusedEvent = {
    type: "mandate.refused",
    agent: "YieldScout",
    attemptedAction: "yield.deposit",
    attemptedUsd,
    capUsd: mandate.capUsd,
    reason: "over_budget",
    noPaymentBroadcast: true,
    mandateRoot,
  };
  const refusalRoot = hashCanonical(refusal);

  const allowedUse: DelegationUsedEvent = {
    type: "delegation.used",
    agent: "YieldScout",
    action: "yield.deposit",
    amountUsd: 250,
    recipient: RECIPIENT,
    mandateRoot,
  };
  const allowedUseRoot = hashCanonical(allowedUse);

  return {
    agent: {
      name: "YieldScout",
      owner: wallet.address as Hex,
      description: "OpenClaw-style autonomous yield agent asking for bounded spend authority.",
    },
    signedHistory,
    evidenceRoot,
    credit,
    creditRoot,
    mandate,
    mandateRoot,
    refusal,
    refusalRoot,
    allowedUse,
    allowedUseRoot,
    anchors: {
      chainId: mainnetAnchors.chainId,
      chainName: mainnetAnchors.chainName,
      registryAddress: mainnetAnchors.registryAddress as CreditDeskProof["anchors"]["registryAddress"],
      explorerUrl: mainnetAnchors.explorerUrl,
      storageNote: mainnetAnchors.storageNote,
    },
  };
}

function buildHistory(): AgentActionEvent[] {
  return [
    action(1, "yield.quote", 120, "ok", "0xaa01"),
    action(2, "yield.deposit", 180, "ok", "0xaa02"),
    action(3, "yield.quote", 220, "ok"),
    action(4, "yield.rebalance", 240, "ok", "0xaa04"),
    action(5, "yield.quote", 310, "ok"),
    action(6, "yield.deposit", 260, "ok", "0xaa06"),
    action(7, "yield.quote", 90, "ok"),
    action(8, "yield.rebalance", 140, "ok"),
    {
      type: "agent.action",
      agent: "YieldScout",
      seq: 9,
      action: "risk.review",
      amountUsd: 0,
      result: "review_ok",
      timestamp: "2026-05-06T09:08:00Z",
    },
  ];
}

function action(
  seq: number,
  actionType: AgentActionEvent["action"],
  amountUsd: number,
  result: AgentActionEvent["result"],
  receiptSeed?: string,
): AgentActionEvent {
  return {
    type: "agent.action",
    agent: "YieldScout",
    seq,
    action: actionType,
    amountUsd,
    result,
    timestamp: `2026-05-06T09:0${seq}:00Z`,
    ...(receiptSeed ? { receiptHash: hashCanonical({ receiptSeed }) } : {}),
  };
}

async function signAction(wallet: Wallet, payload: AgentActionEvent): Promise<SignedAgentAction> {
  const canonical = canonicalJson(payload);
  const signature = (await wallet.signMessage(canonical)) as Hex;
  return {
    payload,
    signer: wallet.address as Hex,
    signature,
    payloadHash: hashCanonical(payload),
  };
}
