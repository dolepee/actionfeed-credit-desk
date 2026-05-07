import { buildCreditGatePortfolio } from "@/src/credit/demo";
import mainnetAnchors from "@/src/credit/mainnet-anchors.json";
import { verifyCreditGatePortfolio } from "@/src/credit/verifier";
import type { CreditGateProof } from "@/src/credit/types";
import { Nav, shortHash } from "../shared";
import { IngestPanel } from "./ingest-panel";

export default async function CreditPage() {
  const portfolio = await buildCreditGatePortfolio();
  const verification = verifyCreditGatePortfolio(portfolio);
  const { primary, challenger } = portfolio;
  const hasStorage = Boolean((mainnetAnchors as typeof mainnetAnchors & { storage?: unknown }).storage);

  return (
    <main className="shell">
      <Nav />
      <section className="hero credit-hero">
        <div>
          <div className="eyebrow">operator console - comparative underwriting</div>
          <h1>Two agents. Two histories. Two different spend caps.</h1>
          <p className="lede">
            CreditGate proves the score is a function, not a label: cleaner history
            earns more authority, weaker history gets a tighter cap.
          </p>
        </div>
        <div className="operator-card">
          <span>mainnet anchors</span>
          <strong>{hasStorage ? "13" : "11"}</strong>
          <p>
            {hasStorage
              ? "1 deploy + 10 underwriting txs + 2 Storage txs"
              : "1 deploy + 10 underwriting events on 0G"}
          </p>
        </div>
      </section>

      <section className="section compare-grid">
        <AgentColumn proof={primary} tone="strong" />
        <AgentColumn proof={challenger} tone="weak" />
      </section>

      <section className="section">
        <div className="section-heading">
          <div className="eyebrow">evidence trail</div>
          <h2>From signed history to spend control.</h2>
          <p>
            The operator gets the proof signal in the same screen: the verifier
            checks both agents, score divergence, roots, cap math, refusal semantics,
            and allowed-use policy.
          </p>
        </div>
        <EvidenceTimeline proof={primary} />
        <EvidenceTimeline proof={challenger} />
        <div className="inline-proof">
          <span>verifier</span>
          <strong>{verification.lines[0]}</strong>
          <code>npm run verify:credit</code>
        </div>
      </section>

      <section className="section">
        <IngestPanel sample={primary.signedHistory} />
      </section>
    </main>
  );
}

function AgentColumn({ proof, tone }: { proof: CreditGateProof; tone: "strong" | "weak" }) {
  const signatureCount = proof.signedHistory.length;
  const breakdown = proof.credit.breakdown;
  const breakdownRows = [
    ["valid signatures", breakdown.validSignatures],
    ["completed history", breakdown.completedHistory],
    ["receipt evidence", breakdown.receiptEvidence],
    ["latest review", breakdown.latestReview],
    ["limited history", breakdown.limitedHistoryPenalty],
    ["violations", breakdown.policyViolations],
  ] as const;

  return (
    <article className={`agent-underwrite ${tone}`}>
      <div className="score-panel">
        <div className="eyebrow">agent file</div>
        <h2>{proof.agent.name}</h2>
        <p>{proof.agent.description}</p>
        <div className="score-meter">
          <strong>{proof.credit.score}</strong>
          <span>credit score</span>
        </div>
        <div className="fact-list">
          <div>
            <span>owner</span>
            <strong className="mono">{shortHash(proof.agent.owner)}</strong>
          </div>
          <div>
            <span>signature coverage</span>
            <strong>{signatureCount}/{signatureCount}</strong>
          </div>
          <div>
            <span>earned cap</span>
            <strong>${proof.credit.capUsd}</strong>
          </div>
          <div>
            <span>policy result</span>
            <strong>{tone === "strong" ? "expanded" : "tightened"}</strong>
          </div>
        </div>
      </div>

      <div className="queue-panel">
        <div className="queue-header">
          <div>
            <div className="eyebrow">score breakdown</div>
            <h2>Why {proof.agent.name} gets ${proof.credit.capUsd}.</h2>
          </div>
          <span className="pill">score {proof.credit.score}/100</span>
        </div>
        <div className="breakdown-list">
          {breakdownRows.map(([label, value]) => (
            <div key={label}>
              <span>{label}</span>
              <strong>{value > 0 ? `+${value}` : value}</strong>
            </div>
          ))}
        </div>
        <div className="request-ticket denied">
          <div>
            <span>over-cap deposit</span>
            <strong>${proof.refusal.attemptedUsd}</strong>
          </div>
          <div className="ticket-status">REFUSED</div>
          <p>
            Attempt exceeds the earned cap. CreditGate writes a refusal receipt
            and does not emit an authorized payment-use receipt.
          </p>
          <div className="ticket-meta">
            <span>cap: ${proof.refusal.capUsd}</span>
            <span>root: {shortHash(proof.refusalRoot)}</span>
          </div>
        </div>
        <div className="request-ticket approved">
          <div>
            <span>approved deposit</span>
            <strong>${proof.allowedUse.amountUsd}</strong>
          </div>
          <div className="ticket-status">USED</div>
          <p>Inside the cap, same mandate, signed as an allowed use.</p>
          <div className="ticket-meta">
            <span>action: {proof.allowedUse.action}</span>
            <span>root: {shortHash(proof.allowedUseRoot)}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

function EvidenceTimeline({ proof }: { proof: CreditGateProof }) {
  return (
    <div className="timeline agent-timeline">
      <div>
        <span>agent</span>
        <strong>{proof.agent.name}</strong>
      </div>
      <div>
        <span>history</span>
        <strong>{shortHash(proof.evidenceRoot)}</strong>
      </div>
      <div>
        <span>score</span>
        <strong>{proof.credit.score}/100</strong>
      </div>
      <div>
        <span>refusal</span>
        <strong>{shortHash(proof.refusalRoot)}</strong>
      </div>
      <div>
        <span>allowed use</span>
        <strong>{shortHash(proof.allowedUseRoot)}</strong>
      </div>
    </div>
  );
}
