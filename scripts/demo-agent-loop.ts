import { Wallet } from "ethers";
import { canonicalJson, hashCanonical } from "../src/credit/canonical";
import { capForScore, isOverCap, scoreAgentHistory } from "../src/credit/policy";
import type {
  AgentActionEvent,
  CreditScoredEvent,
  DelegationUsedEvent,
  Hex,
  MandateGrantedEvent,
  MandateRefusedEvent,
  SignedAgentAction,
} from "../src/credit/types";

async function main() {
  const wallet = Wallet.createRandom();
  const runId = new Date().toISOString();
  const unsignedHistory = buildRuntimeHistory(runId);
  const signedHistory = await Promise.all(unsignedHistory.map((event) => signAction(wallet, event)));
  const evidenceRoot = hashCanonical(signedHistory);
  const scored = scoreAgentHistory(unsignedHistory);
  const credit: CreditScoredEvent = { ...scored, evidenceRoot };
  const mandate: MandateGrantedEvent = {
    type: "mandate.granted",
    agent: "YieldScout",
    capUsd: credit.capUsd,
    allowedActions: ["yield.quote", "yield.deposit", "yield.rebalance"],
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    evidenceRoot,
  };
  const mandateRoot = hashCanonical(mandate);
  const attemptedUsd = credit.capUsd + 700;
  if (!isOverCap(attemptedUsd, credit.capUsd)) {
    throw new Error("runtime refusal must exceed cap");
  }

  const refusal: MandateRefusedEvent = {
    type: "mandate.refused",
    agent: "YieldScout",
    attemptedAction: "yield.deposit",
    attemptedUsd,
    capUsd: credit.capUsd,
    reason: "over_budget",
    noPaymentBroadcast: true,
    mandateRoot,
  };
  const allowedUse: DelegationUsedEvent = {
    type: "delegation.used",
    agent: "YieldScout",
    action: "yield.deposit",
    amountUsd: Math.max(1, Math.floor(credit.capUsd / 2)),
    recipient: "0x1111111111111111111111111111111111111111",
    mandateRoot,
  };

  assert(credit.capUsd === capForScore(credit.score), "cap policy mismatch");
  assert(refusal.attemptedUsd > refusal.capUsd, "refusal is not over cap");
  assert(allowedUse.amountUsd <= mandate.capUsd, "allowed use exceeds cap");
  assert(refusal.noPaymentBroadcast === true, "refusal must avoid payment broadcast");

  if (process.argv.includes("--json")) {
    console.log(
      JSON.stringify(
        {
          status: "CREDITGATE_RUNTIME_LOOP_VALID",
          runId,
          owner: wallet.address,
          signedHistory,
          evidenceRoot,
          credit,
          mandate,
          mandateRoot,
          refusal,
          refusalRoot: hashCanonical(refusal),
          allowedUse,
          allowedUseRoot: hashCanonical(allowedUse),
        },
        null,
        2,
      ),
    );
    return;
  }

  console.log("CREDITGATE_RUNTIME_LOOP_VALID");
  console.log(`run: ${runId}`);
  console.log(`owner: ${wallet.address}`);
  console.log(`signatures: ${signedHistory.length}/${signedHistory.length}`);
  console.log(`score: ${credit.score}/100`);
  console.log(`cap: ${credit.capUsd} USD`);
  console.log(`evidence root: ${evidenceRoot}`);
  console.log(`mandate root: ${mandateRoot}`);
  console.log(`refusal: ${refusal.attemptedUsd} > ${refusal.capUsd}, no authorized payment-use receipt`);
  console.log(`refusal root: ${hashCanonical(refusal)}`);
  console.log(`allowed use: ${allowedUse.amountUsd} <= ${mandate.capUsd}`);
  console.log(`allowed use root: ${hashCanonical(allowedUse)}`);
}

function buildRuntimeHistory(runId: string): AgentActionEvent[] {
  return [
    action(runId, 1, "yield.quote", 118, "ok", "runtime-1"),
    action(runId, 2, "yield.deposit", 180, "ok", "runtime-2"),
    action(runId, 3, "yield.quote", 214, "ok"),
    action(runId, 4, "yield.rebalance", 240, "ok", "runtime-4"),
    action(runId, 5, "yield.quote", 305, "ok"),
    action(runId, 6, "yield.deposit", 260, "ok", "runtime-6"),
    action(runId, 7, "yield.quote", 94, "ok"),
    action(runId, 8, "yield.rebalance", 148, "ok"),
    {
      type: "agent.action",
      agent: "YieldScout",
      seq: 9,
      action: "risk.review",
      amountUsd: 0,
      result: "review_ok",
      timestamp: new Date(Date.now() + 8_000).toISOString(),
    },
  ];
}

function action(
  runId: string,
  seq: number,
  actionType: AgentActionEvent["action"],
  amountUsd: number,
  result: AgentActionEvent["result"],
  receiptSeed?: string,
): AgentActionEvent {
  return {
    type: "agent.action",
    agent: "YieldScout",
    seq,
    action: actionType,
    amountUsd,
    result,
    timestamp: new Date(Date.now() + seq * 1_000).toISOString(),
    ...(receiptSeed ? { receiptHash: hashCanonical({ receiptSeed, runId }) } : {}),
  };
}

async function signAction(
  wallet: { address: string; signMessage(message: string): Promise<string> },
  payload: AgentActionEvent,
): Promise<SignedAgentAction> {
  const canonical = canonicalJson(payload);
  const signature = (await wallet.signMessage(canonical)) as Hex;
  return {
    payload,
    signer: wallet.address as Hex,
    signature,
    payloadHash: hashCanonical(payload),
  };
}

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
