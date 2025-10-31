# How to Start the Blockchain Scheduler

The blockchain campaign synchronization scheduler is **automatically integrated** into your NestJS application. You don't need to start it separately!

## Quick Start

Simply start your backend application using any of these commands:

### Development Mode (Recommended)
```bash
npm run start:dev
```
This starts the app in watch mode with automatic reloading.

### Production Mode
```bash
npm run build
npm run start:prod
```

### Regular Start
```bash
npm run start
```

## What Happens When You Start

When you run the backend, you'll see logs like this:

```
[BlockchainService] Blockchain service initialized with contract: 0xA38cF6B5C5D47cF31aB5d0eA399EBb1132B0f5a3
[CampaignSyncScheduler] Running initial blockchain sync on startup...
[CampaignSyncScheduler] Starting campaign sync from blockchain...
[CampaignSyncScheduler] Current block number: 9509205
[CampaignSyncScheduler] Initial sync: fetching events from block 9509105
[BlockchainService] Fetching CampaignCreated events from block 9509105 to 9509205
[BlockchainService] Found 0 CampaignCreated events
[CampaignSyncScheduler] Campaign sync completed. Last synced block: 9509205
[NestApplication] Nest application successfully started
```

This confirms:
1. ✅ Scheduler initialized
2. ✅ Initial sync completed
3. ✅ Periodic sync scheduled (every 5 minutes)

## Automatic Behavior

### On Startup
- The scheduler runs **immediately** when the app starts
- Fetches events from the last 100 blocks
- Creates campaigns and users from blockchain data

### Every 5 Minutes
- The scheduler runs automatically
- Continues from the last synced block
- Only processes new events (no duplicates)

## Verify It's Running

### Check the Logs
Look for these log messages:
```
[CampaignSyncScheduler] Starting campaign sync from blockchain...
```

### Check the Database
Query campaigns that were synced from blockchain:
```bash
psql crowdfunding -c "SELECT id, \"onChainId\", \"creatorAddress\", goal FROM campaigns WHERE \"onChainId\" IS NOT NULL;"
```

## Testing the Scheduler

### Method 1: Watch the Logs
```bash
npm run start:dev
# Watch for sync messages every 5 minutes
```

### Method 2: Create a Campaign on Blockchain
1. Use the frontend to create a campaign
2. Wait up to 5 minutes
3. Check the database for the new campaign with `onChainId` populated

### Method 3: Manual Sync (Optional)
You can add an endpoint to trigger manual sync:

Edit `src/campaigns/campaigns.controller.ts`:
```typescript
import { CampaignSyncScheduler } from './campaign-sync.scheduler';

@Controller('campaigns')
export class CampaignsController {
  constructor(
    private readonly campaignsService: CampaignsService,
    private readonly campaignSyncScheduler: CampaignSyncScheduler, // Add this
  ) {}

  // Add this endpoint
  @Post('sync')
  async manualSync() {
    await this.campaignSyncScheduler.manualSync();
    return { message: 'Sync completed successfully' };
  }
}
```

Then trigger it:
```bash
curl -X POST http://localhost:3001/campaigns/sync
```

## Changing the Schedule

By default, the scheduler runs every 5 minutes. To change this:

Edit `src/campaigns/campaign-sync.scheduler.ts`:
```typescript
// Change from:
@Cron(CronExpression.EVERY_5_MINUTES)

// To one of these:
@Cron(CronExpression.EVERY_MINUTE)
@Cron(CronExpression.EVERY_10_MINUTES)
@Cron(CronExpression.EVERY_HOUR)

// Or use a custom cron expression:
@Cron('0 */2 * * * *')  // Every 2 minutes
```

## Troubleshooting

### Scheduler Not Running
**Check logs for errors:**
```bash
npm run start:dev 2>&1 | grep -i "campaign\|blockchain"
```

**Common issues:**
- Missing environment variables (CONTRACT_ADDRESS, RPC_URL)
- Database connection issues
- Invalid RPC URL

### No Events Found
This is normal if:
- No campaigns created on blockchain yet
- Looking at wrong block range
- Contract address is incorrect

**Solution:**
Create a test campaign via the frontend, then wait for next sync cycle.

### Duplicate Errors
If you see "duplicate key value violates unique constraint":
- This is expected behavior (prevents duplicate campaigns)
- The scheduler will skip already-synced campaigns

## Environment Variables Required

Make sure these are set in `.env`:
```bash
CONTRACT_ADDRESS=0xA38cF6B5C5D47cF31aB5d0eA399EBb1132B0f5a3
RPC_URL=https://sepolia.infura.io/v3/b652a129ff3e4018827f52f0eaa6dc77
```

## Summary

**You don't need to do anything special to start the scheduler!** Just run:
```bash
npm run start:dev
```

The scheduler will:
- ✅ Start automatically
- ✅ Run initial sync immediately
- ✅ Continue syncing every 5 minutes
- ✅ Process new campaigns from the blockchain
- ✅ Create users automatically
- ✅ Prevent duplicates

That's it! 🎉
