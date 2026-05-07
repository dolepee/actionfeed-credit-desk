// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title AgentCreditRegistry
/// @notice 0G Chain registry and mandate guard for CreditGate.
/// @dev The heavy data is represented by replayable proof roots. This contract stores the active
/// mandate root/cap/expiry and rejects delegation use that does not match that mandate.
contract AgentCreditRegistry {
    struct Agent {
        address owner;
        bytes32 feedRoot;
        string metadataURI;
        bool exists;
    }

    struct ActiveMandate {
        bytes32 mandateRoot;
        uint256 capUsd;
        uint64 expiresAt;
        bool exists;
    }

    mapping(uint256 agentId => Agent) public agents;
    mapping(uint256 agentId => ActiveMandate) public activeMandates;

    event AgentRegistered(uint256 indexed agentId, address indexed owner, bytes32 feedRoot, string metadataURI);
    event CreditScored(uint256 indexed agentId, uint16 score, uint256 capUsd, bytes32 evidenceRoot);
    event MandateGranted(uint256 indexed agentId, bytes32 mandateRoot, uint256 capUsd, uint64 expiresAt);
    event MandateRefused(
        uint256 indexed agentId,
        bytes32 mandateRoot,
        bytes32 refusalRoot,
        uint256 attemptedUsd,
        uint256 capUsd,
        string reason
    );
    event DelegationUsed(
        uint256 indexed agentId,
        bytes32 mandateRoot,
        bytes32 useRoot,
        uint256 amountUsd,
        address indexed recipient
    );

    modifier onlyAgentOwner(uint256 agentId) {
        _onlyAgentOwner(agentId);
        _;
    }

    function _onlyAgentOwner(uint256 agentId) internal view {
        require(agents[agentId].owner == msg.sender, "not agent owner");
    }

    function registerAgent(uint256 agentId, bytes32 feedRoot, string calldata metadataURI) external {
        require(!agents[agentId].exists, "agent exists");
        require(feedRoot != bytes32(0), "zero feed root");
        agents[agentId] = Agent({
            owner: msg.sender,
            feedRoot: feedRoot,
            metadataURI: metadataURI,
            exists: true
        });
        emit AgentRegistered(agentId, msg.sender, feedRoot, metadataURI);
    }

    function scoreCredit(uint256 agentId, uint16 score, uint256 capUsd, bytes32 evidenceRoot)
        external
        onlyAgentOwner(agentId)
    {
        require(score <= 100, "score too high");
        emit CreditScored(agentId, score, capUsd, evidenceRoot);
    }

    function grantMandate(uint256 agentId, bytes32 mandateRoot, uint256 capUsd, uint64 expiresAt)
        external
        onlyAgentOwner(agentId)
    {
        require(mandateRoot != bytes32(0), "zero mandate root");
        require(capUsd > 0, "zero cap");
        require(expiresAt > block.timestamp, "expired");
        activeMandates[agentId] = ActiveMandate({
            mandateRoot: mandateRoot,
            capUsd: capUsd,
            expiresAt: expiresAt,
            exists: true
        });
        emit MandateGranted(agentId, mandateRoot, capUsd, expiresAt);
    }

    function refuseMandate(
        uint256 agentId,
        bytes32 refusalRoot,
        bytes32 mandateRoot,
        uint256 attemptedUsd,
        string calldata reason
    ) external onlyAgentOwner(agentId) {
        ActiveMandate memory mandate = _activeMandate(agentId, mandateRoot);
        require(refusalRoot != bytes32(0), "zero refusal root");
        require(bytes(reason).length > 0, "empty reason");
        require(attemptedUsd > mandate.capUsd, "not over cap");
        emit MandateRefused(agentId, mandateRoot, refusalRoot, attemptedUsd, mandate.capUsd, reason);
    }

    function useDelegation(uint256 agentId, bytes32 mandateRoot, bytes32 useRoot, uint256 amountUsd, address recipient)
        external
        onlyAgentOwner(agentId)
    {
        ActiveMandate memory mandate = _activeMandate(agentId, mandateRoot);
        require(useRoot != bytes32(0), "zero use root");
        require(amountUsd > 0, "zero amount");
        require(amountUsd <= mandate.capUsd, "over cap");
        require(recipient != address(0), "zero recipient");
        emit DelegationUsed(agentId, mandateRoot, useRoot, amountUsd, recipient);
    }

    function _activeMandate(uint256 agentId, bytes32 mandateRoot)
        internal
        view
        returns (ActiveMandate memory mandate)
    {
        mandate = activeMandates[agentId];
        require(mandate.exists, "mandate missing");
        require(mandate.mandateRoot == mandateRoot, "mandate mismatch");
        require(block.timestamp <= mandate.expiresAt, "mandate expired");
    }
}
