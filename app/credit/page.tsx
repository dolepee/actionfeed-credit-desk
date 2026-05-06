import { buildCreditDeskProof } from "@/src/credit/demo";
import { Nav, shortHash } from "../shared";

export default async function CreditPage() {
  const proof = await buildCreditDeskProof();

  return (
    <main className="shell">
      <Nav />
      <section className="hero">
        <div className="eyebrow">operator view · YieldScout</div>
        <h1>Public history becomes spend authority.</h1>
        <p className="lede">
          YieldScout is an OpenClaw-style autonomous yield agent. Credit Desk reads
          its signed 0G history, assigns a spend cap, refuses over-cap requests, and
          records the safe under-cap use.
        </p>
      </section>

      <section className="section">
        <div className="grid cols-2">
          <div className="score-card">
            <h3>Agent credit score</h3>
            <div className="score">{proof.credit.score}<small>/100</small></div>
            <p>{proof.agent.description}</p>
            <div className="row">
              <span>owner</span>
              <span className="mono">{shortHash(proof.agent.owner)}</span>
            </div>
            <div className="row">
              <span>authorized cap</span>
              <span>${proof.credit.capUsd}</span>
            </div>
          </div>
          <div className="card">
            <h3>Evidence inputs</h3>
            <div className="row">
              <span>signed events</span>
              <span>{proof.signedHistory.length}/{proof.signedHistory.length}</span>
            </div>
            <div className="row">
              <span>completed actions</span>
              <span>8</span>
            </div>
            <div className="row">
              <span>receipt evidence</span>
              <span>4 receipts</span>
            </div>
            <div className="row">
              <span>latest review</span>
              <span>review_ok</span>
            </div>
            <div className="row">
              <span>evidence root</span>
              <span className="mono">{shortHash(proof.evidenceRoot)}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="grid cols-2">
          <div className="receipt refused">
            <div className="stamp">MANDATE_REFUSED</div>
            <p>
              YieldScout attempted a ${proof.refusal.attemptedUsd} action under a
              ${proof.refusal.capUsd} cap. Credit Desk refused it before spend.
            </p>
            <div className="row">
              <span>attempted</span>
              <span>${proof.refusal.attemptedUsd}</span>
            </div>
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
              <span>refusal root</span>
              <span className="mono">{shortHash(proof.refusalRoot)}</span>
            </div>
          </div>

          <div className="receipt allowed">
            <div className="stamp">DELEGATION_USED</div>
            <p>
              Under the same mandate, a ${proof.allowedUse.amountUsd} action is
              allowed because it stays inside the cap and action policy.
            </p>
            <div className="row">
              <span>amount</span>
              <span>${proof.allowedUse.amountUsd}</span>
            </div>
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
              <span>use root</span>
              <span className="mono">{shortHash(proof.allowedUseRoot)}</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

