import { canonicalJson, hashCanonical } from "./canonical";
import { loadOrBuildComputeReviewSet } from "./compute-review";
import { buildCreditGatePortfolio } from "./demo";

export async function buildStorageObject() {
  const portfolio = await buildCreditGatePortfolio();
  const computeReviews = await loadOrBuildComputeReviewSet(portfolio);
  if (computeReviews.mode !== "0g-compute") {
    return {
      kind: "creditgate.portfolio-proof",
      schemaVersion: 1,
      portfolio,
    };
  }

  return {
    kind: "creditgate.portfolio-proof",
    schemaVersion: 2,
    portfolio,
    computeReviews,
  };
}

export async function buildStoragePayload() {
  const object = await buildStorageObject();
  const canonical = canonicalJson(object);
  return {
    object,
    canonical,
    objectHash: hashCanonical(object),
    byteLength: new TextEncoder().encode(canonical).byteLength,
  };
}
