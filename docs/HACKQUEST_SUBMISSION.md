# HackQuest Submission Checklist

## Basic Project Information

Project name:

> CreditGate

One-sentence description, under 30 words:

> A 0G-native credit gate where signed agent history becomes enforceable spend authority, with over-cap refusals anchored on-chain.

Short summary:

> CreditGate gives autonomous agents a replayable public credit history. It compares two signed agent histories, adds live 0G Compute risk review, calculates different credit scores and spend caps, refuses over-cap actions, stores the canonical portfolio record on 0G Storage, anchors the proof on 0G Chain, and moves native 0G only through an under-cap router call.

## Track

Primary:

> Track 3: Agentic Economy & Autonomous Applications

Supporting angle:

> Track 1: Agentic Infrastructure & OpenClaw Lab

## Required Links

- GitHub repo: `https://github.com/dolepee/creditgate`
- Demo URL: `https://creditgate.vercel.app`
- Demo video: `SUBMISSION BLOCKER - add final video URL after recording`
- 0G mainnet contract: `0x3A4f5a2F65119b7C1d13914fC3875348392eDa7d`
- 0G explorer link: `https://chainscan.0g.ai/address/0x3A4f5a2F65119b7C1d13914fC3875348392eDa7d`
- CreditGateRouter: `0x7e2FD82AeE9Caa2eB72aBBefa797d9E3298f578b`
- 0G Storage root: `0x9ab0a8d04beba5fa8dbcd7b465b0929cdda9a07e99ed2c4c33fd47e13a291500`
- X post: `SUBMISSION BLOCKER - add final public X post URL after posting`

## 0G Integration Proof

Final verification packet:

- `AgentCreditRegistry` address on 0G mainnet
- canonical portfolio JSON uploaded to 0G Storage
- explorer link showing deployment
- explorer links for two agents' score, mandate, refusal, and allowed-use txs
- explorer links for Storage upload and Storage-root anchor txs
- explorer links for router deploy, router refusal, and router payment txs
- proof JSON roots in `docs/0G_MAINNET_PROOF.json`
- verifier output from `npm run verify:credit`
- Compute verifier output from `npm run verify:compute`
- Storage verifier output from `npm run verify:storage`
- Mainnet verifier output from `npm run verify:mainnet`
- Router verifier output from `npm run verify:router`

## Demo Video Must Show

- `/credit` page
- YieldScout score `73/100` and cap `$500`
- DriftBot score `41/100` and cap `$150`
- over-cap attempts refused with `MANDATE_REFUSED`
- under-cap uses allowed with `DELEGATION_USED`
- 0G Compute risk review card
- router proof showing over-cap refusal and under-cap native 0G payment
- paste/load a signed history on `/credit` and show the score recalculating
- verifier output
- Compute verifier output and `CREDITGATE_COMPUTE_VALID`
- 0G Storage proof root and `CREDITGATE_STORAGE_VALID`
- 0G mainnet verifier output and `CREDITGATE_MAINNET_VALID`
- router verifier output and `CREDITGATE_ROUTER_VALID`
- OpenClaw-compatible loop output: `OPENCLAW_CREDITGATE_RUNTIME_VALID`
- 0G explorer link for the deployed registry

## Public X Post Draft

```text
Introducing CreditGate for the 0G APAC Hackathon.

Autonomous agents need more than wallets. They need earned authority.

YieldScout earns 73/100 and a $500 cap. DriftBot earns 41/100 and a $150 cap. 0G Compute reviews the risk, 0G Storage preserves the proof packet, 0G Chain enforces the mandate, and CreditGateRouter refuses over-cap spend before moving native 0G for an allowed use.

Live app: https://creditgate.vercel.app
Repo: https://github.com/dolepee/creditgate

#0GHackathon #BuildOn0G
@0G_labs @0g_CN @0g_Eco @HackQuest_
```
