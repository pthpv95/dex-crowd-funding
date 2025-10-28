import { Controller, Get, Param } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { Campaign } from './campaign.entity';

@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Get()
  async findAllActive(): Promise<Campaign[]> {
    return this.campaignsService.findAllActive();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Campaign | null> {
    return this.campaignsService.findOne(id);
  }
}
