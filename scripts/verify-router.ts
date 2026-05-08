import { Contract, Interface, JsonRpcProvider, TransactionReceipt, formatEther, type InterfaceAbi } from "ethers";
import { buildCreditGatePortfolio } from "../src/credit/demo";
import mainnetAnchors from "../src/credit/mainnet-anchors.json";
import deployment from "../deployments/0g-mainnet.json";
import { loadLocalEnv } from "./lib/env";

type Deployment = typeof deployment & {
  contracts: typeof deployment.contracts & {
    CreditGateRouter?: {
      address: string;
      deployTx: string;
    };
  };
};

type RouterAnchor = {
  address: string;
  deployTxHash: string;
  agentId: number;
  mandateRoot: string;
  refusalRoot: string;
  useRoot: string;
  attemptedUsd: number;
  amountUsd: number;
  nativeValueWei: string;
  nativeValueOg: string;
  recipient: string;
  refusalTxHash: string;
  paymentTxHash: string;
};

type Anchors = typeof mainnetAnchors & {
  router?: RouterAnchor;
};

const DEFAULT_RPC = "https://evmrpc.0g.ai";
const ROUTER_ABI = [
  "function registry() view returns (address)",
  "event MandatePayment(uint256 indexed agentId, bytes32 indexed mandateRoot, bytes32 indexed useRoot, uint256 amountUsd, uint256 nativeValue, address recipient)",
  "event MandatePaymentRefused(uint256 indexed agentId, bytes32 indexed mandateRoot, bytes32 indexed refusalRoot, uint256 attemptedUsd, uint256 capUsd, string reason)",
] satisfies InterfaceAbi;

async function main() {
  loadLocalEnv();
  const anchors = mainnetAnchors as Anchors;
  const currentDeployment = deployment as Deployment;
  if (!anchors.router) throw new Error("missing router anchor");
  if (!currentDeployment.contracts.CreditGateRouter) throw new Error("missing router deployment");

  const portfolio = await buildCreditGatePortfolio();
  const proof = portfolio.primary;
  const provider = new JsonRpcProvider(process.env.ZG_MAINNET_RPC ?? DEFAULT_RPC);
  const iface = new Interface(ROUTER_ABI);
  const router = new Contract(anchors.router.address, ROUTER_ABI, provider);

  const registry = await router.registry();
  assert(String(registry).toLowerCase() === anchors.registryAddress.toLowerCase(), "router registry mismatch");
  assert(anchors.router.address === currentDeployment.contracts.CreditGateRouter.address, "router deployment mismatch");
  assert(anchors.router.mandateRoot.toLowerCase() === proof.mandateRoot.toLowerCase(), "router mandate root mismatch");
  assert(anchors.router.refusalRoot.toLowerCase() === proof.refusalRoot.toLowerCase(), "router refusal root mismatch");
  assert(anchors.router.useRoot.toLowerCase() === proof.allowedUseRoot.toLowerCase(), "router use root mismatch");
  assert(anchors.router.recipient.toLowerCase() === proof.allowedUse.recipient.toLowerCase(), "router recipient mismatch");
  assert(anchors.router.amountUsd === proof.allowedUse.amountUsd, "router amount mismatch");
  assert(anchors.router.attemptedUsd === proof.refusal.attemptedUsd, "router attempted amount mismatch");

  await requireSuccessfulTx(provider, anchors.router.deployTxHash);
  const refusalReceipt = await requireEvent(provider, iface, anchors.router.refusalTxHash, "MandatePaymentRefused");
  const paymentReceipt = await requireEvent(provider, iface, anchors.router.paymentTxHash, "MandatePayment");

  const refusalEvent = parseRequiredEvent(iface, refusalReceipt, "MandatePaymentRefused");
  assert(Number(refusalEvent.args.agentId) === anchors.router.agentId, "refusal agent mismatch");
  assert(String(refusalEvent.args.mandateRoot).toLowerCase() === anchors.router.mandateRoot.toLowerCase(), "refusal mandate mismatch");
  assert(String(refusalEvent.args.refusalRoot).toLowerCase() === anchors.router.refusalRoot.toLowerCase(), "refusal root mismatch");
  assert(Number(refusalEvent.args.attemptedUsd) === anchors.router.attemptedUsd, "refusal attempted mismatch");

  const paymentEvent = parseRequiredEvent(iface, paymentReceipt, "MandatePayment");
  assert(Number(paymentEvent.args.agentId) === anchors.router.agentId, "payment agent mismatch");
  assert(String(paymentEvent.args.mandateRoot).toLowerCase() === anchors.router.mandateRoot.toLowerCase(), "payment mandate mismatch");
  assert(String(paymentEvent.args.useRoot).toLowerCase() === anchors.router.useRoot.toLowerCase(), "payment use root mismatch");
  assert(Number(paymentEvent.args.amountUsd) === anchors.router.amountUsd, "payment amount mismatch");
  assert(String(paymentEvent.args.recipient).toLowerCase() === anchors.router.recipient.toLowerCase(), "payment recipient mismatch");
  assert(paymentEvent.args.nativeValue.toString() === anchors.router.nativeValueWei, "payment native value mismatch");

  const nativeValue = BigInt(anchors.router.nativeValueWei);
  const refusalTx = await provider.getTransaction(anchors.router.refusalTxHash);
  const paymentTx = await provider.getTransaction(anchors.router.paymentTxHash);
  assert(refusalTx !== null, "missing refusal transaction");
  assert(paymentTx !== null, "missing payment transaction");
  assert(refusalTx.value === 0n, "refusal transaction carried native value");
  assert(paymentTx.value === nativeValue, "payment transaction value mismatch");

  const routerBalance = await provider.getBalance(anchors.router.address);
  assert(routerBalance === 0n, "router retained native value after payment");

  console.log("CREDITGATE_ROUTER_VALID");
  console.log(`router: ${anchors.router.address}`);
  console.log(`refusal: ${anchors.router.attemptedUsd} > ${proof.mandate.capUsd}, no native value sent`);
  console.log(`payment: ${anchors.router.amountUsd} <= ${proof.mandate.capUsd}, sent ${formatEther(nativeValue)} OG`);
  console.log(`recipient: ${anchors.router.recipient}`);
}

async function requireSuccessfulTx(provider: JsonRpcProvider, hash: string): Promise<TransactionReceipt> {
  if (!hash) throw new Error(`invalid tx hash: ${hash}`);
  const receipt = await provider.getTransactionReceipt(hash);
  if (!receipt) throw new Error(`missing tx receipt: ${hash}`);
  if (receipt.status !== 1) throw new Error(`tx failed: ${hash}`);
  return receipt;
}

async function requireEvent(
  provider: JsonRpcProvider,
  iface: Interface,
  hash: string,
  eventName: string,
): Promise<TransactionReceipt> {
  const receipt = await requireSuccessfulTx(provider, hash);
  parseRequiredEvent(iface, receipt, eventName);
  return receipt;
}

function parseRequiredEvent(iface: Interface, receipt: TransactionReceipt, eventName: string) {
  for (const log of receipt.logs) {
    try {
      const parsed = iface.parseLog(log);
      if (parsed?.name === eventName) return parsed;
    } catch {
      // Ignore logs from other contracts.
    }
  }
  throw new Error(`${eventName} missing in ${receipt.hash}`);
}

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
