import { buildCreditDeskPortfolio } from "@/src/credit/demo";
import mainnetAnchors from "@/src/credit/mainnet-anchors.json";
import { verifyCreditDeskPortfolio } from "@/src/credit/verifier";
import { Nav, shortHash } from "../shared";

export default async function ProofPage() {
  const portfolio = await buildCreditDeskPortfolio();
  const proof = portfolio.primary;
  const verification = verifyCreditDeskPortfolio(portfolio);
  const isMainnetPending = proof.anchors.registryAddress === "pending-mainnet-deploy";
  const txGroups = [
    ["YieldScout anchors", mainnetAnchors.transactions],
    ["DriftBot V2 anchors", mainnetAnchors.v2Transactions ?? {}],
  ] as const;

  return (
    <main className="shell">
      <Nav />
      <section className="hero proof-hero">
        <div>
          <div className="eyebrow">judge packet - replayable authority proof</div>
          <h1>Verify the decision, not the pitch.</h1>
          <p className="lede">
            CreditGate ships a semantic verifier: signatures, roots, cap math,
            refusal ordering, allowed action policy, and no-payment-broadcast checks.
          </p>
        </div>
        {isMainnetPending ? (
          <div className="pending-box">
            <strong>Mainnet funding pending</strong>
            <span>
              Deploy and seed scripts are ready. A funded 0G mainnet key replaces
              this pending state with live explorer evidence.
            </span>
          </div>
        ) : null}
      </section>

      <section className="section">
        <div className="proof-status">
          <div>
            <span className={isMainnetPending ? "status-dot pending" : "status-dot live"} />
            <strong>{isMainnetPending ? "Mainnet deploy pending" : "0G mainnet live"}</strong>
          </div>
          <p>
            {isMainnetPending
              ? "Deploy and seed scripts are ready. Funding the 0G mainnet key replaces this pending state with live explorer evidence."
              : "The registry is deployed and seeded on 0G mainnet. The transactions below anchor two agent scores, mandates, refusals, and allowed-use receipts."}
          </p>
        </div>
        <div className="grid cols-2">
          <div className="card">
            <h3>0G anchors</h3>
            <div className="row">
              <span>chain</span>
              <span>{proof.anchors.chainName}</span>
            </div>
            <div className="row">
              <span>contract</span>
              <span className="mono">{proof.anchors.registryAddress}</span>
            </div>
            <div className="row">
              <span>explorer</span>
              <span>{proof.anchors.explorerUrl}</span>
            </div>
            <p>{proof.anchors.storageNote}</p>
          </div>
          <div className="card">
            <h3>Score comparison</h3>
            <div className="row">
              <span>{portfolio.primary.agent.name}</span>
              <span className="mono">{portfolio.primary.credit.score}/100 - ${portfolio.primary.credit.capUsd}</span>
            </div>
            <div className="row">
              <span>{portfolio.challenger.agent.name}</span>
              <span className="mono">{portfolio.challenger.credit.score}/100 - ${portfolio.challenger.credit.capUsd}</span>
            </div>
            <div className="row">
              <span>YieldScout evidence</span>
              <span className="mono">{shortHash(portfolio.primary.evidenceRoot)}</span>
            </div>
            <div className="row">
              <span>DriftBot evidence</span>
              <span className="mono">{shortHash(portfolio.challenger.evidenceRoot)}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div className="eyebrow">full mainnet receipts</div>
          <h2>Every anchor hash is clickable.</h2>
          <p>
            These are full transaction hashes, not screenshots or truncated badges.
            Open them directly on 0G Chainscan.
          </p>
        </div>
        <div className="tx-grid">
          {txGroups.map(([title, transactions]) => (
            <div className="card" key={title}>
              <h3>{title}</h3>
              <div className="tx-list">
                {Object.entries(transactions).map(([label, tx]) => (
                  <a
                    className="tx-row"
                    href={`https://chainscan.0g.ai/tx/${tx}`}
                    key={label}
                  >
                    <span>{label}</span>
                    <strong>{tx}</strong>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div className="eyebrow">semantic verifier</div>
          <h2>The verifier checks meaning, not just signatures.</h2>
          <p>Run: <span className="mono">npm run verify:credit</span></p>
        </div>
        <pre>{verification.lines.join("\n")}</pre>
      </section>
    </main>
  );
}
