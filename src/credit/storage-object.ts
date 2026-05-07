import { canonicalJson, hashCanonical } from "./canonical";
import { buildCreditDeskPortfolio } from "./demo";

export async function buildStorageObject() {
  const portfolio = await buildCreditDeskPortfolio();
  return {
    kind: "creditgate.portfolio-proof",
    schemaVersion: 1,
    portfolio,
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
