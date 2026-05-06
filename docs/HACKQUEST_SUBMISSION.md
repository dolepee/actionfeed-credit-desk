# HackQuest Submission Checklist

## Basic Project Information

Project name:

> ActionFeed Credit Desk

One-sentence description, under 30 words:

> A 0G-native credit desk where signed agent history becomes enforceable spend authority, with over-cap refusals anchored on-chain.

Short summary:

> ActionFeed Credit Desk gives autonomous agents a replayable public credit history. It reads signed action records from 0G, calculates an agent credit score, grants a bounded spend cap, refuses over-cap actions, and anchors both refusals and allowed uses on 0G Chain.

## Track

Primary:

> Track 1: Agentic Infrastructure & OpenClaw Lab

Supporting angle:

> Track 3: Agentic Economy & Autonomous Applications

## Required Links

- GitHub repo: `TODO`
- Demo URL: `TODO`
- Demo video: `TODO`
- 0G mainnet contract: `TODO`
- 0G explorer link: `TODO`
- X post: `TODO`

## 0G Integration Proof

Before final submission, include:

- `AgentCreditRegistry` address on 0G mainnet
- explorer link showing deployment
- explorer links for score, mandate, refusal, and allowed-use txs
- 0G Storage roots or proof JSON roots
- verifier output from `npm run verify:credit`

## Demo Video Must Show

- `/credit` page
- YieldScout score `73/100`
- cap `$500`
- over-cap attempt `$1,200`
- `MANDATE_REFUSED`
- under-cap allowed use `$250`
- `/proof` page or verifier output
- 0G explorer link after mainnet deployment

## Public X Post Draft

```text
Introducing ActionFeed Credit Desk for the 0G APAC Hackathon.

Autonomous agents need more than wallets. They need earned authority.

YieldScout gets a 73/100 credit score from signed 0G history, receives a $500 mandate, then gets refused when it attempts a $1,200 over-cap action. The refusal is anchored on 0G.

#0GHackathon #BuildOn0G
@0G_labs @0g_CN @0g_Eco @HackQuest_
```

