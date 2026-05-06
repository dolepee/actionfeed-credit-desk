// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title AgentCreditRegistry
/// @notice Minimal 0G Chain anchor contract for ActionFeed Credit Desk.
/// @dev The heavy data lives in 0G Storage. This contract emits roots so judges
/// can verify score, mandate, refusal, and allowed-use activity onchain.
contract AgentCreditRegistry {
    struct Agent {
        address owner;
        bytes32 feedRoot;
        string metadataURI;
        bool exists;
    }

    mapping(uint256 agentId => Agent) public agents;

    event AgentRegistered(uint256 indexed agentId, address indexed owner, bytes32 feedRoot, string metadataURI);
    event CreditScored(uint256 indexed agentId, uint16 score, uint256 capUsd, bytes32 evidenceRoot);
    event MandateGranted(uint256 indexed agentId, bytes32 mandateRoot, uint256 capUsd, uint64 expiresAt);
    event MandateRefused(
        uint256 indexed agentId,
        bytes32 refusalRoot,
        uint256 attemptedUsd,
        uint256 capUsd,
        string reason
    );
    event DelegationUsed(uint256 indexed agentId, bytes32 useRoot, uint256 amountUsd, address indexed recipient);

    modifier onlyAgentOwner(uint256 agentId) {
        _onlyAgentOwner(agentId);
        _;
    }

    function _onlyAgentOwner(uint256 agentId) internal view {
        require(agents[agentId].owner == msg.sender, "not agent owner");
    }

    function registerAgent(uint256 agentId, bytes32 feedRoot, string calldata metadataURI) external {
        require(!agents[agentId].exists, "agent exists");
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
        require(expiresAt > block.timestamp, "expired");
        emit MandateGranted(agentId, mandateRoot, capUsd, expiresAt);
    }

    function refuseMandate(
        uint256 agentId,
        bytes32 refusalRoot,
        uint256 attemptedUsd,
        uint256 capUsd,
        string calldata reason
    ) external onlyAgentOwner(agentId) {
        require(attemptedUsd > capUsd, "not over cap");
        emit MandateRefused(agentId, refusalRoot, attemptedUsd, capUsd, reason);
    }

    function useDelegation(uint256 agentId, bytes32 useRoot, uint256 amountUsd, address recipient)
        external
        onlyAgentOwner(agentId)
    {
        require(recipient != address(0), "zero recipient");
        emit DelegationUsed(agentId, useRoot, amountUsd, recipient);
    }
}
