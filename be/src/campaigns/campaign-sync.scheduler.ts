import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Campaign } from './campaign.entity';
import { SyncState } from './sync-state.entity';
import { BlockchainService } from '../common';
import { UsersService } from '../users/users.service';

@Injectable()
export class CampaignSyncScheduler {
  private readonly logger = new Logger(CampaignSyncScheduler.name);
  private readonly SYNC_KEY = 'campaign_sync';
  private readonly LOOKBACK_DAYS = 3; // Always fetch events from at least 3 days ago

  constructor(
    @InjectRepository(Campaign)
    private campaignsRepository: Repository<Campaign>,
    @InjectRepository(SyncState)
    private syncStateRepository: Repository<SyncState>,
    private blockchainService: BlockchainService,
    private usersService: UsersService,
  ) {}

  async onModuleInit() {
    // Run initial sync on startup
    this.logger.log('Running initial blockchain sync on startup...');
    await this.syncCampaigns();
  }

  // Run every 5 minutes
  @Cron(CronExpression.EVERY_5_MINUTES)
  async syncCampaigns() {
    try {
      this.logger.log('Starting campaign sync from blockchain...');

      const currentBlock = await this.blockchainService.getCurrentBlockNumber();
      this.logger.log(`Current block number: ${currentBlock}`);

      // Get last synced block from database
      let syncState = await this.syncStateRepository.findOne({
        where: { key: this.SYNC_KEY },
      });

      // Calculate minimum block number (3 days ago)
      const minBlockNumber =
        await this.blockchainService.getBlockNumberFromDaysAgo(
          this.LOOKBACK_DAYS,
        );

      // Determine starting block
      let fromBlock: number;
      if (!syncState) {
        // First sync: start from 3 days ago
        fromBlock = minBlockNumber;
        this.logger.log(
          `Initial sync: fetching events from block ${fromBlock} (${this.LOOKBACK_DAYS} days ago)`,
        );
      } else {
        // Use the earlier of: last synced block or minimum lookback block
        const lastSyncedBlock = parseInt(syncState.lastSyncedBlock, 10);
        fromBlock = Math.min(lastSyncedBlock + 1, minBlockNumber);
        this.logger.log(
          `Incremental sync: fetching events from block ${fromBlock} (last synced: ${lastSyncedBlock}, min: ${minBlockNumber})`,
        );
      }

      // Fetch campaign created events
      const events = await this.blockchainService.getCampaignCreatedEvents(
        fromBlock,
        currentBlock,
      );

      this.logger.log(`Processing ${events.length} campaign events...`);

      for (const event of events) {
        await this.processCampaignEvent(event);
      }

      // Update or create sync state in database
      if (!syncState) {
        syncState = this.syncStateRepository.create({
          key: this.SYNC_KEY,
          lastSyncedBlock: currentBlock.toString(),
        });
      } else {
        syncState.lastSyncedBlock = currentBlock.toString();
      }

      await this.syncStateRepository.save(syncState);

      this.logger.log(
        `Campaign sync completed. Last synced block: ${currentBlock}`,
      );
    } catch (error) {
      this.logger.error('Error syncing campaigns from blockchain:', error);
    }
  }

  private formatDate(date: number) {
    try {
      const dateString = new Date(date).toISOString().split('T')[0];
      // check invalid date
      if (isNaN(new Date(dateString).getTime())) {
        return 'Invalid Date';
      }
      return dateString;
    } catch {
      return 'Invalid Date';
    }
  }

  private async processCampaignEvent(event: any) {
    console.log(
      '🚀 ~ CampaignSyncScheduler ~ processCampaignEvent ~ event:',
      event,
    );
    try {
      const campaignId = event.campaignId.toString();

      // Check if campaign already exists
      const existingCampaign = await this.campaignsRepository.findOne({
        where: { onChainId: campaignId },
      });

      if (existingCampaign) {
        this.logger.debug(`Campaign ${campaignId} already exists, skipping...`);
        return;
      }

      // Find or create user by wallet address
      const user = await this.usersService.findOrCreate(event.creator);
      this.logger.log(
        `Using user ${user.id} for wallet address: ${event.creator}`,
      );

      // Convert deadline from Unix timestamp to Date
      const deadlineDate = this.formatDate(Number(event.deadline) * 1000);
      console.log(
        '🚀 ~ CampaignSyncScheduler ~ processCampaignEvent ~ deadlineDate:',
        deadlineDate,
      );

      // Create new campaign
      const campaign = this.campaignsRepository.create({
        onChainId: campaignId,
        creatorId: user.id,
        creatorAddress: event.creator,
        goal: event.goal.toString(),
        deadline: new Date(),
        amountRaised: '0',
        isWithdrawn: false,
        isActive: true,
        isGoalReached: false,
        description: `Campaign #${campaignId}`, // Default description
      });

      await this.campaignsRepository.save(campaign);

      this.logger.log(
        `Successfully synced campaign ${campaignId} from blockchain`,
      );
    } catch (error) {
      this.logger.error(
        `Error processing campaign event for ID ${event.campaignId}:`,
        error,
      );
    }
  }

  // Manual trigger for syncing campaigns (can be called via API endpoint)
  async manualSync() {
    this.logger.log('Manual sync triggered');
    await this.syncCampaigns();
  }
}
