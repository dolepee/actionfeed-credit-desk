# HackQuest Submission Checklist

## Basic Project Information

Project name:

> CreditGate

One-sentence description, under 30 words:

> A 0G-native credit gate where signed agent history becomes enforceable spend authority, with over-cap refusals anchored on-chain.

Short summary:

> CreditGate gives autonomous agents a replayable public credit history. It compares two signed agent histories, adds 0G Compute risk review when funded, calculates different credit scores and spend caps, refuses over-cap actions, stores the canonical portfolio record on 0G Storage, and anchors refusals, allowed uses, and the Storage root on 0G Chain.

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
- 0G Storage root: `0x37414d25ef5962398687339d851d28aee5abad81893166e2189ac7ae4d8912a0`
- X post: `SUBMISSION BLOCKER - add final public X post URL after posting`

## 0G Integration Proof

Final verification packet:

- `AgentCreditRegistry` address on 0G mainnet
- canonical portfolio JSON uploaded to 0G Storage
- explorer link showing deployment
- explorer links for two agents' score, mandate, refusal, and allowed-use txs
- explorer links for Storage upload and Storage-root anchor txs
- proof JSON roots in `docs/0G_MAINNET_PROOF.json`
- verifier output from `npm run verify:credit`
- Compute verifier output from `npm run verify:compute`
- Storage verifier output from `npm run verify:storage`
- Mainnet verifier output from `npm run verify:mainnet`

## Demo Video Must Show

- `/credit` page
- YieldScout score `73/100` and cap `$500`
- DriftBot score `41/100` and cap `$150`
- over-cap attempts refused with `MANDATE_REFUSED`
- under-cap uses allowed with `DELEGATION_USED`
- 0G Compute risk review card, or fixture card if the Compute wallet has not been funded yet
- paste/load a signed history on `/credit` and show the score recalculating
- verifier output
- Compute verifier output and `CREDITGATE_COMPUTE_VALID`
- 0G Storage proof root and `CREDITGATE_STORAGE_VALID`
- 0G mainnet verifier output and `CREDITGATE_MAINNET_VALID`
- OpenClaw-compatible loop output: `OPENCLAW_CREDITGATE_RUNTIME_VALID`
- 0G explorer link for the deployed registry

## Public X Post Draft

```text
Introducing CreditGate for the 0G APAC Hackathon.

Autonomous agents need more than wallets. They need earned authority.

YieldScout earns 73/100 and a $500 cap. DriftBot earns 41/100 and a $150 cap. Both over-cap attempts are refused before spend. The proof packet is stored on 0G Storage, and the Compute review path is ready to run live once the 0G Compute wallet is funded.

Live app: https://creditgate.vercel.app
Repo: https://github.com/dolepee/creditgate

#0GHackathon #BuildOn0G
@0G_labs @0g_CN @0g_Eco @HackQuest_
```
