export type Hex = `0x${string}`;

export type AgentActionType =
  | "yield.quote"
  | "yield.deposit"
  | "yield.rebalance"
  | "risk.review";

export type AgentName = "YieldScout" | "DriftBot";

export type AgentActionEvent = {
  type: "agent.action";
  agent: AgentName;
  seq: number;
  action: AgentActionType;
  amountUsd: number;
  result: "ok" | "review_ok" | "refused" | "violation";
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
  policyViolations: number;
};

export type ScoreMetrics = {
  completedActions: number;
  receiptCount: number;
  hasLatestReview: boolean;
  violationCount: number;
};

export type CreditScoredEvent = {
  type: "credit.scored";
  agent: AgentName;
  score: number;
  capUsd: number;
  evidenceRoot: Hex;
  breakdown: ScoreBreakdown;
};

export type MandateGrantedEvent = {
  type: "mandate.granted";
  agent: AgentName;
  capUsd: number;
  allowedActions: AgentActionType[];
  expiresAt: string;
  evidenceRoot: Hex;
};

export type MandateRefusedEvent = {
  type: "mandate.refused";
  agent: AgentName;
  attemptedAction: AgentActionType;
  attemptedUsd: number;
  capUsd: number;
  reason: "over_budget";
  noPaymentBroadcast: true;
  mandateRoot: Hex;
};

export type DelegationUsedEvent = {
  type: "delegation.used";
  agent: AgentName;
  action: AgentActionType;
  amountUsd: number;
  recipient: Hex;
  mandateRoot: Hex;
};

export type CreditGateProof = {
  agent: {
    name: AgentName;
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

export type CreditGatePortfolio = {
  primary: CreditGateProof;
  challenger: CreditGateProof;
  proofs: CreditGateProof[];
};
