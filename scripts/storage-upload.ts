import { mkdir, readFile, writeFile } from "node:fs/promises";
import { Contract, JsonRpcProvider, Wallet, formatEther, type InterfaceAbi } from "ethers";
import { dirname, resolve } from "node:path";
import { buildStoragePayload } from "../src/credit/storage-object";
import { CreditGateStorage } from "../src/credit/zg-storage";
import currentAnchors from "../src/credit/mainnet-anchors.json";
import { loadLocalEnv, must } from "./lib/env";

type Artifact = {
  abi: InterfaceAbi;
};

type AnchorFile = typeof currentAnchors & {
  storage?: {
    network: string;
    indexerRpc: string;
    agentId: number;
    rootHash: `0x${string}`;
    objectHash: `0x${string}`;
    uploadTxHash: `0x${string}`;
    anchorTxHash: `0x${string}`;
    objectBytes: number;
    metadataUri: string;
    verifier: string;
  };
};

const EXPECTED_CHAIN_ID = Number(process.env.ZG_MAINNET_CHAIN_ID ?? "16661");
const DEFAULT_RPC = "https://evmrpc.0g.ai";
const DEFAULT_INDEXER_RPC = "https://indexer-storage-turbo.0g.ai";
const DEFAULT_EXPLORER = "https://chainscan.0g.ai";
const STORAGE_AGENT_ID = 3;

async function main() {
  loadLocalEnv();
  const rpc = process.env.ZG_MAINNET_RPC ?? DEFAULT_RPC;
  const indexerRpc = process.env.ZG_INDEXER_RPC ?? DEFAULT_INDEXER_RPC;
  const explorer = process.env.ZG_MAINNET_EXPLORER ?? DEFAULT_EXPLORER;
  const privateKey = must("ZG_PRIVATE_KEY");

  const provider = new JsonRpcProvider(rpc);
  const network = await provider.getNetwork();
  if (Number(network.chainId) !== EXPECTED_CHAIN_ID) {
    throw new Error(`refusing storage upload: expected chain ${EXPECTED_CHAIN_ID}, got ${network.chainId}`);
  }

  const wallet = new Wallet(privateKey, provider);
  const balance = await provider.getBalance(wallet.address);
  console.log(`uploader: ${wallet.address}`);
  console.log(`balance: ${formatEther(balance)} 0G`);

  const payload = await buildStoragePayload();
  console.log(`object hash: ${payload.objectHash}`);
  console.log(`object bytes: ${payload.byteLength}`);

  const registry = new Contract(
    currentAnchors.registryAddress,
    (await readArtifact()).abi,
    wallet,
  );

  const existing = await registry.agents(STORAGE_AGENT_ID);
  const currentStorage = (currentAnchors as AnchorFile).storage;
  if (existing.exists) {
    const existingRoot = String(existing.feedRoot).toLowerCase();
    if (currentStorage && existingRoot === currentStorage.rootHash.toLowerCase()) {
      console.log(`storage proof agent ${STORAGE_AGENT_ID} already anchored at ${existing.feedRoot}`);
      return;
    }
    throw new Error(
      `storage proof agent ${STORAGE_AGENT_ID} already registered with ${existing.feedRoot}; refusing to overwrite`,
    );
  }

  const storage = new CreditGateStorage({ evmRpc: rpc, indexerRpc });
  const upload = await storage.uploadCanonicalJson(payload.canonical, wallet);
  console.log(`0G Storage root: ${upload.rootHash}`);
  console.log(`0G Storage tx: ${upload.txHash}`);

  const metadataUri = `0g-storage://${upload.rootHash}#${payload.objectHash}`;
  const anchorTx = await registry.registerAgent(STORAGE_AGENT_ID, upload.rootHash, metadataUri);
  console.log(`storage anchor tx: ${anchorTx.hash}`);
  await anchorTx.wait();

  const anchors: AnchorFile = {
    ...(currentAnchors as AnchorFile),
    explorerUrl: `${explorer}/address/${currentAnchors.registryAddress}`,
    storage: {
      network: "0G mainnet",
      indexerRpc,
      agentId: STORAGE_AGENT_ID,
      rootHash: upload.rootHash,
      objectHash: payload.objectHash,
      uploadTxHash: upload.txHash,
      anchorTxHash: anchorTx.hash,
      objectBytes: payload.byteLength,
      metadataUri,
      verifier: "npm run verify:storage",
    },
  };

  await writeJson("src/credit/mainnet-anchors.json", anchors);
  await writeJson("docs/0G_MAINNET_PROOF.json", { proof: payload.object.portfolio, anchors });
  await writeJson("proof/creditgate-storage-object.json", payload.object);
  console.log("anchors written: src/credit/mainnet-anchors.json");
  console.log("storage object written: proof/creditgate-storage-object.json");
}

async function readArtifact(): Promise<Artifact> {
  return JSON.parse(
    await readFile("contracts/out/AgentCreditRegistry.sol/AgentCreditRegistry.json", "utf8"),
  ) as Artifact;
}

async function writeJson(path: string, value: unknown) {
  await mkdir(dirname(resolve(path)), { recursive: true });
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
