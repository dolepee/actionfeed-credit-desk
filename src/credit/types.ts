export type Hex = `0x${string}`;

export type AgentActionType =
  | "yield.quote"
  | "yield.deposit"
  | "yield.rebalance"
  | "risk.review";

export type AgentActionEvent = {
  type: "agent.action";
  agent: "YieldScout";
  seq: number;
  action: AgentActionType;
  amountUsd: number;
  result: "ok" | "review_ok";
  timestamp: string;
  receiptHash?: Hex;
};

export type SignedAgentAction = {
  payload: AgentActionEvent;
  signer: Hex;
  signature: Hex;
  payloadHash: Hex;
};

export type ScoreBreakdown = {
  validSignatures: number;
  completedHistory: number;
  receiptEvidence: number;
  latestReview: number;
  limitedHistoryPenalty: number;
};

export type CreditScoredEvent = {
  type: "credit.scored";
  agent: "YieldScout";
  score: number;
  capUsd: number;
  evidenceRoot: Hex;
  breakdown: ScoreBreakdown;
};

export type MandateGrantedEvent = {
  type: "mandate.granted";
  agent: "YieldScout";
  capUsd: number;
  allowedActions: AgentActionType[];
  expiresAt: string;
  evidenceRoot: Hex;
};

export type MandateRefusedEvent = {
  type: "mandate.refused";
  agent: "YieldScout";
  attemptedAction: AgentActionType;
  attemptedUsd: number;
  capUsd: number;
  reason: "over_budget";
  noPaymentBroadcast: true;
  mandateRoot: Hex;
};

export type DelegationUsedEvent = {
  type: "delegation.used";
  agent: "YieldScout";
  action: AgentActionType;
  amountUsd: number;
  recipient: Hex;
  mandateRoot: Hex;
};

export type CreditDeskProof = {
  agent: {
    name: "YieldScout";
    owner: Hex;
    description: string;
  };
  signedHistory: SignedAgentAction[];
  evidenceRoot: Hex;
  credit: CreditScoredEvent;
  creditRoot: Hex;
  mandate: MandateGrantedEvent;
  mandateRoot: Hex;
  refusal: MandateRefusedEvent;
  refusalRoot: Hex;
  allowedUse: DelegationUsedEvent;
  allowedUseRoot: Hex;
  anchors: {
    chainId: number;
    chainName: string;
    registryAddress: Hex | "pending-mainnet-deploy";
    explorerUrl: string;
    storageNote: string;
  };
};

