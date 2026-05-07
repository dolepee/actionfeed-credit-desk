import { readFile, writeFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import { Contract, JsonRpcProvider, Wallet, formatEther, type InterfaceAbi } from "ethers";
import { buildCreditGateProof } from "../src/credit/demo";

type Deployment = {
  chainId: number;
  explorer: string;
  contracts: {
    AgentCreditRegistry: {
      address: string;
      deployTx: string;
    };
  };
};

type Artifact = {
  abi: InterfaceAbi;
};

const EXPECTED_CHAIN_ID = Number(process.env.ZG_MAINNET_CHAIN_ID ?? "16661");
const DEFAULT_RPC = "https://evmrpc.0g.ai";
const DEFAULT_EXPLORER = "https://chainscan.0g.ai";
const AGENT_ID = 1;

async function main() {
  loadLocalEnv();
  const proof = await buildCreditGateProof();
  const rpc = process.env.ZG_MAINNET_RPC ?? DEFAULT_RPC;
  const explorer = process.env.ZG_MAINNET_EXPLORER ?? DEFAULT_EXPLORER;
  const privateKey = must("ZG_PRIVATE_KEY");
  const deployment = await readDeployment();
  const artifact = await readArtifact();

  const provider = new JsonRpcProvider(rpc);
  const network = await provider.getNetwork();
  if (Number(network.chainId) !== EXPECTED_CHAIN_ID) {
    throw new Error(`refusing seed: expected chain ${EXPECTED_CHAIN_ID}, got ${network.chainId}`);
  }

  const wallet = new Wallet(privateKey, provider);
  const balance = await provider.getBalance(wallet.address);
  console.log(`seeder: ${wallet.address}`);
  console.log(`balance: ${formatEther(balance)} 0G`);

  const registry = new Contract(deployment.contracts.AgentCreditRegistry.address, artifact.abi, wallet);

  const metadataUri = `creditgate://yieldscout/${proof.evidenceRoot}`;
  const deployTx = deployment.contracts.AgentCreditRegistry.deployTx;
  const registerAgent = await send("registerAgent", registry.registerAgent(AGENT_ID, proof.evidenceRoot, metadataUri));
  const scoreCredit = await send("scoreCredit", registry.scoreCredit(AGENT_ID, proof.credit.score, proof.credit.capUsd, proof.evidenceRoot));
  const grantMandate = await send(
    "grantMandate",
    registry.grantMandate(AGENT_ID, proof.mandateRoot, proof.mandate.capUsd, Math.floor(new Date(proof.mandate.expiresAt).getTime() / 1000)),
  );
  const refuseMandate = await send(
    "refuseMandate",
    registry.refuseMandate(
      AGENT_ID,
      proof.refusalRoot,
      proof.refusal.attemptedUsd,
      proof.refusal.capUsd,
      proof.refusal.reason,
    ),
  );
  const useDelegation = await send(
    "useDelegation",
    registry.useDelegation(AGENT_ID, proof.allowedUseRoot, proof.allowedUse.amountUsd, proof.allowedUse.recipient),
  );

  const anchors = {
    chainId: Number(network.chainId),
    chainName: "0G mainnet",
    registryAddress: deployment.contracts.AgentCreditRegistry.address,
    explorerUrl: `${explorer}/address/${deployment.contracts.AgentCreditRegistry.address}`,
    storageNote: "CreditGate anchors the credit score, mandate, refusal, and allowed-use roots on 0G mainnet so judges can replay the authority decision from public receipts.",
    transactions: {
      deploy: deployTx,
      registerAgent,
      scoreCredit,
      grantMandate,
      refuseMandate,
      useDelegation,
    },
  };

  await writeFile("src/credit/mainnet-anchors.json", `${JSON.stringify(anchors, null, 2)}\n`, "utf8");
  await writeFile("docs/0G_MAINNET_PROOF.json", `${JSON.stringify({ proof, anchors }, null, 2)}\n`, "utf8");
  console.log("anchors written: src/credit/mainnet-anchors.json");
  console.log("proof written: docs/0G_MAINNET_PROOF.json");
}

async function send(label: string, txPromise: Promise<{ hash: string; wait: () => Promise<unknown> }>) {
  const tx = await txPromise;
  console.log(`${label} tx: ${tx.hash}`);
  await tx.wait();
  return tx.hash;
}

async function readDeployment(): Promise<Deployment> {
  return JSON.parse(await readFile("deployments/0g-mainnet.json", "utf8")) as Deployment;
}

async function readArtifact(): Promise<Artifact> {
  return JSON.parse(
    await readFile("contracts/out/AgentCreditRegistry.sol/AgentCreditRegistry.json", "utf8"),
  ) as Artifact;
}

function must(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

function loadLocalEnv() {
  for (const file of [".env.local", ".env"]) {
    if (!existsSync(file)) continue;
    for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const index = trimmed.indexOf("=");
      if (index === -1) continue;
      const key = trimmed.slice(0, index);
      const value = trimmed.slice(index + 1);
      process.env[key] ??= value;
    }
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
