import { Indexer, MemData } from "@0gfoundation/0g-ts-sdk";
import { mkdtemp, readFile, unlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Wallet } from "ethers";
import type { Hex } from "./types";

export type ZgStorageConfig = {
  evmRpc: string;
  indexerRpc: string;
};

export class CreditGateStorage {
  private readonly indexer: Indexer;

  constructor(private readonly cfg: ZgStorageConfig) {
    this.indexer = new Indexer(cfg.indexerRpc);
  }

  async uploadCanonicalJson(canonical: string, signer: Wallet): Promise<{ rootHash: Hex; txHash: Hex }> {
    const bytes = new TextEncoder().encode(canonical);
    return this.withRetry("upload", async () => {
      const mem = new MemData(bytes);
      const [tx, err] = await this.indexer.upload(mem, this.cfg.evmRpc, signer as unknown as never);
      if (err) throw new Error(`0G upload failed: ${err}`);
      const rootHash = ("rootHash" in tx ? tx.rootHash : tx.rootHashes[0]) as Hex;
      const txHash = ("txHash" in tx ? tx.txHash : tx.txHashes[0]) as Hex;
      return { rootHash, txHash };
    });
  }

  async downloadText(rootHash: Hex): Promise<string> {
    return this.withRetry("download", async () => {
      const dir = await mkdtemp(join(tmpdir(), "creditgate-storage-"));
      const out = join(dir, `${rootHash}.json`);
      try {
        const err = await this.indexer.download(rootHash, out, false);
        if (err) throw new Error(`0G download failed: ${err}`);
        return await readFile(out, "utf8");
      } finally {
        await unlink(out).catch(() => {});
      }
    }, 8);
  }

  private async withRetry<T>(label: string, fn: () => Promise<T>, attempts = 4): Promise<T> {
    let lastErr: unknown;
    for (let i = 0; i < attempts; i += 1) {
      try {
        return await fn();
      } catch (error) {
        lastErr = error;
        const message = error instanceof Error ? error.message : String(error);
        const transient = /ECONNRESET|EHOSTUNREACH|ETIMEDOUT|ENETUNREACH|EAI_AGAIN|socket hang up|read timeout|not found|not available/i.test(message);
        if (!transient || i === attempts - 1) throw error;
        const wait = 1500 * Math.pow(1.6, i);
        console.warn(`[retry ${label} ${i + 1}/${attempts - 1}] ${message.slice(0, 120)}; waiting ${Math.round(wait)}ms`);
        await new Promise((resolve) => setTimeout(resolve, wait));
      }
    }
    throw lastErr;
  }
}
