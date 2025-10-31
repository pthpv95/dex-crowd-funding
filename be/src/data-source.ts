import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { User } from './users/user.entity';
import { Campaign } from './campaigns/campaign.entity';
import { SyncState } from './campaigns/sync-state.entity';

// Load environment variables
config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'crowdfunding',
  entities: [User, Campaign, SyncState],
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
  synchronize: false, // Always false for migrations
  logging: process.env.NODE_ENV === 'development',
});
