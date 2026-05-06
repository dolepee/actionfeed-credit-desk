import { buildCreditDeskProof } from "@/src/credit/demo";
import { Nav, shortHash } from "../shared";

export default async function CreditPage() {
  const proof = await buildCreditDeskProof();

  return (
    <main className="shell">
      <Nav />
      <section className="hero">
        <div className="eyebrow">operator desk - YieldScout</div>
        <h1>Approve the agent. Not the wallet.</h1>
        <p className="lede">
          YieldScout is an OpenClaw-style autonomous yield agent asking for spend
          authority. Credit Desk converts its public record into a cap, refuses
          the dangerous request, and allows the safe one.
        </p>
      </section>

      <section className="section command-center">
        <div className="score-card score-command">
          <div>
            <h3>Agent credit score</h3>
            <div className="score">{proof.credit.score}<small>/100</small></div>
            <p>{proof.agent.description}</p>
          </div>
          <div className="score-rules">
            <div className="row">
              <span>owner</span>
              <span className="mono">{shortHash(proof.agent.owner)}</span>
            </div>
            <div className="row">
              <span>authorized cap</span>
              <span>${proof.credit.capUsd}</span>
            </div>
            <div className="row">
              <span>score tier</span>
              <span>bounded authority</span>
            </div>
            <div className="row">
              <span>mandate status</span>
              <span>active until May 20</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="grid cols-3">
          <div className="card evidence-card">
            <h3>History</h3>
            <div className="metric">{proof.signedHistory.length}/{proof.signedHistory.length}</div>
            <p>signed YieldScout events verify against one agent owner.</p>
          </div>
          <div className="card evidence-card">
            <h3>Receipts</h3>
            <div className="metric">4</div>
            <p>completed actions include receipt hashes in the replayed history.</p>
          </div>
          <div className="card evidence-card">
            <h3>Risk review</h3>
            <div className="metric">OK</div>
            <p>latest action is a positive risk review before mandate grant.</p>
          </div>
        </div>
      </section>

      <section className="section decision-section">
        <div className="decision-copy">
          <div className="eyebrow">live authority simulation</div>
          <h2>Two requests. One mandate. Different outcomes.</h2>
          <p>
            The gate is not a blanket block. It enforces the cap generated from
            public history: refuse above cap, allow inside cap, write both receipts.
          </p>
        </div>
        <div className="grid cols-2">
          <div className="receipt refused spotlight">
            <div className="receipt-label">blocked before spend</div>
            <div className="stamp">MANDATE_REFUSED</div>
            <div className="receipt-amount">${proof.refusal.attemptedUsd}</div>
            <p>
              YieldScout attempted a ${proof.refusal.attemptedUsd} action under a
              ${proof.refusal.capUsd} cap. Credit Desk refused it before spend.
            </p>
            <div className="row">
              <span>cap</span>
              <span>${proof.refusal.capUsd}</span>
            </div>
            <div className="row">
              <span>reason</span>
              <span>{proof.refusal.reason}</span>
            </div>
            <div className="row">
              <span>payment broadcast</span>
              <span>none</span>
            </div>
            <div className="row">
              <span>0G root</span>
              <span className="mono">{shortHash(proof.refusalRoot)}</span>
            </div>
          </div>

          <div className="receipt allowed spotlight">
            <div className="receipt-label">allowed under cap</div>
            <div className="stamp">DELEGATION_USED</div>
            <div className="receipt-amount">${proof.allowedUse.amountUsd}</div>
            <p>
              Under the same mandate, a ${proof.allowedUse.amountUsd} action is
              allowed because it stays inside the cap and action policy.
            </p>
            <div className="row">
              <span>cap</span>
              <span>${proof.mandate.capUsd}</span>
            </div>
            <div className="row">
              <span>action</span>
              <span>{proof.allowedUse.action}</span>
            </div>
            <div className="row">
              <span>recipient</span>
              <span className="mono">{shortHash(proof.allowedUse.recipient)}</span>
            </div>
            <div className="row">
              <span>0G root</span>
              <span className="mono">{shortHash(proof.allowedUseRoot)}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
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
      </section>
    </main>
  );
}

