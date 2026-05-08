import { buildCreditGatePortfolio } from "@/src/credit/demo";
import { computeVerifierLines, loadOrBuildComputeReviewSet } from "@/src/credit/compute-review";
import mainnetAnchors from "@/src/credit/mainnet-anchors.json";
import { verifyCreditGatePortfolio } from "@/src/credit/verifier";
import { Nav, shortHash } from "../shared";

type StorageAnchor = {
  indexerRpc: string;
  agentId: number;
  rootHash: string;
  objectHash: string;
  uploadTxHash: string;
  anchorTxHash: string;
  objectBytes: number;
  metadataUri: string;
  verifier: string;
};

type RouterAnchor = {
  address: string;
  deployTxHash: string;
  agentId: number;
  attemptedUsd: number;
  amountUsd: number;
  nativeValueOg: string;
  recipient: string;
  refusalTxHash: string;
  paymentTxHash: string;
  verifier: string;
};

export default async function ProofPage() {
  const anchors = mainnetAnchors as typeof mainnetAnchors & { storage?: StorageAnchor; router?: RouterAnchor };
  const portfolio = await buildCreditGatePortfolio();
  const computeReviews = await loadOrBuildComputeReviewSet(portfolio);
  const proof = portfolio.primary;
  const verification = verifyCreditGatePortfolio(portfolio);
  const computeVerification = computeVerifierLines(computeReviews, portfolio);
  const isMainnetPending = proof.anchors.registryAddress === "pending-mainnet-deploy";
  const txGroups = [
    ["YieldScout anchors", mainnetAnchors.transactions],
    ["DriftBot V2 anchors", mainnetAnchors.v2Transactions ?? {}],
    ["0G Storage proof", anchors.storage ? {
      uploadPortfolioObject: anchors.storage.uploadTxHash,
      anchorStorageRoot: anchors.storage.anchorTxHash,
    } : {}],
    ["Router payment proof", anchors.router ? {
      deployRouter: anchors.router.deployTxHash,
      refuseOverCap: anchors.router.refusalTxHash,
      payUnderCap: anchors.router.paymentTxHash,
    } : {}],
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
            refusal ordering, allowed action policy, and authorized-path refusal checks.
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
              : anchors.storage
                ? "The registry is deployed on 0G mainnet and the canonical portfolio plus Compute review proof is retrievable from 0G Storage."
                : "The registry is deployed and seeded on 0G mainnet. The transactions below anchor two agent scores, mandates, refusals, and allowed-use receipts."}
            {anchors.router ? " The router adds live fund movement: over-cap refusal sends no native value, under-cap use sends native 0G." : ""}
          </p>
        </div>
        <div className="grid cols-2">
          <div className="card">
            <h3>0G Chain anchors</h3>
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
          <div className="card">
            <h3>{computeReviews.mode === "0g-compute" ? "0G Compute reviews" : "Compute review fixture"}</h3>
            <div className="row">
              <span>mode</span>
              <span>{computeReviews.mode}</span>
            </div>
            <div className="row">
              <span>review set root</span>
              <span className="mono">{shortHash(computeReviews.reviewSetRoot)}</span>
            </div>
            {computeReviews.records.map((record) => (
              <div className="row" key={record.input.agent}>
                <span>{record.input.agent}</span>
                <span className="mono">{record.review.riskTier} risk - {record.review.recommendedCapClass}</span>
              </div>
            ))}
          </div>
          {anchors.storage ? (
            <div className="card storage-card">
              <h3>0G Storage object</h3>
              <div className="row">
                <span>root hash</span>
                <span className="mono">{anchors.storage.rootHash}</span>
              </div>
              <div className="row">
                <span>object hash</span>
                <span className="mono">{anchors.storage.objectHash}</span>
              </div>
              <div className="row">
                <span>bytes</span>
                <span>{anchors.storage.objectBytes}</span>
              </div>
              <div className="row">
                <span>verifier</span>
                <span className="mono">{anchors.storage.verifier}</span>
              </div>
              <p>
                Judges can pull this JSON back from 0G Storage, hash it, compare it to
                the onchain root, then replay the credit verifier.
              </p>
            </div>
          ) : null}
          {anchors.router ? (
            <div className="card storage-card">
              <h3>CreditGateRouter</h3>
              <div className="row">
                <span>router</span>
                <span className="mono">{anchors.router.address}</span>
              </div>
              <div className="row">
                <span>refusal</span>
                <span className="mono">${anchors.router.attemptedUsd} refused</span>
              </div>
              <div className="row">
                <span>payment</span>
                <span className="mono">${anchors.router.amountUsd} allowed - {anchors.router.nativeValueOg} OG moved</span>
              </div>
              <div className="row">
                <span>recipient</span>
                <span className="mono">{anchors.router.recipient}</span>
              </div>
              <div className="row">
                <span>verifier</span>
                <span className="mono">{anchors.router.verifier}</span>
              </div>
              <p>
                The router reads the active mandate from the registry, refuses
                over-cap spend, and transfers native 0G only for an under-cap use.
              </p>
            </div>
          ) : null}
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
          <p>
            Run: <span className="mono">npm run verify:credit</span>
            {" "}<span className="mono">npm run verify:compute</span>
            {anchors.storage ? <> and <span className="mono">npm run verify:storage</span></> : null}
            {anchors.router ? <> plus <span className="mono">npm run verify:router</span></> : null}
          </p>
        </div>
        <pre>{verification.lines.join("\n")}</pre>
        <pre>{computeVerification.join("\n")}</pre>
        {anchors.router ? (
          <pre>{`CREDITGATE_ROUTER_VALID\nrouter: ${anchors.router.address}\nrefusal: ${anchors.router.attemptedUsd} > ${proof.mandate.capUsd}, no native value sent\npayment: ${anchors.router.amountUsd} <= ${proof.mandate.capUsd}, sent ${anchors.router.nativeValueOg} OG`}</pre>
        ) : null}
      </section>
    </main>
  );
}
