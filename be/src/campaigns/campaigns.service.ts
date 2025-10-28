import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Campaign } from './campaign.entity';

@Injectable()
export class CampaignsService {
  constructor(
    @InjectRepository(Campaign)
    private campaignsRepository: Repository<Campaign>,
  ) {}

  async findAllActive(): Promise<Campaign[]> {
    const now = new Date();

    return this.campaignsRepository.find({
      where: {
        isWithdrawn: false,
        deadline: MoreThan(now),
      },
      relations: ['creator'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<Campaign | null> {
    return this.campaignsRepository.findOne({
      where: { id },
      relations: ['creator'],
    });
  }

  async create(campaignData: Partial<Campaign>): Promise<Campaign> {
    const campaign = this.campaignsRepository.create(campaignData);
    return this.campaignsRepository.save(campaign);
  }

  async update(
    id: string,
    updateData: Partial<Campaign>,
  ): Promise<Campaign | null> {
    await this.campaignsRepository.update(id, updateData);
    return this.findOne(id);
  }
}
