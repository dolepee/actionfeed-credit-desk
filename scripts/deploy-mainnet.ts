import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { ContractFactory, JsonRpcProvider, Wallet, formatEther, type InterfaceAbi } from "ethers";

type Artifact = {
  abi: InterfaceAbi;
  bytecode: {
    object: string;
  };
};

const EXPECTED_CHAIN_ID = Number(process.env.ZG_MAINNET_CHAIN_ID ?? "16661");
const DEFAULT_RPC = "https://evmrpc.0g.ai";
const DEFAULT_EXPLORER = "https://chainscan.0g.ai";

async function main() {
  loadLocalEnv();
  const rpc = process.env.ZG_MAINNET_RPC ?? DEFAULT_RPC;
  const explorer = process.env.ZG_MAINNET_EXPLORER ?? DEFAULT_EXPLORER;
  const privateKey = must("ZG_PRIVATE_KEY");

  const provider = new JsonRpcProvider(rpc);
  const network = await provider.getNetwork();
  if (Number(network.chainId) !== EXPECTED_CHAIN_ID) {
    throw new Error(`refusing deploy: expected chain ${EXPECTED_CHAIN_ID}, got ${network.chainId}`);
  }

  const wallet = new Wallet(privateKey, provider);
  const balance = await provider.getBalance(wallet.address);
  console.log(`deployer: ${wallet.address}`);
  console.log(`chain: ${network.name} (${network.chainId})`);
  console.log(`balance: ${formatEther(balance)} 0G`);

  const artifact = await readArtifact();
  const bytecode = artifact.bytecode.object.startsWith("0x")
    ? artifact.bytecode.object
    : `0x${artifact.bytecode.object}`;
  const factory = new ContractFactory(artifact.abi, bytecode, wallet);
  const contract = await factory.deploy();
  const deployTx = contract.deploymentTransaction();
  if (!deployTx) throw new Error("deployment transaction missing");

  console.log(`deploy tx: ${deployTx.hash}`);
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  console.log(`AgentCreditRegistry: ${address}`);

  const deployment = {
    chainId: Number(network.chainId),
    network: "0G mainnet",
    rpc,
    explorer,
    deployer: wallet.address,
    deployedAt: new Date().toISOString(),
    contracts: {
      AgentCreditRegistry: {
        address,
        deployTx: deployTx.hash,
      },
    },
  };

  await writeJson("deployments/0g-mainnet.json", deployment);
  console.log("deployment written: deployments/0g-mainnet.json");
}

async function readArtifact(): Promise<Artifact> {
  const path = resolve("contracts/out/AgentCreditRegistry.sol/AgentCreditRegistry.json");
  return JSON.parse(await readFile(path, "utf8")) as Artifact;
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
