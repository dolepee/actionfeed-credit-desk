# 0G Mainnet Deploy Runbook

This runbook is for the final no-surprises mainnet step. Do not use the old ActionFeed Galileo deployer unless it is intentionally funded on 0G mainnet.

## Required Environment

Create `.env.local`:

```bash
ZG_MAINNET_RPC=https://evmrpc.0g.ai
ZG_MAINNET_CHAIN_ID=16661
ZG_MAINNET_EXPLORER=https://chainscan.0g.ai
ZG_PRIVATE_KEY=0x...
```

The deployer needs enough 0G for:

- one `AgentCreditRegistry` contract deploy
- five anchor transactions

## Preflight

Run:

```bash
npm run verify:credit
npm run typecheck
npm run build
forge test -vvv --root contracts
```

Confirm:

- verifier prints `CREDIT_DESK_VALID`
- build succeeds
- Foundry tests pass
- deployer is funded on 0G mainnet

## Deploy

Run:

```bash
forge build --root contracts
npm run deploy:mainnet
```

Expected output:

- deployer address
- chain ID `16661`
- balance
- deploy tx hash
- `AgentCreditRegistry` address
- `deployments/0g-mainnet.json`

## Seed Anchors

Run:

```bash
npm run seed:mainnet
```

This emits:

- `AgentRegistered`
- `CreditScored`
- `MandateGranted`
- `MandateRefused`
- `DelegationUsed`

It updates:

- `src/credit/mainnet-anchors.json`
- `docs/0G_MAINNET_PROOF.json`

## Post-Deploy Checks

Run:

```bash
npm run verify:credit
npm run build
```

Then open:

- `/credit`
- `/proof`

The proof page should no longer show `pending-mainnet-deploy`.

## Submission Evidence

Copy into HackQuest:

- 0G mainnet contract address
- 0G Explorer address link
- demo URL
- GitHub repo
- demo video link
- public X post link

