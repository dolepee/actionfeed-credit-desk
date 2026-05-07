import { buildCreditDeskProof } from "@/src/credit/demo";
import { verifyCreditDeskProof } from "@/src/credit/verifier";
import { Nav, shortHash } from "../shared";

export default async function ProofPage() {
  const proof = await buildCreditDeskProof();
  const verification = verifyCreditDeskProof(proof);
  const isMainnetPending = proof.anchors.registryAddress === "pending-mainnet-deploy";

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
              : "The registry is deployed and seeded on 0G mainnet. The transactions below anchor the agent score, mandate, refusal, and allowed-use receipt."}
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
            <h3>Roots</h3>
            <div className="row">
              <span>evidence</span>
              <span className="mono">{shortHash(proof.evidenceRoot)}</span>
            </div>
            <div className="row">
              <span>credit</span>
              <span className="mono">{shortHash(proof.creditRoot)}</span>
            </div>
            <div className="row">
              <span>mandate</span>
              <span className="mono">{shortHash(proof.mandateRoot)}</span>
            </div>
            <div className="row">
              <span>refusal</span>
              <span className="mono">{shortHash(proof.refusalRoot)}</span>
            </div>
            <div className="row">
              <span>allowed use</span>
              <span className="mono">{shortHash(proof.allowedUseRoot)}</span>
            </div>
          </div>
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
