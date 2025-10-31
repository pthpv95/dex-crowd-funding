import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Campaign } from './campaign.entity';
import { SyncState } from './sync-state.entity';
import { CampaignsService } from './campaigns.service';
import { CampaignsController } from './campaigns.controller';
import { CampaignSyncScheduler } from './campaign-sync.scheduler';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Campaign, SyncState]), UsersModule],
  controllers: [CampaignsController],
  providers: [CampaignsService, CampaignSyncScheduler],
  exports: [CampaignsService],
})
export class CampaignsModule {}
