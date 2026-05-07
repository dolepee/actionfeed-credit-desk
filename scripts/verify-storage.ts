import { readFile } from "node:fs/promises";
import { Contract, JsonRpcProvider, type InterfaceAbi } from "ethers";
import { canonicalJson, hashCanonical } from "../src/credit/canonical";
import { buildStoragePayload } from "../src/credit/storage-object";
import type { CreditGatePortfolio, Hex } from "../src/credit/types";
import { verifyCreditGatePortfolio } from "../src/credit/verifier";
import { CreditGateStorage } from "../src/credit/zg-storage";
import mainnetAnchors from "../src/credit/mainnet-anchors.json";
import { loadLocalEnv } from "./lib/env";

type Artifact = {
  abi: InterfaceAbi;
};

type StorageAnchor = {
  network: string;
  indexerRpc: string;
  agentId: number;
  rootHash: Hex;
  objectHash: Hex;
  uploadTxHash: Hex;
  anchorTxHash: Hex;
  objectBytes: number;
  metadataUri: string;
  verifier: string;
};

type AnchorFile = typeof mainnetAnchors & {
  storage?: StorageAnchor;
};

type StorageObject = {
  kind: "creditgate.portfolio-proof";
  schemaVersion: 1;
  portfolio: CreditGatePortfolio;
};

const DEFAULT_RPC = "https://evmrpc.0g.ai";

async function main() {
  loadLocalEnv();
  const anchors = mainnetAnchors as AnchorFile;
  if (!anchors.storage) {
    throw new Error("missing storage anchor in src/credit/mainnet-anchors.json");
  }

  const rpc = process.env.ZG_MAINNET_RPC ?? DEFAULT_RPC;
  const provider = new JsonRpcProvider(rpc);
  const storage = new CreditGateStorage({ evmRpc: rpc, indexerRpc: anchors.storage.indexerRpc });

  const downloaded = await storage.downloadText(anchors.storage.rootHash);
  const object = JSON.parse(downloaded) as StorageObject;
  assert(object.kind === "creditgate.portfolio-proof", "storage object kind mismatch");
  assert(object.schemaVersion === 1, "storage object schema mismatch");
  assert(hashCanonical(object) === anchors.storage.objectHash, "storage object hash mismatch");
  assert(downloaded === canonicalJson(object), "downloaded object is not canonical JSON");

  const currentPayload = await buildStoragePayload();
  assert(currentPayload.objectHash === anchors.storage.objectHash, "repo proof object drifted from storage object");

  const portfolioCheck = verifyCreditGatePortfolio(object.portfolio);
  const registry = new Contract(
    anchors.registryAddress,
    (await readArtifact()).abi,
    provider,
  );
  const agent = await registry.agents(anchors.storage.agentId);
  assert(agent.exists === true, "storage proof anchor missing onchain");
  assert(String(agent.feedRoot).toLowerCase() === anchors.storage.rootHash.toLowerCase(), "onchain storage root mismatch");
  assert(String(agent.metadataURI) === anchors.storage.metadataUri, "onchain storage metadata mismatch");

  const lines = [
    "CREDITGATE_STORAGE_VALID",
    `portfolio verifier: ${portfolioCheck.lines[0]}`,
    `storage root: ${anchors.storage.rootHash}`,
    `object hash: ${anchors.storage.objectHash}`,
    `bytes: ${anchors.storage.objectBytes}`,
    `upload tx: ${anchors.storage.uploadTxHash}`,
    `anchor tx: ${anchors.storage.anchorTxHash}`,
    `registry agent id: ${anchors.storage.agentId}`,
  ];

  console.log(lines.join("\n"));
}

async function readArtifact(): Promise<Artifact> {
  return JSON.parse(
    await readFile("contracts/out/AgentCreditRegistry.sol/AgentCreditRegistry.json", "utf8"),
  ) as Artifact;
}

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
