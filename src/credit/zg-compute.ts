import { createRequire } from "node:module";
import { formatEther, parseEther } from "ethers";
import type { Wallet } from "ethers";
import type { Hex } from "./types";

const require = createRequire(import.meta.url);
const { createZGComputeNetworkBroker } = require("@0glabs/0g-serving-broker") as {
  createZGComputeNetworkBroker: (signer: Wallet) => Promise<ZGBroker>;
};

type ListedService = {
  provider: string;
  model: string;
  url: string;
  verifiability?: string;
};

type ZGBroker = {
  inference: {
    listService(): Promise<ListedService[]>;
    acknowledged(provider: string): Promise<boolean>;
    acknowledgeProviderSigner(provider: string): Promise<void>;
    checkProviderSignerStatus(provider: string): Promise<{
      isAcknowledged: boolean;
      teeSignerAddress: string;
    }>;
    getServiceMetadata(provider: string): Promise<{ endpoint: string; model: string }>;
    getRequestHeaders(provider: string, content?: string): Promise<Record<string, string>>;
    processResponse(provider: string, chatID?: string, content?: string): Promise<boolean | null>;
  };
  ledger: {
    getLedger(): Promise<{ totalBalance: bigint; availableBalance: bigint }>;
    addLedger(amount: number, gasPrice?: number): Promise<void>;
    depositFund(amount: number, gasPrice?: number): Promise<void>;
  };
};

export type ZgComputeReviewResult = {
  reply: string;
  provider: Hex;
  model: string;
  teeSignerAddress: Hex;
  chatId: string;
  completionId?: string;
};

export async function runZgComputeReview(
  wallet: Wallet,
  prompt: string,
  opts: { modelHint?: string; providerAddress?: string; minLedgerOG?: number; minProviderOG?: number } = {},
): Promise<ZgComputeReviewResult> {
  const broker = await createZGComputeNetworkBroker(wallet);
  const services = await broker.inference.listService();
  const target = pickService(services, opts.modelHint, opts.providerAddress);
  const provider = target.provider;

  let ledger: Awaited<ReturnType<ZGBroker["ledger"]["getLedger"]>> | undefined;
  try {
    ledger = await broker.ledger.getLedger();
  } catch {
    await broker.ledger.addLedger(opts.minLedgerOG ?? 3);
  }

  if (ledger) {
    const minProviderBalance = parseEther(String(opts.minProviderOG ?? 1));
    if (ledger.availableBalance < minProviderBalance) {
      const deficit = minProviderBalance - ledger.availableBalance;
      await broker.ledger.depositFund(Math.ceil(Number(formatEther(deficit))));
    }
  }

  try {
    if (!(await broker.inference.acknowledged(provider))) {
      await broker.inference.acknowledgeProviderSigner(provider);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!/Sub-account not found|already/i.test(message)) throw error;
  }

  const signerStatus = await broker.inference.checkProviderSignerStatus(provider);
  const metadata = await broker.inference.getServiceMetadata(provider);
  const requestBody = {
    model: metadata.model,
    messages: [{ role: "user", content: prompt }],
    max_tokens: 900,
    temperature: 0.1,
  };

  const headers = await broker.inference.getRequestHeaders(provider, prompt);
  const response = await fetch(`${metadata.endpoint}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(requestBody),
  });

  const chatIdHeader = response.headers.get("ZG-Res-Key") ?? undefined;
  const text = await response.text();
  if (response.status !== 200) {
    throw new Error(`0G Compute HTTP ${response.status}: ${text.slice(0, 240)}`);
  }

  const body = JSON.parse(text) as {
    id?: string;
    choices?: Array<{
      message?: {
        content?: string | Array<{ text?: string }>;
        reasoning_content?: string;
      };
      text?: string;
    }>;
    output_text?: string;
    response?: string;
    content?: string;
    usage?: unknown;
  };
  const reply = extractReplyText(body);
  if (!reply.trim()) {
    throw new Error(`0G Compute response had no text content: ${text.slice(0, 480)}`);
  }
  const chatId = chatIdHeader ?? body.id;
  if (!chatId) throw new Error("0G Compute response missing chat id");

  const verified = await broker.inference.processResponse(
    provider,
    chatId,
    JSON.stringify(body.usage ?? {}),
  );
  if (verified !== true) {
    throw new Error(`0G Compute response failed verification: ${verified}`);
  }

  return {
    reply,
    provider: provider as Hex,
    model: metadata.model,
    teeSignerAddress: signerStatus.teeSignerAddress as Hex,
    chatId,
    completionId: body.id,
  };
}

function pickService(services: ListedService[], modelHint?: string, providerAddress?: string): ListedService {
  const verifiable = services.filter(
    (service) => service.verifiability && service.verifiability.toLowerCase() !== "none",
  );
  if (verifiable.length === 0) throw new Error("no verifiable 0G Compute services available");

  if (providerAddress) {
    const match = verifiable.find((service) => service.provider.toLowerCase() === providerAddress.toLowerCase());
    if (match) return match;
    throw new Error(`configured 0G Compute provider is not available or not verifiable: ${providerAddress}`);
  }

  if (modelHint) {
    const match = verifiable.find((service) => service.model.toLowerCase().includes(modelHint.toLowerCase()));
    if (match) return match;
  }

  return verifiable.find((service) => /(qwen|glm|llama|deepseek|gpt|gemma)/i.test(service.model) && !/image/i.test(service.model))
    ?? verifiable[0];
}

function extractReplyText(body: {
  choices?: Array<{
    message?: {
      content?: string | Array<{ text?: string }>;
      reasoning_content?: string;
    };
    text?: string;
  }>;
  output_text?: string;
  response?: string;
  content?: string;
}): string {
  const choice = body.choices?.[0];
  const content = choice?.message?.content;
  if (typeof content === "string" && content.trim()) return content;
  if (Array.isArray(content)) {
    const joined = content.map((item) => item.text ?? "").join("\n").trim();
    if (joined) return joined;
  }

  return choice?.message?.reasoning_content
    ?? choice?.text
    ?? body.output_text
    ?? body.response
    ?? body.content
    ?? "";
}
