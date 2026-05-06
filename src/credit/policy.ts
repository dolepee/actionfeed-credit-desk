import type { AgentActionEvent, CreditScoredEvent, ScoreBreakdown } from "./types";

export function scoreYieldScout(events: AgentActionEvent[]): CreditScoredEvent {
  const completedActions = events.filter((event) => event.result === "ok").length;
  const receiptCount = events.filter((event) => event.receiptHash).length;
  const hasLatestReview = events.at(-1)?.action === "risk.review";

  const breakdown: ScoreBreakdown = {
    validSignatures: 30,
    completedHistory: completedActions >= 8 ? 20 : 10,
    receiptEvidence: receiptCount >= 3 ? 15 : 5,
    latestReview: hasLatestReview ? 10 : 0,
    limitedHistoryPenalty: -2,
  };

  const score =
    breakdown.validSignatures +
    breakdown.completedHistory +
    breakdown.receiptEvidence +
    breakdown.latestReview +
    breakdown.limitedHistoryPenalty;

  return {
    type: "credit.scored",
    agent: "YieldScout",
    score,
    capUsd: capForScore(score),
    evidenceRoot: "0x0000000000000000000000000000000000000000000000000000000000000000",
    breakdown,
  };
}

export function capForScore(score: number): number {
  if (score >= 85) return 2_000;
  if (score >= 70) return 500;
  if (score >= 50) return 100;
  return 0;
}

export function isOverCap(attemptedUsd: number, capUsd: number): boolean {
  return attemptedUsd > capUsd;
}

