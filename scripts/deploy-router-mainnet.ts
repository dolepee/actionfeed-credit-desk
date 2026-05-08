import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import { dirname } from "node:path";
import { ContractFactory, JsonRpcProvider, Wallet, formatEther, type InterfaceAbi } from "ethers";
import deployment from "../deployments/0g-mainnet.json";

type Artifact = {
  abi: InterfaceAbi;
  bytecode: {
    object: string;
  };
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

async function main() {
  const currentDeployment = deployment as Deployment;
  loadLocalEnv();
  const rpc = process.env.ZG_MAINNET_RPC ?? DEFAULT_RPC;
  const privateKey = must("ZG_PRIVATE_KEY");
  const provider = new JsonRpcProvider(rpc);
  const network = await provider.getNetwork();
  if (Number(network.chainId) !== EXPECTED_CHAIN_ID) {
    throw new Error(`refusing router deploy: expected chain ${EXPECTED_CHAIN_ID}, got ${network.chainId}`);
  }

  const wallet = new Wallet(privateKey, provider);
  console.log(`deployer: ${wallet.address}`);
  console.log(`balance: ${formatEther(await provider.getBalance(wallet.address))} 0G`);

  if (currentDeployment.contracts.CreditGateRouter?.address) {
    console.log(`CreditGateRouter already deployed: ${currentDeployment.contracts.CreditGateRouter.address}`);
    return;
  }

  const artifact = await readArtifact();
  const bytecode = artifact.bytecode.object.startsWith("0x")
    ? artifact.bytecode.object
    : `0x${artifact.bytecode.object}`;
  const factory = new ContractFactory(artifact.abi, bytecode, wallet);
  const router = await factory.deploy(currentDeployment.contracts.AgentCreditRegistry.address);
  const deployTx = router.deploymentTransaction();
  if (!deployTx) throw new Error("router deployment transaction missing");

  console.log(`router deploy tx: ${deployTx.hash}`);
  await router.waitForDeployment();
  const address = await router.getAddress();
  console.log(`CreditGateRouter: ${address}`);

  const nextDeployment = {
    ...currentDeployment,
    contracts: {
      ...currentDeployment.contracts,
      CreditGateRouter: {
        address,
        deployTx: deployTx.hash,
      },
    },
  };
  await writeJson("deployments/0g-mainnet.json", nextDeployment);
  console.log("deployment written: deployments/0g-mainnet.json");
}

async function readArtifact(): Promise<Artifact> {
  return JSON.parse(await readFile("contracts/out/CreditGateRouter.sol/CreditGateRouter.json", "utf8")) as Artifact;
}

async function writeJson(path: string, value: unknown) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
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
