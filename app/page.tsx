import Link from "next/link";
import { loadOrBuildComputeReviewSet } from "@/src/credit/compute-review";
import { buildCreditGatePortfolio } from "@/src/credit/demo";
import mainnetAnchors from "@/src/credit/mainnet-anchors.json";
import { Nav } from "./shared";

export default async function HomePage() {
  const portfolio = await buildCreditGatePortfolio();
  const computeReviews = await loadOrBuildComputeReviewSet(portfolio);
  const proof = portfolio.primary;
  const challenger = portfolio.challenger;
  const proofReview = computeReviews.records.find((record) => record.input.agent === proof.agent.name);
  const historyCount = proof.signedHistory.length;
  const hasStorage = Boolean((mainnetAnchors as typeof mainnetAnchors & { storage?: unknown }).storage);
  const hasRouter = Boolean((mainnetAnchors as typeof mainnetAnchors & { router?: unknown }).router);

  return (
    <main className="shell">
      <Nav />
      <section className="hero product-hero">
        <div className="hero-copy">
          <div className="eyebrow">0G APAC - agent credit gate</div>
          <h1>Stop unsafe agent spend before it leaves.</h1>
          <p className="lede">
            CreditGate turns signed 0G action history into a credit score and
            spend cap. If an agent asks for too much, the gate records a public
            refusal instead of moving funds.
          </p>
          <div className="actions">
            <Link className="button" href="/credit">Open live gate</Link>
            <a className="button secondary" href="https://github.com/dolepee/creditgate">
              Read source
            </a>
          </div>
        </div>

        <div className="decision-board" aria-label="YieldScout gate decision">
          <div className="board-header">
            <span>YIELDSCOUT</span>
            <strong>LIVE GATE</strong>
          </div>
          <div className="gate-verdict denied">
            <span>request ${proof.refusal.attemptedUsd}</span>
            <strong>DENIED</strong>
            <p>Cap is ${proof.credit.capUsd}. Router refuses before transfer.</p>
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
          {hasStorage ? " The canonical record is retrievable from 0G Storage." : ""}
          {hasRouter ? " The router now moves native 0G only for an under-cap mandate." : ""}
          {proofReview?.review.provider.network === "0G Compute"
            ? ` 0G Compute review: ${proofReview.review.riskTier} risk.`
            : " Compute review path is ready for live 0G funding."}
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
            <h3>Review</h3>
            <p>0G Compute adds risk context before deterministic score and cap enforcement.</p>
          </div>
          <div className="pipe-card">
            <span>03</span>
            <h3>Cap</h3>
            <p>Different scores become different mandates: ${proof.credit.capUsd} vs ${challenger.credit.capUsd}.</p>
          </div>
          <div className="pipe-card alert">
            <span>04</span>
            <h3>Enforce</h3>
            <p>Over-cap attempts are refused; under-cap use can move native 0G through the router.</p>
          </div>
        </div>
      </section>

      <section className="section split-section">
        <div>
          <div className="eyebrow">why operators should care</div>
          <h2>History becomes spending authority.</h2>
          <p>
            CreditGate is the missing authority layer between agent memory and
            agent money. A clean history expands authority; a risky request gets
            a signed refusal instead of a transfer.
          </p>
        </div>
        <div className="authority-stack">
          <div className="authority-card">
            <span>history check</span>
            <strong>{historyCount}/{historyCount} signed events</strong>
          </div>
          <div className="authority-card">
            <span>score spread</span>
            <strong>{proof.credit.score} vs {challenger.credit.score}</strong>
          </div>
          <div className="authority-card denied">
            <span>over-cap request</span>
            <strong>${proof.refusal.attemptedUsd} denied</strong>
          </div>
          <div className="authority-card approved">
            <span>within-cap request</span>
            <strong>${proof.allowedUse.amountUsd} approved</strong>
          </div>
        </div>
      </section>
    </main>
  );
}
