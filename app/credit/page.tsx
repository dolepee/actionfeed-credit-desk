import { buildCreditDeskProof } from "@/src/credit/demo";
import { verifyCreditDeskProof } from "@/src/credit/verifier";
import { Nav, shortHash } from "../shared";

export default async function CreditPage() {
  const proof = await buildCreditDeskProof();
  const verification = verifyCreditDeskProof(proof);
  const signatureCount = proof.signedHistory.length;

  return (
    <main className="shell">
      <Nav />
      <section className="hero credit-hero">
        <div>
          <div className="eyebrow">operator console - YieldScout</div>
          <h1>One agent. Two spend requests. One hard cap.</h1>
          <p className="lede">
            The desk approves useful autonomy without handing the agent an open
            wallet. The refusal is the headline: no payment was broadcast.
          </p>
        </div>
        <div className="operator-card">
          <span>current mandate</span>
          <strong>${proof.credit.capUsd}</strong>
          <p>Expires {proof.mandate.expiresAt.slice(0, 10)}</p>
        </div>
      </section>

      <section className="section desk-grid">
        <aside className="score-panel">
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
              <span>receipt evidence</span>
              <strong>{proof.credit.breakdown.receiptEvidence}</strong>
            </div>
            <div>
              <span>latest review</span>
              <strong>OK</strong>
            </div>
          </div>
        </aside>

        <div className="queue-panel">
          <div className="queue-header">
            <div>
              <div className="eyebrow">request queue</div>
              <h2>Authority is enforced at runtime.</h2>
            </div>
            <span className="pill">cap ${proof.credit.capUsd}</span>
          </div>

          <div className="request-ticket denied">
            <div>
              <span>over-cap deposit</span>
              <strong>${proof.refusal.attemptedUsd}</strong>
            </div>
            <div className="ticket-status">REFUSED</div>
            <p>
              Attempt exceeds the earned cap. CreditGate writes a refusal receipt
              and no payment broadcast is allowed.
            </p>
            <div className="ticket-meta">
              <span>reason: {proof.refusal.reason}</span>
              <span>root: {shortHash(proof.refusalRoot)}</span>
            </div>
          </div>

          <div className="request-ticket approved">
            <div>
              <span>approved deposit</span>
              <strong>${proof.allowedUse.amountUsd}</strong>
            </div>
            <div className="ticket-status">USED</div>
            <p>
              Same mandate, different outcome. The request is inside the cap and
              matches an allowed action.
            </p>
            <div className="ticket-meta">
              <span>action: {proof.allowedUse.action}</span>
              <span>root: {shortHash(proof.allowedUseRoot)}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div className="eyebrow">evidence trail</div>
          <h2>From signed history to spend control.</h2>
          <p>
            The operator gets the proof signal in the same screen: the verifier
            checks signatures, roots, cap math, refusal semantics, and allowed-use policy.
          </p>
        </div>
        <div className="timeline">
          <div>
            <span>history</span>
            <strong>{shortHash(proof.evidenceRoot)}</strong>
          </div>
          <div>
            <span>score</span>
            <strong>{proof.credit.score}/100</strong>
          </div>
          <div>
            <span>mandate</span>
            <strong>{shortHash(proof.mandateRoot)}</strong>
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
        <div className="inline-proof">
          <span>verifier</span>
          <strong>{verification.lines[0]}</strong>
          <code>npm run verify:credit</code>
        </div>
      </section>
    </main>
  );
}
