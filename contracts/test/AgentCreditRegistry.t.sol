// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../src/AgentCreditRegistry.sol";

contract AgentCreditRegistryTest {
    AgentCreditRegistry private registry;

    function testRegisterAndAnchorCreditFlow() public {
        registry = new AgentCreditRegistry();

        bytes32 feedRoot = keccak256("yieldscout-feed");
        bytes32 evidenceRoot = keccak256("yieldscout-evidence");
        bytes32 mandateRoot = keccak256("yieldscout-mandate");
        bytes32 refusalRoot = keccak256("yieldscout-refusal");
        bytes32 useRoot = keccak256("yieldscout-use");

        registry.registerAgent(1, feedRoot, "0g://yieldscout/metadata");
        (address owner, bytes32 storedFeedRoot, string memory metadataURI, bool exists) = registry.agents(1);

        require(owner == address(this), "owner mismatch");
        require(storedFeedRoot == feedRoot, "feed root mismatch");
        require(keccak256(bytes(metadataURI)) == keccak256(bytes("0g://yieldscout/metadata")), "metadata mismatch");
        require(exists, "agent missing");

        registry.scoreCredit(1, 73, 500, evidenceRoot);
        registry.grantMandate(1, mandateRoot, 500, uint64(block.timestamp + 1 days));
        registry.refuseMandate(1, refusalRoot, 1200, 500, "over_budget");
        registry.useDelegation(1, useRoot, 250, address(0xBEEF));
    }

    function testRefusalRequiresOverCapAttempt() public {
        registry = new AgentCreditRegistry();
        registry.registerAgent(2, keccak256("feed"), "0g://yieldscout/metadata");

        (bool ok,) = address(registry).call(
            abi.encodeWithSelector(
                AgentCreditRegistry.refuseMandate.selector,
                2,
                keccak256("bad-refusal"),
                250,
                500,
                "over_budget"
            )
        );

        require(!ok, "under-cap refusal should revert");
    }
}

