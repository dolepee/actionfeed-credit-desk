// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AgentCreditRegistry} from "../src/AgentCreditRegistry.sol";

contract AgentCreditRegistryTest {
    AgentCreditRegistry private registry;
    Vm private constant VM = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

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
        registry.refuseMandate(1, refusalRoot, mandateRoot, 1200, "over_budget");
        registry.useDelegation(1, mandateRoot, useRoot, 250, address(0xBEEF));
    }

    function testRefusalRequiresOverCapAttempt() public {
        registry = new AgentCreditRegistry();
        registry.registerAgent(2, keccak256("feed"), "0g://yieldscout/metadata");
        bytes32 mandateRoot = keccak256("mandate");
        registry.grantMandate(2, mandateRoot, 500, uint64(block.timestamp + 1 days));

        (bool ok,) = address(registry).call(
            abi.encodeWithSelector(
                AgentCreditRegistry.refuseMandate.selector,
                2,
                keccak256("bad-refusal"),
                mandateRoot,
                250,
                "over_budget"
            )
        );

        require(!ok, "under-cap refusal should revert");
    }

    function testDelegationUseRequiresActiveMandate() public {
        registry = new AgentCreditRegistry();
        registry.registerAgent(3, keccak256("feed"), "0g://yieldscout/metadata");

        (bool ok,) = address(registry).call(
            abi.encodeWithSelector(
                AgentCreditRegistry.useDelegation.selector,
                3,
                keccak256("missing-mandate"),
                keccak256("use"),
                250,
                address(0xBEEF)
            )
        );

        require(!ok, "use without mandate should revert");
    }

    function testDelegationUseEnforcesCapAndMandateRoot() public {
        registry = new AgentCreditRegistry();
        registry.registerAgent(4, keccak256("feed"), "0g://yieldscout/metadata");
        bytes32 mandateRoot = keccak256("mandate");
        registry.grantMandate(4, mandateRoot, 500, uint64(block.timestamp + 1 days));

        (bool overCapOk,) = address(registry).call(
            abi.encodeWithSelector(
                AgentCreditRegistry.useDelegation.selector,
                4,
                mandateRoot,
                keccak256("use"),
                501,
                address(0xBEEF)
            )
        );
        require(!overCapOk, "over-cap use should revert");

        (bool wrongRootOk,) = address(registry).call(
            abi.encodeWithSelector(
                AgentCreditRegistry.useDelegation.selector,
                4,
                keccak256("wrong-mandate"),
                keccak256("use"),
                250,
                address(0xBEEF)
            )
        );
        require(!wrongRootOk, "wrong mandate root should revert");
    }

    function testDelegationUseRejectsExpiredMandate() public {
        registry = new AgentCreditRegistry();
        registry.registerAgent(5, keccak256("feed"), "0g://yieldscout/metadata");
        bytes32 mandateRoot = keccak256("mandate");
        registry.grantMandate(5, mandateRoot, 500, uint64(block.timestamp + 1 days));
        VM.warp(block.timestamp + 2 days);

        (bool ok,) = address(registry).call(
            abi.encodeWithSelector(
                AgentCreditRegistry.useDelegation.selector,
                5,
                mandateRoot,
                keccak256("use"),
                250,
                address(0xBEEF)
            )
        );

        require(!ok, "expired mandate use should revert");
    }
}

interface Vm {
    function warp(uint256) external;
}
