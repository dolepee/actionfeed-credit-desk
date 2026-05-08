// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IAgentCreditRegistry {
    function agents(uint256 agentId)
        external
        view
        returns (address owner, bytes32 feedRoot, string memory metadataURI, bool exists);

    function activeMandates(uint256 agentId)
        external
        view
        returns (bytes32 mandateRoot, uint256 capUsd, uint64 expiresAt, bool exists);
}

/// @title CreditGateRouter
/// @notice Fund-moving payment router that only transfers native 0G when a CreditGate mandate allows it.
/// @dev USD amounts are policy amounts from the mandate. Native value is the actual transferred asset.
contract CreditGateRouter {
    IAgentCreditRegistry public immutable registry;

    event MandatePayment(
        uint256 indexed agentId,
        bytes32 indexed mandateRoot,
        bytes32 indexed useRoot,
        uint256 amountUsd,
        uint256 nativeValue,
        address recipient
    );
    event MandatePaymentRefused(
        uint256 indexed agentId,
        bytes32 indexed mandateRoot,
        bytes32 indexed refusalRoot,
        uint256 attemptedUsd,
        uint256 capUsd,
        string reason
    );

    constructor(address registry_) {
        require(registry_ != address(0), "zero registry");
        registry = IAgentCreditRegistry(registry_);
    }

    function payWithMandate(
        uint256 agentId,
        bytes32 mandateRoot,
        bytes32 useRoot,
        uint256 amountUsd,
        address payable recipient
    ) external payable {
        _requireAgentOwner(agentId);
        (, uint256 capUsd,,) = _requireMandate(agentId, mandateRoot);
        require(useRoot != bytes32(0), "zero use root");
        require(amountUsd > 0, "zero amount");
        require(amountUsd <= capUsd, "over cap");
        require(msg.value > 0, "zero value");
        require(recipient != address(0), "zero recipient");

        (bool ok,) = recipient.call{value: msg.value}("");
        require(ok, "transfer failed");

        emit MandatePayment(agentId, mandateRoot, useRoot, amountUsd, msg.value, recipient);
    }

    function refusePayment(
        uint256 agentId,
        bytes32 mandateRoot,
        bytes32 refusalRoot,
        uint256 attemptedUsd,
        string calldata reason
    ) external {
        _requireAgentOwner(agentId);
        (, uint256 capUsd,,) = _requireMandate(agentId, mandateRoot);
        require(refusalRoot != bytes32(0), "zero refusal root");
        require(bytes(reason).length > 0, "empty reason");
        require(attemptedUsd > capUsd, "not over cap");

        emit MandatePaymentRefused(agentId, mandateRoot, refusalRoot, attemptedUsd, capUsd, reason);
    }

    function _requireAgentOwner(uint256 agentId) internal view {
        (address owner,,, bool exists) = registry.agents(agentId);
        require(exists, "agent missing");
        require(owner == msg.sender, "not agent owner");
    }

    function _requireMandate(uint256 agentId, bytes32 mandateRoot)
        internal
        view
        returns (bytes32 storedRoot, uint256 capUsd, uint64 expiresAt, bool exists)
    {
        (storedRoot, capUsd, expiresAt, exists) = registry.activeMandates(agentId);
        require(exists, "mandate missing");
        require(storedRoot == mandateRoot, "mandate mismatch");
        require(block.timestamp <= expiresAt, "mandate expired");
    }
}
