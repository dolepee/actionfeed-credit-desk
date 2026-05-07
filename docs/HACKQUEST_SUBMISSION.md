# HackQuest Submission Checklist

## Basic Project Information

Project name:

> CreditGate

One-sentence description, under 30 words:

> A 0G-native credit desk where signed agent history becomes enforceable spend authority, with over-cap refusals anchored on-chain.

Short summary:

> CreditGate gives autonomous agents a replayable public credit history. It compares two signed agent histories, calculates different credit scores and spend caps, refuses over-cap actions, stores the canonical proof packet on 0G Storage, and anchors refusals, allowed uses, and the Storage root on 0G Chain.

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
- 0G Storage root: `0x89364a379ffb896ffcc4042b18faeeb35000548862ad214feb9f7c12d92fbe1f`
- X post: `TODO`

## 0G Integration Proof

Final proof packet:

- `AgentCreditRegistry` address on 0G mainnet
- canonical portfolio proof JSON uploaded to 0G Storage
- explorer link showing deployment
- explorer links for two agents' score, mandate, refusal, and allowed-use txs
- explorer links for Storage upload and Storage-root anchor txs
- proof JSON roots in `docs/0G_MAINNET_PROOF.json`
- verifier output from `npm run verify:credit`
- Storage verifier output from `npm run verify:storage`

## Demo Video Must Show

- `/credit` page
- YieldScout score `73/100` and cap `$500`
- DriftBot score `41/100` and cap `$150`
- over-cap attempts refused with `MANDATE_REFUSED`
- under-cap uses allowed with `DELEGATION_USED`
- `/proof` page or verifier output
- 0G Storage proof root and `CREDIT_DESK_STORAGE_VALID`
- 0G explorer link for the deployed registry

## Public X Post Draft

```text
Introducing CreditGate for the 0G APAC Hackathon.

Autonomous agents need more than wallets. They need earned authority.

YieldScout earns 73/100 and a $500 cap. DriftBot earns 41/100 and a $150 cap. Both over-cap attempts are refused before spend. The full proof packet is stored on 0G Storage and anchored on 0G mainnet.

Live app: https://creditgate.vercel.app
Repo: https://github.com/dolepee/actionfeed-credit-desk

#0GHackathon #BuildOn0G
@0G_labs @0g_CN @0g_Eco @HackQuest_
```
