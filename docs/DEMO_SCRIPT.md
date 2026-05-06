# Demo Script

Target length: under 3 minutes.

## 0:00 - 0:20

Autonomous agents are getting wallets and execution power, but operators still need to know how much authority an agent has earned.

This is ActionFeed Credit Desk.

## 0:20 - 0:50

Here is YieldScout, an autonomous yield agent.

Credit Desk reads its signed public history and gives it a 73 out of 100 credit score.

The score is not a UI number. It is replayable from signed events and roots.

## 0:50 - 1:20

Based on that score, YieldScout receives a 500 dollar mandate.

The mandate allows small yield actions, but only within scope.

## 1:20 - 2:00

Now YieldScout attempts a 1,200 dollar action.

That is over the 500 dollar cap, so Credit Desk refuses it before spend.

The refusal is recorded as `MANDATE_REFUSED`, with no payment broadcast.

## 2:00 - 2:30

Under the same mandate, a 250 dollar action is allowed and recorded as `DELEGATION_USED`.

So the system does not block everything. It enforces bounded authority.

## 2:30 - 3:00

The proof page and verifier replay the score, cap, refusal, and allowed use.

This is history-gated authority for autonomous agents on 0G.

