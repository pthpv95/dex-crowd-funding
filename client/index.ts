import { createPublicClient, createWalletClient, http } from "viem";
import { sepolia } from "viem/chains";
import crowdfundingAbiJson from "./abis/crowdfunding.json";
import { privateKeyToAccount } from "viem/accounts";

// Contract configuration
const CONTRACT_ADDRESS = "0xA38cF6B5C5D47cF31aB5d0eA399EBb1132B0f5a3" as const;
const RPC_URL = "https://sepolia.infura.io/v3/b652a129ff3e4018827f52f0eaa6dc77";

// Contract ABI from JSON file
const CROWDFUNDING_ABI = crowdfundingAbiJson.abi;

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

    const result = (await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: CROWDFUNDING_ABI,
      functionName: "getCampaign",
      args: [BigInt(campaignId)],
    })) as [string, bigint, bigint, bigint, boolean, boolean, boolean];

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
    const count = (await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: CROWDFUNDING_ABI,
      functionName: "campaignCount",
    })) as bigint;
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

    const donors = (await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: CROWDFUNDING_ABI,
      functionName: "getAllDonors",
      args: [BigInt(campaignId)],
    })) as readonly string[];

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
/**
 * Create a new crowdfunding campaign
 * @param goal - Campaign goal amount in wei
 * @param durationInDays - Campaign duration in days
 * @param privateKey - Private key of the account creating the campaign (with 0x prefix)
 * @returns Promise<number> - The ID of the newly created campaign
 */
export async function createCampaign(
  goal: bigint,
  durationInDays: bigint
): Promise<number> {
  try {
    if (goal <= 0n) {
      throw new Error("Goal must be greater than 0");
    }
    if (durationInDays <= 0n) {
      throw new Error("Duration must be greater than 0");
    }

    if (!process.env.PRIVATE_KEY) {
      throw new Error("PRIVATE_KEY is not set");
    }

    // Create account from private key
    const account = privateKeyToAccount(
      process.env.PRIVATE_KEY! as `0x${string}`
    );

    // Create wallet client for writing transactions
    const walletClient = createWalletClient({
      account,
      chain: sepolia,
      transport: http(RPC_URL),
    });

    // Call createCampaign function
    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: CROWDFUNDING_ABI,
      functionName: "createCampaign",
      args: [goal, durationInDays],
    });

    console.log("Transaction hash:", hash);

    // Wait for transaction confirmation
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log("Transaction confirmed in block:", receipt.blockNumber);

    // Extract campaign ID from the CampaignCreated event
    const log = receipt.logs[0];
    if (log && log.topics[1]) {
      const campaignId = BigInt(log.topics[1]);
      return Number(campaignId);
    }

    throw new Error("Campaign ID not found in transaction logs");
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to create campaign: ${error.message}`);
    }
    throw new Error("Failed to create campaign: Unknown error");
  }
}
