import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';

const CROWDFUNDING_ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'campaignId',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'creator',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'goal',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'deadline',
        type: 'uint256',
      },
    ],
    name: 'CampaignCreated',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_campaignId',
        type: 'uint256',
      },
    ],
    name: 'getCampaign',
    outputs: [
      {
        internalType: 'address',
        name: 'creator',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'goal',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'deadline',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'amountRaised',
        type: 'uint256',
      },
      {
        internalType: 'bool',
        name: 'withdrawn',
        type: 'bool',
      },
      {
        internalType: 'bool',
        name: 'isActive',
        type: 'bool',
      },
      {
        internalType: 'bool',
        name: 'goalReached',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];

export interface CampaignCreatedEvent {
  campaignId: bigint;
  creator: string;
  goal: bigint;
  deadline: bigint;
  blockNumber: number;
  transactionHash: string;
}

export interface CampaignData {
  creator: string;
  goal: bigint;
  deadline: bigint;
  amountRaised: bigint;
  withdrawn: boolean;
  isActive: boolean;
  goalReached: boolean;
}

@Injectable()
export class BlockchainService {
  private readonly logger = new Logger(BlockchainService.name);
  private provider: ethers.JsonRpcProvider;
  private contract: ethers.Contract;
  private contractAddress: string;

  constructor(private configService: ConfigService) {
    const rpcUrl = this.configService.get<string>('RPC_URL');
    const contractAddress = this.configService.get<string>('CONTRACT_ADDRESS');

    if (!rpcUrl || !contractAddress) {
      throw new Error(
        'RPC_URL and CONTRACT_ADDRESS must be set in environment variables',
      );
    }

    this.contractAddress = contractAddress;

    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.contract = new ethers.Contract(
      this.contractAddress,
      CROWDFUNDING_ABI,
      this.provider,
    );

    this.logger.log(
      `Blockchain service initialized with contract: ${this.contractAddress}`,
    );
  }

  async getCampaignCreatedEvents(
    fromBlock: number = 0,
    toBlock: number | string = 'latest',
  ): Promise<CampaignCreatedEvent[]> {
    try {
      this.logger.log(
        `Fetching CampaignCreated events from block ${fromBlock} to ${toBlock}`,
      );

      const filter = this.contract.filters.CampaignCreated();
      const events = await this.contract.queryFilter(
        filter,
        fromBlock,
        toBlock,
      );

      const campaignEvents: CampaignCreatedEvent[] = events.map((event) => {
        const eventLog = event as ethers.EventLog;
        const [campaignId, creator, goal, deadline] = eventLog.args;
        return {
          campaignId: BigInt(campaignId.toString()),
          creator: creator,
          goal: BigInt(goal.toString()),
          deadline: BigInt(deadline.toString()),
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash,
        };
      });

      this.logger.log(`Found ${campaignEvents.length} CampaignCreated events`);
      return campaignEvents;
    } catch (error) {
      this.logger.error('Error fetching CampaignCreated events:', error);
      throw error;
    }
  }

  async getCampaignData(campaignId: number): Promise<CampaignData | null> {
    try {
      const result = await this.contract.getCampaign(campaignId);

      return {
        creator: result[0],
        goal: BigInt(result[1].toString()),
        deadline: BigInt(result[2].toString()),
        amountRaised: BigInt(result[3].toString()),
        withdrawn: result[4],
        isActive: result[5],
        goalReached: result[6],
      };
    } catch (error) {
      this.logger.error(
        `Error fetching campaign data for ID ${campaignId}:`,
        error,
      );
      return null;
    }
  }

  async getCurrentBlockNumber(): Promise<number> {
    return await this.provider.getBlockNumber();
  }

  /**
   * Calculate the approximate block number from N days ago
   * @param daysAgo Number of days to go back
   * @returns Estimated block number from daysAgo
   */
  async getBlockNumberFromDaysAgo(daysAgo: number): Promise<number> {
    try {
      const currentBlock = await this.provider.getBlockNumber();
      const currentBlockData = await this.provider.getBlock(currentBlock);

      if (!currentBlockData) {
        throw new Error('Unable to fetch current block data');
      }

      const currentTimestamp = currentBlockData.timestamp;
      const targetTimestamp = currentTimestamp - daysAgo * 24 * 60 * 60;

      // Binary search to find the block closest to the target timestamp
      let low = 0;
      let high = currentBlock;
      let closestBlock = 0;

      // Average block time on Ethereum is ~12 seconds, use this as initial estimate
      const averageBlockTime = 12;
      const estimatedBlocksAgo = Math.floor(
        (daysAgo * 24 * 60 * 60) / averageBlockTime,
      );
      let mid = Math.max(0, currentBlock - estimatedBlocksAgo);

      // Perform binary search with a limit on iterations
      const maxIterations = 20;
      let iterations = 0;

      while (low <= high && iterations < maxIterations) {
        iterations++;
        const midBlockData = await this.provider.getBlock(mid);

        if (!midBlockData) {
          break;
        }

        const midTimestamp = midBlockData.timestamp;

        if (Math.abs(midTimestamp - targetTimestamp) < 60) {
          // Within 1 minute tolerance
          closestBlock = mid;
          break;
        }

        if (midTimestamp > targetTimestamp) {
          high = mid - 1;
          closestBlock = mid;
          mid = Math.floor((low + high) / 2);
        } else {
          low = mid + 1;
          mid = Math.floor((low + high) / 2);
        }
      }

      this.logger.log(
        `Block number from ${daysAgo} days ago: ${closestBlock} (current: ${currentBlock})`,
      );
      return Math.max(0, closestBlock);
    } catch (error) {
      this.logger.error(
        `Error calculating block number from ${daysAgo} days ago:`,
        error,
      );
      // Fallback: use rough estimate based on average block time
      const currentBlock = await this.provider.getBlockNumber();
      const averageBlockTime = 12; // seconds
      const estimatedBlocksAgo = Math.floor(
        (daysAgo * 24 * 60 * 60) / averageBlockTime,
      );
      return Math.max(0, currentBlock - estimatedBlocksAgo);
    }
  }
}
