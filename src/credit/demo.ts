import { Wallet } from "ethers";
import { canonicalJson, hashCanonical } from "./canonical";
import mainnetAnchors from "./mainnet-anchors.json";
import { capForScore, isOverCap, scoreYieldScout } from "./policy";
import type {
  AgentActionEvent,
  AgentName,
  CreditDeskPortfolio,
  CreditDeskProof,
  CreditScoredEvent,
  DelegationUsedEvent,
  Hex,
  MandateGrantedEvent,
  MandateRefusedEvent,
  SignedAgentAction,
} from "./types";

const AGENTS = {
  YieldScout: {
    privateKey: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    description: "OpenClaw-style autonomous yield agent asking for bounded spend authority.",
    expectedScore: 73,
    expectedCap: 500,
    attemptedUsd: 1_200,
    allowedUseUsd: 250,
  },
  DriftBot: {
    privateKey: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
    description: "Thin-history yield agent with two signed policy violations and a tighter spend ceiling.",
    expectedScore: 41,
    expectedCap: 150,
    attemptedUsd: 500,
    allowedUseUsd: 75,
  },
} as const satisfies Record<AgentName, {
  privateKey: Hex;
  description: string;
  expectedScore: number;
  expectedCap: number;
  attemptedUsd: number;
  allowedUseUsd: number;
}>;

const RECIPIENT: Hex = "0x1111111111111111111111111111111111111111";

export async function buildCreditDeskProof(): Promise<CreditDeskProof> {
  return buildAgentProof("YieldScout");
}

export async function buildCreditDeskPortfolio(): Promise<CreditDeskPortfolio> {
  const primary = await buildAgentProof("YieldScout");
  const challenger = await buildAgentProof("DriftBot");
  return {
    primary,
    challenger,
    proofs: [primary, challenger],
  };
}

async function buildAgentProof(agent: AgentName): Promise<CreditDeskProof> {
  const config = AGENTS[agent];
  const wallet = new Wallet(config.privateKey);
  const unsignedHistory = buildHistory(agent);
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

  if (credit.score !== config.expectedScore || capForScore(credit.score) !== config.expectedCap) {
    throw new Error(
      `${agent} score policy drifted; expected score ${config.expectedScore} and cap ${config.expectedCap}`,
    );
  }

  const mandate: MandateGrantedEvent = {
    type: "mandate.granted",
    agent,
    capUsd: credit.capUsd,
    allowedActions: ["yield.quote", "yield.deposit", "yield.rebalance"],
    expiresAt: "2026-05-20T00:00:00Z",
    evidenceRoot,
  };
  const mandateRoot = hashCanonical(mandate);

  const attemptedUsd = config.attemptedUsd;
  if (!isOverCap(attemptedUsd, mandate.capUsd)) {
    throw new Error(`${agent} refusal must be over cap`);
  }

  const refusal: MandateRefusedEvent = {
    type: "mandate.refused",
    agent,
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
    agent,
    action: "yield.deposit",
    amountUsd: config.allowedUseUsd,
    recipient: RECIPIENT,
    mandateRoot,
  };
  const allowedUseRoot = hashCanonical(allowedUse);

  return {
    agent: {
      name: agent,
      owner: wallet.address as Hex,
      description: config.description,
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

function buildHistory(agent: AgentName): AgentActionEvent[] {
  if (agent === "DriftBot") {
    return [
      action(agent, 1, "yield.quote", 80, "ok", "0xbb01"),
      action(agent, 2, "yield.deposit", 240, "violation"),
      action(agent, 3, "yield.quote", 120, "ok"),
      action(agent, 4, "yield.deposit", 410, "violation"),
      action(agent, 5, "yield.rebalance", 90, "refused"),
      action(agent, 6, "yield.quote", 70, "ok"),
    ];
  }

  return [
    action(agent, 1, "yield.quote", 120, "ok", "0xaa01"),
    action(agent, 2, "yield.deposit", 180, "ok", "0xaa02"),
    action(agent, 3, "yield.quote", 220, "ok"),
    action(agent, 4, "yield.rebalance", 240, "ok", "0xaa04"),
    action(agent, 5, "yield.quote", 310, "ok"),
    action(agent, 6, "yield.deposit", 260, "ok", "0xaa06"),
    action(agent, 7, "yield.quote", 90, "ok"),
    action(agent, 8, "yield.rebalance", 140, "ok"),
    {
      type: "agent.action",
      agent,
      seq: 9,
      action: "risk.review",
      amountUsd: 0,
      result: "review_ok",
      timestamp: "2026-05-06T09:08:00Z",
    },
  ];
}

function action(
  agent: AgentName,
  seq: number,
  actionType: AgentActionEvent["action"],
  amountUsd: number,
  result: AgentActionEvent["result"],
  receiptSeed?: string,
): AgentActionEvent {
  return {
    type: "agent.action",
    agent,
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
