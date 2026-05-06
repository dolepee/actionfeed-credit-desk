import { buildCreditDeskProof } from "@/src/credit/demo";
import { verifyCreditDeskProof } from "@/src/credit/verifier";
import { Nav, shortHash } from "../shared";

export default async function ProofPage() {
  const proof = await buildCreditDeskProof();
  const verification = verifyCreditDeskProof(proof);

  return (
    <main className="shell">
      <Nav />
      <section className="hero">
        <div className="eyebrow">judge packet · replayable proof</div>
        <h1>Verify score, cap, refusal, and allowed use.</h1>
        <p className="lede">
          This page is the APAC proof packet. The current scaffold uses deterministic
          local roots; after 0G mainnet seeding, these fields become live Storage roots
          and 0G Explorer links.
        </p>
        {proof.anchors.registryAddress === "pending-mainnet-deploy" ? (
          <p>
            Mainnet deployment is the only missing external step. The contract, verifier,
            UI, and seed scripts are ready; once a funded 0G mainnet key is configured,
            `npm run deploy:mainnet` and `npm run seed:mainnet` replace this pending
            state with live explorer evidence.
          </p>
        ) : null}
      </section>

      <section className="section">
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
        <h2>Local verifier</h2>
        <p>Run: <span className="mono">npm run verify:credit</span></p>
        <pre>{verification.lines.join("\n")}</pre>
      </section>
    </main>
  );
}
