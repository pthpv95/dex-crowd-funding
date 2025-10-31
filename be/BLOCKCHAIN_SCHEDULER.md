# Blockchain Campaign Synchronization

This document describes the automated blockchain synchronization scheduler that fetches campaign events from the smart contract and stores them in the database.

## Overview

The scheduler automatically syncs campaign data from the blockchain to the database by:
1. Listening to `CampaignCreated` events from the smart contract
2. Creating database records for new campaigns
3. Associating campaigns with users (creating users if needed)
4. Running periodically to keep data in sync

## Components

### 1. BlockchainService (`src/campaigns/blockchain.service.ts`)
- Connects to Ethereum RPC provider
- Queries smart contract events
- Fetches campaign data from the blockchain

**Key Methods:**
- `getCampaignCreatedEvents(fromBlock, toBlock)` - Fetch all CampaignCreated events
- `getCampaignData(campaignId)` - Get current state of a campaign
- `getCurrentBlockNumber()` - Get latest blockchain block number

### 2. CampaignSyncScheduler (`src/campaigns/campaign-sync.scheduler.ts`)
- Runs automatically on app startup and every 5 minutes
- Processes campaign events and stores in database
- Tracks last synced block to avoid duplicates
- Creates users automatically for campaign creators

**Key Features:**
- Initial sync fetches last 100 blocks on startup
- Incremental sync continues from last synced block
- Automatic user creation for new wallet addresses
- Duplicate prevention using `onChainId` unique constraint

### 3. Campaign Entity Updates
New fields added to support blockchain data:
- `creatorAddress` (varchar) - Wallet address of campaign creator
- `onChainId` (varchar, unique) - Campaign ID from blockchain
- `amountRaised` (decimal) - Total amount raised in wei
- `creatorId` nullable - Allows campaigns from blockchain without immediate user link

## Configuration

Required environment variables in `.env`:
```bash
CONTRACT_ADDRESS=0xA38cF6B5C5D47cF31aB5d0eA399EBb1132B0f5a3
RPC_URL=https://sepolia.infura.io/v3/b652a129ff3e4018827f52f0eaa6dc77
```

## Schedule

- **Initial Sync**: Runs immediately on application startup
- **Periodic Sync**: Every 5 minutes (configurable via `@Cron` decorator)

To change the schedule, modify the `@Cron` decorator in `campaign-sync.scheduler.ts`:
```typescript
@Cron(CronExpression.EVERY_5_MINUTES)  // Change this
async syncCampaigns() { ... }
```

Available options:
- `CronExpression.EVERY_MINUTE`
- `CronExpression.EVERY_5_MINUTES`
- `CronExpression.EVERY_10_MINUTES`
- `CronExpression.EVERY_HOUR`
- Custom cron: `@Cron('0 */5 * * * *')`

## Data Flow

1. **Blockchain Event Occurs**
   - User creates campaign on smart contract
   - `CampaignCreated` event emitted with: campaignId, creator, goal, deadline

2. **Scheduler Detects Event**
   - Queries blockchain for new events since last sync
   - Processes each event sequentially

3. **User Lookup/Creation**
   - Checks if user exists with creator wallet address
   - Creates new user if not found

4. **Campaign Creation**
   - Checks if campaign already exists (by onChainId)
   - Creates new campaign record with blockchain data
   - Links to user via creatorId

5. **Block Tracking**
   - Updates lastSyncedBlock to current block
   - Next sync continues from this point

## Manual Sync

To manually trigger a sync (useful for testing or after missed events):

1. Add an endpoint to campaigns controller:
```typescript
@Post('sync')
async manualSync() {
  await this.campaignSyncScheduler.manualSync();
  return { message: 'Sync completed' };
}
```

2. Call via API:
```bash
curl -X POST http://localhost:3001/campaigns/sync
```

## Database Migration

Run the generated migration to update the database schema:
```bash
npm run migration:run
```

This adds:
- `creatorAddress` column to campaigns table
- `amountRaised` column to campaigns table
- Makes `onChainId` unique
- Makes `creatorId` nullable
- Makes `description` nullable

## Logging

The scheduler logs important events:
- Sync start/completion
- Number of events found
- Campaign creation
- User creation
- Errors during processing

View logs in the console when running the app:
```bash
npm run start:dev
```

## Error Handling

The scheduler gracefully handles errors:
- Failed event processing doesn't stop other events
- Network errors are logged but don't crash the app
- Missing environment variables throw error on startup
- Invalid campaign data is logged and skipped

## Testing

To test the scheduler:

1. Start the backend:
```bash
npm run start:dev
```

2. Watch for initial sync in logs:
```
[CampaignSyncScheduler] Running initial blockchain sync on startup...
[CampaignSyncScheduler] Starting campaign sync from blockchain...
```

3. Create a campaign on the blockchain (via frontend or script)

4. Wait for next sync cycle (max 5 minutes) or trigger manual sync

5. Check database for new campaign:
```bash
psql crowdfunding -c "SELECT * FROM campaigns WHERE \"onChainId\" IS NOT NULL;"
```

## Troubleshooting

**No events found:**
- Check CONTRACT_ADDRESS is correct
- Verify RPC_URL is accessible
- Confirm campaigns exist on blockchain
- Check block range (may need to increase from 100)

**Duplicate key error:**
- Campaign already exists in database
- This is expected behavior, will be skipped

**User creation fails:**
- Check database connection
- Verify User entity is properly configured

**Scheduler not running:**
- Verify ScheduleModule imported in AppModule
- Check CampaignSyncScheduler is in providers array
- Look for initialization errors in startup logs
