import { Controller, Get, Param, Post } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { Campaign } from './campaign.entity';
import { CampaignSyncScheduler } from './campaign-sync.scheduler';

@Controller('campaigns')
export class CampaignsController {
  constructor(
    private readonly campaignsService: CampaignsService,
    private readonly campaignSyncScheduler: CampaignSyncScheduler,
  ) {}

  @Get()
  async findAllActive(): Promise<Campaign[]> {
    return this.campaignsService.findAllActive();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Campaign | null> {
    return this.campaignsService.findOne(id);
  }

  @Post('sync')
  async manualSync() {
    await this.campaignSyncScheduler.manualSync();
    return { message: 'Sync completed successfully' };
  }
}
