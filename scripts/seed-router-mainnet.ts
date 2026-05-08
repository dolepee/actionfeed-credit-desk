import { readFile, writeFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import { Contract, JsonRpcProvider, Wallet, formatEther, parseEther, type InterfaceAbi } from "ethers";
import { buildCreditGatePortfolio } from "../src/credit/demo";
import currentAnchors from "../src/credit/mainnet-anchors.json";
import deployment from "../deployments/0g-mainnet.json";

type Artifact = {
  abi: InterfaceAbi;
};

type Deployment = typeof deployment & {
  contracts: typeof deployment.contracts & {
    CreditGateRouter?: {
      address: string;
      deployTx: string;
    };
  };
};

const EXPECTED_CHAIN_ID = Number(process.env.ZG_MAINNET_CHAIN_ID ?? "16661");
const DEFAULT_RPC = "https://evmrpc.0g.ai";
const AGENT_ID = 1;

async function main() {
  const currentDeployment = deployment as Deployment;
  loadLocalEnv();
  const routerDeployment = currentDeployment.contracts.CreditGateRouter;
  if (!routerDeployment) throw new Error("CreditGateRouter is not deployed; run npm run deploy:router-mainnet first");
  const routerAddress = routerDeployment.address;

  const rpc = process.env.ZG_MAINNET_RPC ?? DEFAULT_RPC;
  const privateKey = must("ZG_PRIVATE_KEY");
  const provider = new JsonRpcProvider(rpc);
  const network = await provider.getNetwork();
  if (Number(network.chainId) !== EXPECTED_CHAIN_ID) {
    throw new Error(`refusing router seed: expected chain ${EXPECTED_CHAIN_ID}, got ${network.chainId}`);
  }

  const wallet = new Wallet(privateKey, provider);
  const portfolio = await buildCreditGatePortfolio();
  const proof = portfolio.primary;
  const artifact = await readArtifact();
  const router = new Contract(routerAddress, artifact.abi, wallet);
  const paymentValue = parseEther(process.env.ROUTER_PAYMENT_OG ?? "0.0001");
  const recipient = proof.allowedUse.recipient;

  console.log(`router seeder: ${wallet.address}`);
  console.log(`balance: ${formatEther(await provider.getBalance(wallet.address))} 0G`);
  console.log(`router: ${routerAddress}`);
  console.log(`recipient: ${recipient}`);
  console.log(`payment value: ${formatEther(paymentValue)} 0G`);

  const refusalTx = await send(
    "routerRefuseYieldScout",
    router.refusePayment(
      AGENT_ID,
      proof.mandateRoot,
      proof.refusalRoot,
      proof.refusal.attemptedUsd,
      proof.refusal.reason,
    ),
  );

  const paymentTx = await send(
    "routerPayYieldScout",
    router.payWithMandate(
      AGENT_ID,
      proof.mandateRoot,
      proof.allowedUseRoot,
      proof.allowedUse.amountUsd,
      recipient,
      { value: paymentValue },
    ),
  );

  const anchors = {
    ...currentAnchors,
    router: {
      network: "0G mainnet",
      address: routerAddress,
      deployTxHash: routerDeployment.deployTx,
      agentId: AGENT_ID,
      mandateRoot: proof.mandateRoot,
      refusalRoot: proof.refusalRoot,
      useRoot: proof.allowedUseRoot,
      attemptedUsd: proof.refusal.attemptedUsd,
      amountUsd: proof.allowedUse.amountUsd,
      nativeValueWei: paymentValue.toString(),
      nativeValueOg: formatEther(paymentValue),
      recipient,
      refusalTxHash: refusalTx,
      paymentTxHash: paymentTx,
      verifier: "npm run verify:router",
    },
  };

  await writeFile("src/credit/mainnet-anchors.json", `${JSON.stringify(anchors, null, 2)}\n`, "utf8");
  await writeFile("docs/0G_MAINNET_PROOF.json", `${JSON.stringify({ proof: portfolio, anchors }, null, 2)}\n`, "utf8");
  console.log("anchors written: src/credit/mainnet-anchors.json");
  console.log("proof written: docs/0G_MAINNET_PROOF.json");
}

async function send(label: string, txPromise: Promise<{ hash: string; wait: () => Promise<unknown> }>) {
  const tx = await txPromise;
  console.log(`${label} tx: ${tx.hash}`);
  await tx.wait();
  return tx.hash;
}

async function readArtifact(): Promise<Artifact> {
  return JSON.parse(await readFile("contracts/out/CreditGateRouter.sol/CreditGateRouter.json", "utf8")) as Artifact;
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
