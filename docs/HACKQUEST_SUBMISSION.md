# HackQuest Submission Checklist

## Basic Project Information

Project name:

> CreditGate

One-sentence description, under 30 words:

> A 0G-native credit gate where signed agent history becomes enforceable spend authority, with over-cap refusals anchored on-chain.

Short summary:

> CreditGate gives autonomous agents a replayable public credit history. It compares two signed agent histories, calculates different credit scores and spend caps, refuses over-cap actions, stores the canonical portfolio record on 0G Storage, and anchors refusals, allowed uses, and the Storage root on 0G Chain.

## Track

Primary:

> Track 1: Agentic Infrastructure & OpenClaw Lab

Supporting angle:

> Track 3: Agentic Economy & Autonomous Applications

## Required Links

- GitHub repo: `https://github.com/dolepee/creditgate`
- Demo URL: `https://creditgate.vercel.app`
- Demo video: `add final video URL after recording`
- 0G mainnet contract: `0x4D98ee9f1dc2F9852A54aDfae81937520498E12a`
- 0G explorer link: `https://chainscan.0g.ai/address/0x4D98ee9f1dc2F9852A54aDfae81937520498E12a`
- 0G Storage root: `0x4df825e71e0ad2d873c1518ce18b0cec6cd495981db1ea93e20d192cd29a2d98`
- X post: `add final public X post URL after posting`

## 0G Integration Proof

Final verification packet:

- `AgentCreditRegistry` address on 0G mainnet
- canonical portfolio JSON uploaded to 0G Storage
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
- verifier output
- 0G Storage proof root and `CREDITGATE_STORAGE_VALID`
- 0G explorer link for the deployed registry

## Public X Post Draft

```text
Introducing CreditGate for the 0G APAC Hackathon.

Autonomous agents need more than wallets. They need earned authority.

YieldScout earns 73/100 and a $500 cap. DriftBot earns 41/100 and a $150 cap. Both over-cap attempts are refused before spend. The full proof packet is stored on 0G Storage and anchored on 0G mainnet.

Live app: https://creditgate.vercel.app
Repo: https://github.com/dolepee/creditgate

#0GHackathon #BuildOn0G
@0G_labs @0g_CN @0g_Eco @HackQuest_
```
