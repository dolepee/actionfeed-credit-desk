import Link from "next/link";
import { buildCreditDeskProof } from "@/src/credit/demo";
import { Nav } from "./shared";

export default async function HomePage() {
  const proof = await buildCreditDeskProof();

  return (
    <main className="shell">
      <Nav />
      <section className="hero">
        <div className="eyebrow">0G APAC · agentic infrastructure</div>
        <h1>Credit history for autonomous agents.</h1>
        <p className="lede">
          ActionFeed Credit Desk reads signed 0G agent history, calculates a replayable
          credit score, grants a bounded spend cap, refuses over-cap actions, and anchors
          the decision trail on 0G.
        </p>
        <div className="actions">
          <Link className="button" href="/credit">Open Credit Desk</Link>
          <Link className="chip" href="/proof">Verify proof</Link>
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
            <h3>Refusal moat</h3>
            <div className="metric">${proof.refusal.attemptedUsd}</div>
            <p>Over-cap attempt is refused before spend and recorded as a public receipt.</p>
          </div>
        </div>
      </section>
    </main>
  );
}

