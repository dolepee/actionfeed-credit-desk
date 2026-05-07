# HackQuest Submission Checklist

## Basic Project Information

Project name:

> CreditGate

One-sentence description, under 30 words:

> A 0G-native credit desk where signed agent history becomes enforceable spend authority, with over-cap refusals anchored on-chain.

Short summary:

> CreditGate gives autonomous agents a replayable public credit history. It reads signed action records, calculates an agent credit score, grants a bounded spend cap, refuses over-cap actions, and anchors both refusals and allowed uses on 0G Chain.

## Track

Primary:

> Track 1: Agentic Infrastructure & OpenClaw Lab

Supporting angle:

> Track 3: Agentic Economy & Autonomous Applications

## Required Links

- GitHub repo: `https://github.com/dolepee/actionfeed-credit-desk`
- Demo URL: `https://creditgate.vercel.app`
- Demo video: `TODO after recording`
- 0G mainnet contract: `0xd65BE781fF6e6b8Dd514Aa4A13EfD3860a509854`
- 0G explorer link: `https://chainscan.0g.ai/address/0xd65BE781fF6e6b8Dd514Aa4A13EfD3860a509854`
- X post: `TODO`

## 0G Integration Proof

Final proof packet:

- `AgentCreditRegistry` address on 0G mainnet
- explorer link showing deployment
- explorer links for score, mandate, refusal, and allowed-use txs
- proof JSON roots in `docs/0G_MAINNET_PROOF.json`
- verifier output from `npm run verify:credit`

## Demo Video Must Show

- `/credit` page
- YieldScout score `73/100`
- cap `$500`
- over-cap attempt `$1,200`
- `MANDATE_REFUSED`
- under-cap allowed use `$250`
- `/proof` page or verifier output
- 0G explorer link for the deployed registry

## Public X Post Draft

```text
Introducing CreditGate for the 0G APAC Hackathon.

Autonomous agents need more than wallets. They need earned authority.

YieldScout gets a 73/100 credit score from signed 0G history, receives a $500 mandate, then gets refused when it attempts a $1,200 over-cap action. The refusal is anchored on 0G.

Live app: https://creditgate.vercel.app
Repo: https://github.com/dolepee/actionfeed-credit-desk

#0GHackathon #BuildOn0G
@0G_labs @0g_CN @0g_Eco @HackQuest_
```
