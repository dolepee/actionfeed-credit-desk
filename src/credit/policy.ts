import type { AgentActionEvent, CreditScoredEvent, ScoreBreakdown, ScoreMetrics } from "./types";

export function scoreYieldScout(events: AgentActionEvent[]): CreditScoredEvent {
  return scoreAgentHistory(events);
}

export function scoreAgentHistory(events: AgentActionEvent[]): CreditScoredEvent {
  const agent = events[0]?.agent;
  if (!agent) throw new Error("cannot score empty history");

  const metrics = scoreMetricsForHistory(events);
  const score = scoreFromMetrics(metrics);

  const breakdown: ScoreBreakdown = {
    validSignatures: 30,
    completedHistory: metrics.completedActions >= 8 ? 20 : 10,
    receiptEvidence: metrics.receiptCount >= 3 ? 15 : 5,
    latestReview: metrics.hasLatestReview ? 10 : 0,
    limitedHistoryPenalty: -2,
    policyViolations: metrics.violationCount > 0 ? -Math.min(12, metrics.violationCount) : 0,
  };

  return {
    type: "credit.scored",
    agent,
    score,
    capUsd: capForScore(score),
    evidenceRoot: "0x0000000000000000000000000000000000000000000000000000000000000000",
    breakdown,
  };
}

export function scoreMetricsForHistory(events: AgentActionEvent[]): ScoreMetrics {
  return {
    completedActions: events.filter((event) => event.result === "ok").length,
    receiptCount: events.filter((event) => event.receiptHash).length,
    hasLatestReview: events.at(-1)?.action === "risk.review",
    violationCount: events.filter((event) => event.result === "violation").length,
  };
}

export function scoreFromMetrics(metrics: ScoreMetrics): number {
  return (
    30 +
    (metrics.completedActions >= 8 ? 20 : 10) +
    (metrics.receiptCount >= 3 ? 15 : 5) +
    (metrics.hasLatestReview ? 10 : 0) -
    2 -
    (metrics.violationCount > 0 ? Math.min(12, metrics.violationCount) : 0)
  );
}

export function capForScore(score: number): number {
  if (score >= 85) return 2_000;
  if (score >= 70) return 500;
  if (score >= 40) return 150;
  return 0;
}

export function isOverCap(attemptedUsd: number, capUsd: number): boolean {
  return attemptedUsd > capUsd;
}
