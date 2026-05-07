export const AGENT_CREDIT_REGISTRY_ABI = [
  "function agents(uint256) view returns (address owner, bytes32 feedRoot, string metadataURI, bool exists)",
  "function activeMandates(uint256) view returns (bytes32 mandateRoot, uint256 capUsd, uint64 expiresAt, bool exists)",
  "function capForScore(uint16 score) pure returns (uint256)",
  "function scoreFromMetrics(uint16 completedActions, uint16 receiptCount, bool hasLatestReview, uint16 violationCount) pure returns (uint16)",
  "event AgentRegistered(uint256 indexed agentId, address indexed owner, bytes32 feedRoot, string metadataURI)",
  "event CreditScored(uint256 indexed agentId, uint16 score, uint256 capUsd, bytes32 evidenceRoot)",
  "event MandateGranted(uint256 indexed agentId, bytes32 mandateRoot, uint256 capUsd, uint64 expiresAt)",
  "event MandateRefused(uint256 indexed agentId, bytes32 mandateRoot, bytes32 refusalRoot, uint256 attemptedUsd, uint256 capUsd, string reason)",
  "event DelegationUsed(uint256 indexed agentId, bytes32 mandateRoot, bytes32 useRoot, uint256 amountUsd, address indexed recipient)",
] as const;
