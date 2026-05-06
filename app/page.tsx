import Link from "next/link";
import { buildCreditDeskProof } from "@/src/credit/demo";
import { Nav, shortHash } from "./shared";

export default async function HomePage() {
  const proof = await buildCreditDeskProof();
  const historyCount = proof.signedHistory.length;

  return (
    <main className="shell">
      <Nav />
      <section className="hero product-hero">
        <div className="hero-copy">
          <div className="eyebrow">0G APAC - agent authority desk</div>
          <h1>Underwrite an agent before it spends.</h1>
          <p className="lede">
            CreditGate turns signed 0G action history into a spend cap, then
            enforces the cap with public allow and refusal receipts.
            </p>
            <div className="actions">
              <Link className="button" href="/credit">Open live desk</Link>
              <a className="button secondary" href="https://github.com/dolepee/actionfeed-credit-desk">
                Read source
              </a>
            </div>
          </div>

        <div className="decision-board" aria-label="YieldScout underwriting summary">
          <div className="board-header">
            <span>YIELDSCOUT</span>
            <strong>AUTHORITY REVIEW</strong>
          </div>
          <div className="grade-ring">
            <span>{proof.credit.score}</span>
            <small>/100</small>
          </div>
          <div className="board-grid">
            <div>
              <span>earned cap</span>
              <strong>${proof.credit.capUsd}</strong>
            </div>
            <div>
              <span>signed events</span>
              <strong>{historyCount}/{historyCount}</strong>
            </div>
          </div>
          <div className="request denied">
            <span>request ${proof.refusal.attemptedUsd}</span>
            <strong>DENIED</strong>
          </div>
          <div className="request approved">
            <span>request ${proof.allowedUse.amountUsd}</span>
            <strong>APPROVED</strong>
          </div>
        </div>
      </section>

      <section className="section thesis-strip">
        <span>History is not decoration.</span>
        <strong>It becomes a runtime control.</strong>
        <p>
          The visible product is an underwriting console for operators. The primitive is
          portable authority: public records decide what an agent may do next.
        </p>
      </section>

      <section className="section">
        <div className="section-heading">
          <div className="eyebrow">V2 loop</div>
          <h2>Public history now gates future action.</h2>
        </div>
        <div className="pipeline">
          <div className="pipe-card">
            <span>01</span>
            <h3>Record</h3>
            <p>YieldScout publishes signed 0G-ready actions, receipts, and a risk review.</p>
          </div>
          <div className="pipe-card">
            <span>02</span>
            <h3>Score</h3>
            <p>The verifier replays history and derives a deterministic 73/100 credit score.</p>
          </div>
          <div className="pipe-card">
            <span>03</span>
            <h3>Cap</h3>
            <p>The operator grants a bounded ${proof.credit.capUsd} mandate, not wallet trust.</p>
          </div>
          <div className="pipe-card alert">
            <span>04</span>
            <h3>Enforce</h3>
            <p>A ${proof.refusal.attemptedUsd} attempt is refused before payment broadcast.</p>
          </div>
        </div>
      </section>

      <section className="section split-section">
        <div>
          <div className="eyebrow">why judges should care</div>
          <h2>This is not another memory viewer.</h2>
          <p>
            CreditGate is the missing enforcement layer between agent memory and
            agent money. A clean history expands authority; a risky request gets
            a signed refusal instead of a transaction.
          </p>
        </div>
        <div className="proof-stack">
          <div className="mini-proof">
            <span>semantic verifier</span>
            <strong>CREDIT_DESK_VALID</strong>
          </div>
          <div className="mini-proof">
            <span>refusal root</span>
            <strong>{shortHash(proof.refusalRoot)}</strong>
          </div>
          <div className="mini-proof">
            <span>allowed use root</span>
            <strong>{shortHash(proof.allowedUseRoot)}</strong>
          </div>
        </div>
      </section>
    </main>
  );
}
