import { Contract, Interface, JsonRpcProvider, TransactionReceipt } from "ethers";
import { AGENT_CREDIT_REGISTRY_ABI } from "../src/credit/agent-credit-registry-abi";
import mainnetAnchors from "../src/credit/mainnet-anchors.json";
import { buildCreditGatePortfolio } from "../src/credit/demo";
import { scoreMetricsForHistory } from "../src/credit/policy";
import { loadLocalEnv } from "./lib/env";

type Hex = `0x${string}`;

type AnchorFile = typeof mainnetAnchors & {
  transactions: Record<string, string>;
  v2Transactions: Record<string, string>;
  storage?: {
    agentId: number;
    rootHash: Hex;
    metadataUri: string;
    uploadTxHash: Hex;
    anchorTxHash: Hex;
  };
};

const DEFAULT_RPC = "https://evmrpc.0g.ai";

async function main() {
  loadLocalEnv();
  const anchors = mainnetAnchors as AnchorFile;
  const rpc = process.env.ZG_MAINNET_RPC ?? DEFAULT_RPC;
  const provider = new JsonRpcProvider(rpc);
  const registry = new Contract(anchors.registryAddress, AGENT_CREDIT_REGISTRY_ABI, provider);
  const iface = new Interface(AGENT_CREDIT_REGISTRY_ABI);
  const portfolio = await buildCreditGatePortfolio();

  await verifyAgent({
    provider,
    registry,
    iface,
    agentId: 1,
    label: "YieldScout",
    proof: portfolio.primary,
    txs: anchors.transactions,
    registerTxKey: "registerAgent",
    scoreTxKey: "scoreCredit",
    grantTxKey: "grantMandate",
    refuseTxKey: "refuseMandate",
    useTxKey: "useDelegation",
  });

  await verifyAgent({
    provider,
    registry,
    iface,
    agentId: 2,
    label: "DriftBot",
    proof: portfolio.challenger,
    txs: anchors.v2Transactions,
    registerTxKey: "registerDriftBot",
    scoreTxKey: "scoreDriftBot",
    grantTxKey: "grantDriftBotMandate",
    refuseTxKey: "refuseDriftBotMandate",
    useTxKey: "useDriftBotDelegation",
  });

  if (!anchors.storage) throw new Error("missing storage anchor");
  const storageAgent = await registry.agents(anchors.storage.agentId);
  assert(storageAgent.exists === true, "storage agent missing");
  assert(String(storageAgent.feedRoot).toLowerCase() === anchors.storage.rootHash.toLowerCase(), "storage root mismatch");
  assert(String(storageAgent.metadataURI) === anchors.storage.metadataUri, "storage metadata mismatch");
  await requireSuccessfulTx(provider, anchors.storage.uploadTxHash);
  await requireEvent(provider, iface, anchors.storage.anchorTxHash, "AgentRegistered");

  console.log("CREDITGATE_MAINNET_VALID");
  console.log("YieldScout: score 73 cap 500 refusal/use verified");
  console.log("DriftBot: score 41 cap 150 refusal/use verified");
  console.log(`Storage root anchor verified: ${anchors.storage.rootHash}`);
  console.log(`Registry: ${anchors.registryAddress}`);
}

async function verifyAgent(input: {
  provider: JsonRpcProvider;
  registry: Contract;
  iface: Interface;
  agentId: number;
  label: string;
  proof: Awaited<ReturnType<typeof buildCreditGatePortfolio>>["primary"];
  txs: Record<string, string>;
  registerTxKey: string;
  scoreTxKey: string;
  grantTxKey: string;
  refuseTxKey: string;
  useTxKey: string;
}) {
  const agent = await input.registry.agents(input.agentId);
  assert(agent.exists === true, `${input.label} agent missing`);
  assert(String(agent.feedRoot).toLowerCase() === input.proof.evidenceRoot.toLowerCase(), `${input.label} feed root mismatch`);

  const mandate = await input.registry.activeMandates(input.agentId);
  assert(mandate.exists === true, `${input.label} mandate missing`);
  assert(String(mandate.mandateRoot).toLowerCase() === input.proof.mandateRoot.toLowerCase(), `${input.label} mandate root mismatch`);
  assert(Number(mandate.capUsd) === input.proof.mandate.capUsd, `${input.label} mandate cap mismatch`);

  const metrics = scoreMetricsForHistory(input.proof.signedHistory.map((event) => event.payload));
  const onchainScore = await input.registry.scoreFromMetrics(
    metrics.completedActions,
    metrics.receiptCount,
    metrics.hasLatestReview,
    metrics.violationCount,
  );
  const onchainCap = await input.registry.capForScore(onchainScore);
  assert(Number(onchainScore) === input.proof.credit.score, `${input.label} onchain score mismatch`);
  assert(Number(onchainCap) === input.proof.credit.capUsd, `${input.label} onchain cap mismatch`);

  await requireEvent(input.provider, input.iface, input.txs[input.registerTxKey], "AgentRegistered");
  await requireEvent(input.provider, input.iface, input.txs[input.scoreTxKey], "CreditScored");
  await requireEvent(input.provider, input.iface, input.txs[input.grantTxKey], "MandateGranted");
  await requireEvent(input.provider, input.iface, input.txs[input.refuseTxKey], "MandateRefused");
  await requireEvent(input.provider, input.iface, input.txs[input.useTxKey], "DelegationUsed");
}

async function requireSuccessfulTx(provider: JsonRpcProvider, hash: string): Promise<TransactionReceipt> {
  if (!hash || hash === "already-registered") throw new Error(`invalid tx hash: ${hash}`);
  const receipt = await provider.getTransactionReceipt(hash);
  if (!receipt) throw new Error(`missing tx receipt: ${hash}`);
  if (receipt.status !== 1) throw new Error(`tx failed: ${hash}`);
  return receipt;
}

async function requireEvent(provider: JsonRpcProvider, iface: Interface, hash: string, eventName: string) {
  const receipt = await requireSuccessfulTx(provider, hash);
  const matched = receipt.logs.some((log) => {
    try {
      const parsed = iface.parseLog(log);
      return parsed?.name === eventName;
    } catch {
      return false;
    }
  });
  assert(matched, `${eventName} missing in ${hash}`);
}

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
