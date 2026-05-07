"use client";

import { useState } from "react";
import { verifyMessage } from "ethers";
import { canonicalJson, hashCanonical } from "@/src/credit/canonical";
import { scoreAgentHistory } from "@/src/credit/policy";
import type { SignedAgentAction } from "@/src/credit/types";

type IngestResult =
  | {
      ok: true;
      agent: string;
      signatures: string;
      score: number;
      capUsd: number;
      evidenceRoot: string;
    }
  | {
      ok: false;
      error: string;
    };

export function IngestPanel({ sample }: { sample: SignedAgentAction[] }) {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<IngestResult | null>(null);

  function loadSample() {
    setInput(JSON.stringify(sample, null, 2));
    setResult(null);
  }

  function scoreInput() {
    try {
      const parsed = JSON.parse(extractJson(input)) as unknown;
      const signedHistory = extractSignedHistory(parsed);
      if (signedHistory.length === 0) throw new Error("signed history is empty");

      let validSignatures = 0;
      for (const signed of signedHistory) {
        const recovered = verifyMessage(canonicalJson(signed.payload), signed.signature);
        if (recovered.toLowerCase() !== signed.signer.toLowerCase()) {
          throw new Error(`signature mismatch at seq ${signed.payload.seq}`);
        }
        if (signed.payloadHash !== hashCanonical(signed.payload)) {
          throw new Error(`payload hash mismatch at seq ${signed.payload.seq}`);
        }
        validSignatures += 1;
      }

      const evidenceRoot = hashCanonical(signedHistory);
      const credit = scoreAgentHistory(signedHistory.map((event) => event.payload));
      setResult({
        ok: true,
        agent: credit.agent,
        signatures: `${validSignatures}/${signedHistory.length}`,
        score: credit.score,
        capUsd: credit.capUsd,
        evidenceRoot,
      });
    } catch (error) {
      setResult({ ok: false, error: error instanceof Error ? error.message : "unknown ingest error" });
    }
  }

  return (
    <div className="ingest-console">
      <div className="ingest-copy">
        <div className="eyebrow">live ingestion</div>
        <h2>Paste any signed agent history and score it locally.</h2>
        <p>
          This is the non-fixture path: the browser verifies signatures, hashes
          the uploaded history, derives the score, and returns the cap before a
          mandate can be anchored.
        </p>
        <div className="actions">
          <button className="button" type="button" onClick={loadSample}>Load sample history</button>
          <button className="button secondary" type="button" onClick={scoreInput}>Score pasted JSON</button>
        </div>
      </div>
      <div className="ingest-workbench">
        <textarea
          aria-label="Signed agent history JSON"
          placeholder='Paste a signed history array, or run "npm run demo:agent-loop -- --json" and paste its signedHistory.'
          value={input}
          onChange={(event) => setInput(event.target.value)}
        />
        {result ? (
          <div className={`ingest-result ${result.ok ? "approved" : "denied"}`}>
            {result.ok ? (
              <>
                <span>CREDITGATE_INGEST_VALID</span>
                <strong>{result.agent}: {result.score}/100 {"->"} ${result.capUsd}</strong>
                <code>{result.signatures} signatures - {result.evidenceRoot}</code>
              </>
            ) : (
              <>
                <span>INGEST_REJECTED</span>
                <strong>{result.error}</strong>
              </>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function extractSignedHistory(value: unknown): SignedAgentAction[] {
  if (Array.isArray(value)) return value as SignedAgentAction[];
  if (isRecord(value) && Array.isArray(value.signedHistory)) {
    return value.signedHistory as SignedAgentAction[];
  }
  throw new Error("expected signed history array or object with signedHistory");
}

function extractJson(input: string): string {
  const objectIndex = input.indexOf("{");
  const arrayIndex = input.indexOf("[");
  const starts = [objectIndex, arrayIndex].filter((index) => index >= 0);
  if (starts.length === 0) throw new Error("input does not contain JSON");
  return input.slice(Math.min(...starts));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
