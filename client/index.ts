import { createPublicClient, http, parseAbi } from "viem";
import { sepolia } from "viem/chains";

// Contract configuration
const CONTRACT_ADDRESS = "0x382716375F0B879c2e0a195EE7c40615307Ee740" as const;
const RPC_URL = "https://sepolia.gateway.tenderly.co";

// Contract ABI - only the functions we need
const CROWDFUNDING_ABI = parseAbi([
  "function getCampaign(uint256 campaignId) external view returns (address creator, uint256 goal, uint256 deadline, uint256 amountRaised, bool withdrawn, bool isActive, bool goalReached)",
  "function campaignCount() external view returns (uint256)",
  "function getAllDonors(uint256 campaignId) external view returns (address[] memory)",
]);

// Campaign data type
export interface CampaignData {
  creator: string;
  goal: bigint;
  deadline: bigint;
  amountRaised: bigint;
  withdrawn: boolean;
  isActive: boolean;
  goalReached: boolean;
}

// Create viem client
const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(RPC_URL),
});

/**
 * Get campaign data by campaign ID
 * @param campaignId - The ID of the campaign to retrieve
 * @returns Promise<CampaignData> - Campaign data or throws error
 */
export async function getCampaign(campaignId: number): Promise<CampaignData> {
  try {
    if (campaignId < 0) {
      throw new Error("Campaign ID must be a non-negative number");
    }

    const result = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: CROWDFUNDING_ABI,
      functionName: "getCampaign",
      args: [BigInt(campaignId)],
    });

    return {
      creator: result[0],
      goal: result[1],
      deadline: result[2],
      amountRaised: result[3],
      withdrawn: result[4],
      isActive: result[5],
      goalReached: result[6],
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get campaign ${campaignId}: ${error.message}`);
    }
    throw new Error(`Failed to get campaign ${campaignId}: Unknown error`);
  }
}

/**
 * Get total number of campaigns
 * @returns Promise<number> - Total campaign count
 */
export async function getCampaignCount(): Promise<number> {
  try {
    const count = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: CROWDFUNDING_ABI,
      functionName: "campaignCount",
    });
    return Number(count);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get campaign count: ${error.message}`);
    }
    throw new Error("Failed to get campaign count: Unknown error");
  }
}

/**
 * Get all donors for a specific campaign
 * @param campaignId - The ID of the campaign
 * @returns Promise<string[]> - Array of donor addresses
 */
export async function getAllDonors(campaignId: number): Promise<string[]> {
  try {
    if (campaignId < 0) {
      throw new Error("Campaign ID must be a non-negative number");
    }

    const donors = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: CROWDFUNDING_ABI,
      functionName: "getAllDonors",
      args: [BigInt(campaignId)],
    });

    return [...donors];
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        `Failed to get donors for campaign ${campaignId}: ${error.message}`
      );
    }
    throw new Error(
      `Failed to get donors for campaign ${campaignId}: Unknown error`
    );
  }
}

// Prevent direct execution from terminal
if (import.meta.url === `file://${process.argv[1]}`) {
  console.error(
    "This module is not meant to be run directly from the terminal."
  );
  console.error(
    "Import and use the exported functions in your application instead."
  );
  process.exit(1);
}
