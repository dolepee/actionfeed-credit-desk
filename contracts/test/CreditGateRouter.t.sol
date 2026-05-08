// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AgentCreditRegistry} from "../src/AgentCreditRegistry.sol";
import {CreditGateRouter} from "../src/CreditGateRouter.sol";

contract CreditGateRouterTest {
    Vm private constant VM = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));
    AgentCreditRegistry private registry;
    CreditGateRouter private router;
    Sink private recipient;

    function setUp() public {
        VM.deal(address(this), 10 ether);
        registry = new AgentCreditRegistry();
        router = new CreditGateRouter(address(registry));
        recipient = new Sink();

        registry.registerAgent(1, keccak256("yieldscout-feed"), "0g://yieldscout/metadata");
        registry.grantMandate(1, keccak256("yieldscout-mandate"), 500, uint64(block.timestamp + 1 days));
    }

    function testPayWithMandateMovesNativeValue() public {
        uint256 beforeBalance = address(recipient).balance;

        router.payWithMandate{value: 0.01 ether}(
            1,
            keccak256("yieldscout-mandate"),
            keccak256("yieldscout-router-use"),
            250,
            payable(address(recipient))
        );

        require(address(recipient).balance == beforeBalance + 0.01 ether, "recipient balance mismatch");
    }

    function testPayWithMandateRejectsOverCapWithoutMovingFunds() public {
        uint256 beforeBalance = address(recipient).balance;

        (bool ok,) = address(router).call{value: 0.01 ether}(
            abi.encodeWithSelector(
                CreditGateRouter.payWithMandate.selector,
                1,
                keccak256("yieldscout-mandate"),
                keccak256("yieldscout-router-use"),
                501,
                payable(address(recipient))
            )
        );

        require(!ok, "over-cap payment should revert");
        require(address(recipient).balance == beforeBalance, "recipient should not be paid");
    }

    function testRefusePaymentRequiresOverCapAttempt() public {
        router.refusePayment(
            1,
            keccak256("yieldscout-mandate"),
            keccak256("yieldscout-router-refusal"),
            1200,
            "over_budget"
        );

        (bool ok,) = address(router).call(
            abi.encodeWithSelector(
                CreditGateRouter.refusePayment.selector,
                1,
                keccak256("yieldscout-mandate"),
                keccak256("yieldscout-router-refusal"),
                250,
                "over_budget"
            )
        );

        require(!ok, "under-cap refusal should revert");
    }

    function testRouterRejectsWrongOwner() public {
        VM.prank(address(0xB0B));
        (bool ok,) = address(router).call{value: 0.01 ether}(
            abi.encodeWithSelector(
                CreditGateRouter.payWithMandate.selector,
                1,
                keccak256("yieldscout-mandate"),
                keccak256("yieldscout-router-use"),
                250,
                payable(address(recipient))
            )
        );

        require(!ok, "wrong owner should revert");
    }

    function testRouterRejectsExpiredMandate() public {
        VM.warp(block.timestamp + 2 days);

        (bool ok,) = address(router).call{value: 0.01 ether}(
            abi.encodeWithSelector(
                CreditGateRouter.payWithMandate.selector,
                1,
                keccak256("yieldscout-mandate"),
                keccak256("yieldscout-router-use"),
                250,
                payable(address(recipient))
            )
        );

        require(!ok, "expired mandate should revert");
    }
}

contract Sink {
    receive() external payable {}
}

interface Vm {
    function deal(address account, uint256 newBalance) external;
    function prank(address) external;
    function warp(uint256) external;
}
