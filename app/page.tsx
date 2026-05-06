import Link from "next/link";
import { buildCreditDeskProof } from "@/src/credit/demo";
import { Nav, shortHash } from "./shared";

export default async function HomePage() {
  const proof = await buildCreditDeskProof();

  return (
    <main className="shell">
      <Nav />
      <section className="hero">
        <div className="hero-grid">
          <div>
            <div className="eyebrow">0G APAC - mainnet-ready agentic infrastructure</div>
            <h1>Credit history that controls agent spend.</h1>
            <p className="lede">
              ActionFeed Credit Desk turns signed 0G agent history into a credit score,
              a bounded mandate, and refusal receipts when an autonomous agent tries to
              exceed its earned authority.
            </p>
            <div className="actions">
              <Link className="button" href="/credit">Run the Credit Desk</Link>
              <Link className="chip" href="/proof">Open proof packet</Link>
            </div>
          </div>

          <div className="hero-terminal">
            <div className="terminal-top">
              <span />
              <span />
              <span />
            </div>
            <p className="mono">YIELDSCOUT_CREDIT_REPORT</p>
            <div className="terminal-score">{proof.credit.score}<small>/100</small></div>
            <div className="terminal-line">
              <span>authorized cap</span>
              <strong>${proof.credit.capUsd}</strong>
            </div>
            <div className="terminal-line danger">
              <span>attempted</span>
              <strong>${proof.refusal.attemptedUsd}</strong>
            </div>
            <div className="terminal-verdict">MANDATE_REFUSED</div>
          </div>
        </div>
      </section>

      <section className="section band">
        <div>
          <div className="eyebrow">why this is not a score dashboard</div>
          <h2>The score changes what the agent is allowed to do.</h2>
        </div>
        <p>
          Many 0G projects can store memory or rank agents. Credit Desk closes the
          authority loop: signed history becomes a cap, the cap blocks an unsafe
          action, and the refusal itself becomes part of the public record.
        </p>
      </section>

      <section className="section">
        <div className="flow">
          <div className="flow-step">
            <span>01</span>
            <h3>Signed history</h3>
            <p>YieldScout publishes public actions and receipts as verifiable records.</p>
          </div>
          <div className="flow-step">
            <span>02</span>
            <h3>Credit score</h3>
            <p>Deterministic verifier replays the history and calculates 73/100.</p>
          </div>
          <div className="flow-step">
            <span>03</span>
            <h3>Bounded mandate</h3>
            <p>The operator grants a $500 cap, not unlimited wallet authority.</p>
          </div>
          <div className="flow-step critical">
            <span>04</span>
            <h3>Refusal receipt</h3>
            <p>A $1,200 attempt is refused before spend and prepared for 0G anchoring.</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="grid cols-3">
          <div className="score-card">
            <h3>YieldScout score</h3>
            <div className="score">{proof.credit.score}<small>/100</small></div>
            <p>Derived from signed action history, receipts, and latest risk review.</p>
          </div>
          <div className="card">
            <h3>Spend cap</h3>
            <div className="metric">${proof.credit.capUsd}</div>
            <p>Authority is bounded by public history, not hidden operator trust.</p>
          </div>
          <div className="card">
            <h3>Refused attempt</h3>
            <div className="metric">${proof.refusal.attemptedUsd}</div>
            <p>Over-cap attempt is refused before spend and recorded as a public receipt.</p>
            <p className="mono">root {shortHash(proof.refusalRoot)}</p>
          </div>
        </div>
      </section>
    </main>
  );
}

