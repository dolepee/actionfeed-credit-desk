import Link from "next/link";
import { buildCreditDeskPortfolio } from "@/src/credit/demo";
import mainnetAnchors from "@/src/credit/mainnet-anchors.json";
import { Nav, shortHash } from "./shared";

export default async function HomePage() {
  const portfolio = await buildCreditDeskPortfolio();
  const proof = portfolio.primary;
  const challenger = portfolio.challenger;
  const historyCount = proof.signedHistory.length;
  const hasStorage = Boolean((mainnetAnchors as typeof mainnetAnchors & { storage?: unknown }).storage);

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
        <span>2 agents scored.</span>
        <strong>{hasStorage ? "0G Chain + Storage live." : "11 mainnet txs anchored."}</strong>
        <p>
          YieldScout earns ${proof.credit.capUsd}. DriftBot earns ${challenger.credit.capUsd}.
          Same verifier, different history, different authority.
          {hasStorage ? " The canonical proof JSON is retrievable from 0G Storage." : ""}
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
            <p>Two agents publish signed histories: one clean, one thin with policy violations.</p>
          </div>
          <div className="pipe-card">
            <span>02</span>
            <h3>Score</h3>
            <p>The verifier derives {proof.credit.score}/100 and {challenger.credit.score}/100 from the histories.</p>
          </div>
          <div className="pipe-card">
            <span>03</span>
            <h3>Cap</h3>
            <p>Different scores become different mandates: ${proof.credit.capUsd} vs ${challenger.credit.capUsd}.</p>
          </div>
          <div className="pipe-card alert">
            <span>04</span>
            <h3>Enforce</h3>
            <p>Both over-cap attempts are refused before payment broadcast.</p>
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
            <strong>CREDIT_DESK_PORTFOLIO_VALID</strong>
          </div>
          <div className="mini-proof">
            <span>score spread</span>
            <strong>{proof.credit.score} vs {challenger.credit.score}</strong>
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
