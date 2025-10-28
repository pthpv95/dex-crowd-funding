import { DataSource } from 'typeorm';
import { User } from '../users/user.entity';
import { Campaign } from '../campaigns/campaign.entity';
import * as dotenv from 'dotenv';
import { parseEther } from 'ethers';

// Load environment variables
dotenv.config();

// Sample wallet addresses (you can replace these with real addresses if needed)
const SAMPLE_WALLETS = [
  '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  '0x5B38Da6a701c568545dCfcB03FcB875f56beddC4',
  '0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2',
  '0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db',
];

// Sample campaign data
const SAMPLE_CAMPAIGNS = [
  {
    description: 'Help Build a Community Center in Rural Kenya',
    goalEth: '10',
    daysFromNow: 45,
    isGoalReached: false,
  },
  {
    description: 'Emergency Medical Fund for Cancer Treatment',
    goalEth: '25',
    daysFromNow: 30,
    isGoalReached: false,
  },
  {
    description: 'Support Local Animal Shelter Renovation',
    goalEth: '5',
    daysFromNow: 60,
    isGoalReached: true,
  },
  {
    description: 'Fund Educational Programs for Underprivileged Children',
    goalEth: '15',
    daysFromNow: 20,
    isGoalReached: false,
  },
  {
    description: 'Rebuild Homes After Natural Disaster',
    goalEth: '50',
    daysFromNow: 90,
    isGoalReached: false,
  },
  {
    description: 'Clean Water Project for Village in Ethiopia',
    goalEth: '20',
    daysFromNow: 75,
    isGoalReached: false,
  },
  {
    description: 'Support Independent Film Production',
    goalEth: '8',
    daysFromNow: 40,
    isGoalReached: false,
  },
  {
    description: 'Launch Sustainable Agriculture Initiative',
    goalEth: '12',
    daysFromNow: 55,
    isGoalReached: false,
  },
];

async function seed() {
  // Create data source
  const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'crowdfunding',
    entities: [User, Campaign],
    synchronize: false,
  });

  try {
    console.log('Connecting to database...');
    await AppDataSource.initialize();
    console.log('Connected to database successfully!');

    const userRepository = AppDataSource.getRepository(User);
    const campaignRepository = AppDataSource.getRepository(Campaign);

    // Create users if they don't exist
    console.log('\nCreating/Finding users...');
    const users: User[] = [];

    for (const walletAddress of SAMPLE_WALLETS) {
      let user = await userRepository.findOne({ where: { walletAddress } });

      if (!user) {
        user = userRepository.create({ walletAddress });
        user = await userRepository.save(user);
        console.log(`✓ Created user: ${walletAddress}`);
      } else {
        console.log(`✓ Found existing user: ${walletAddress}`);
      }

      users.push(user);
    }

    // Create campaigns
    console.log('\nCreating campaigns...');
    let createdCount = 0;

    for (let i = 0; i < SAMPLE_CAMPAIGNS.length; i++) {
      const campaignData = SAMPLE_CAMPAIGNS[i];
      const creator = users[i % users.length]; // Distribute campaigns among users

      // Calculate deadline
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + campaignData.daysFromNow);

      // Convert ETH to wei using ethers
      const goalInWei = parseEther(campaignData.goalEth).toString();

      // Check if similar campaign already exists
      const existingCampaign = await campaignRepository.findOne({
        where: {
          description: campaignData.description,
          creatorId: creator.id,
        },
      });

      if (!existingCampaign) {
        const campaign = campaignRepository.create({
          creatorId: creator.id,
          description: campaignData.description,
          goal: goalInWei,
          deadline,
          isGoalReached: campaignData.isGoalReached,
          isActive: true,
          isWithdrawn: false,
        });

        await campaignRepository.save(campaign);
        createdCount++;
        console.log(`✓ Created: "${campaignData.description}" (Goal: ${campaignData.goalEth} ETH, Deadline: ${campaignData.daysFromNow} days)`);
      } else {
        console.log(`⊘ Skipped: "${campaignData.description}" (already exists)`);
      }
    }

    console.log(`\n✅ Seeding completed! Created ${createdCount} campaigns.`);

    // Show summary
    const totalCampaigns = await campaignRepository.count();
    const totalUsers = await userRepository.count();
    console.log(`\nDatabase Summary:`);
    console.log(`- Total Users: ${totalUsers}`);
    console.log(`- Total Campaigns: ${totalCampaigns}`);

    await AppDataSource.destroy();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seed();
