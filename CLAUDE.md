# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a decentralized crowdfunding platform built on EVM chains. The project consists of:
- **Smart contracts** (Solidity) with UUPS upgradeable proxy pattern
- **NestJS backend** with wallet-based authentication
- **TanStack Start frontend** (React + Vite) with wagmi/viem for blockchain interaction
- **TypeScript client SDK** for contract interactions

## Repository Structure

```
/crowdfunding-dapp/     # Smart contract development (Hardhat)
/be/                    # NestJS backend server
/client-app/            # TanStack Start frontend application
/client/                # TypeScript SDK for contract interaction
```

## Common Development Commands

### Smart Contracts (crowdfunding-dapp/)
```bash
cd crowdfunding-dapp
npm test                    # Run contract tests
npm run compile             # Compile Solidity contracts
npm run deploy              # Deploy proxy contract
npm run upgrade             # Upgrade to new implementation
npm run node                # Start local Hardhat node
npx hardhat test           # Alternative test command
```
```
CONTRACT_ADDRESS = "0xA38cF6B5C5D47cF31aB5d0eA399EBb1132B0f5a3"
RPC_URL = "https://sepolia.infura.io/v3/b652a129ff3e4018827f52f0eaa6dc77";
```

### Backend (be/)
```bash
cd be
npm run start:dev          # Start in watch mode
npm run start:prod         # Production mode
npm run build              # Build for production
npm test                   # Run Jest tests
npm run test:e2e          # End-to-end tests
npm run test:cov          # Test with coverage
npm run lint              # Lint TypeScript files
npm run format            # Format with Prettier
```

### Frontend (client-app/)
```bash
cd client-app
npm run dev               # Dev server on port 3000
npm run build             # Production build
npm run serve             # Preview production build
npm test                  # Run Vitest tests
npm run check             # Lint + format check (Biome)
npm run lint              # Lint only
npm run format            # Format only
```

### Root Level
```bash
npm run build             # Build TypeScript to dist/
npm run start:fe          # Start frontend dev server
npm run dev               # Build and run root-level code
```

### Client SDK (client/)
```bash
cd client
npm run example           # Run example.ts with Bun
```

## Architecture & Key Patterns

### Smart Contract Architecture

**UUPS Upgradeable Pattern:**
- `CrowdfundingV1.sol` is the base implementation with core crowdfunding logic
- `CrowdfundingV2.sol` extends V1 and adds platform fee functionality
- Uses OpenZeppelin's `UUPSUpgradeable`, `OwnableUpgradeable`, `ReentrancyGuardUpgradeable`
- Proxy contract deployed via `@openzeppelin/hardhat-upgrades`

**Contract Features:**
- Create campaigns with goal and deadline
- Donate to active campaigns
- Withdraw funds if goal reached (creator only)
- Refund donations if goal not reached
- All monetary operations are protected with reentrancy guard

**Key Contract Methods:**
- `createCampaign(goal, durationInDays)` → returns campaignId
- `donate(campaignId)` payable
- `withdrawFunds(campaignId)` - creator withdraws if goal reached
- `refund(campaignId)` - donors get refund if goal not reached
- `getCampaign(campaignId)` - returns campaign data

**Deployment & Upgrades:**
- Deploy script: `crowdfunding-dapp/scripts/deploy.js`
- Upgrade script: `crowdfunding-dapp/scripts/upgrade.js`
- Deployed on Sepolia testnet
- Contract address stored in `client-app/src/config/contract.ts`

### Backend Architecture (NestJS)

**Wallet-Based Authentication:**
- Users authenticate by signing a message with their wallet
- No passwords - wallet signature verification using `ethers.verifyMessage()`
- JWT tokens issued after successful signature verification
- Message format: "Welcome to CrowdFund!\n\nPlease sign this message...\n\nWallet: {address}\nTimestamp: {timestamp}"

**Module Structure:**
- `AuthModule` - Wallet signature verification, JWT generation
- `UsersModule` - User entity (walletAddress, timestamps)
- PostgreSQL database via TypeORM
- Entities auto-sync in development mode

**Key Files:**
- `be/src/auth/auth.service.ts` - Signature verification logic
- `be/src/auth/auth.controller.ts` - Login endpoint
- `be/src/users/user.entity.ts` - User database schema
- `be/src/app.module.ts` - Root module configuration

**Environment Variables (be/.env):**
- `PORT`, `NODE_ENV`
- `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`
- `JWT_SECRET`, `JWT_EXPIRES_IN`
- `CORS_ORIGIN`

### Frontend Architecture (TanStack Start)

**Tech Stack:**
- TanStack Router + TanStack Query for data fetching/caching
- SSR support with `@tanstack/react-start`
- Wagmi + Viem for Ethereum interaction
- Tailwind CSS v4 (via `@tailwindcss/vite`)
- Biome for linting/formatting

**Key Configuration:**
- Wagmi config: `client-app/src/config/viem.ts` - supports mainnet & Sepolia
- Contract config: `client-app/src/config/contract.ts` - contract address
- Contract ABIs: `client-app/src/config/abis.ts`
- Router setup: `client-app/src/router.tsx` - integrates TanStack Router + Query

**Routes:**
- `/` - Landing page (index.tsx)
- `/create` - Create new campaign
- `/campaign/$id` - View campaign details
- `/home/*` - Additional home routes
- `/demo/*` - Demo pages

**Environment Variables (client-app/.env):**
- `VITE_API_URL` - Backend API URL (default: http://localhost:3000)

### Client SDK (client/)

**Purpose:** Standalone TypeScript SDK for programmatic contract interaction

**Key Functions (client/index.ts):**
- `getCampaign(campaignId)` - Fetch campaign data
- `createCampaign(privateKey, goal, duration)` - Create new campaign
- `donateToCampaign(privateKey, campaignId, amount)` - Make donation
- `withdrawFunds(privateKey, campaignId)` - Withdraw if goal reached
- `getAllCampaigns()` - Fetch all campaigns from events
- `listenToCampaignEvents()` - Subscribe to real-time events

**Configuration:**
- Uses viem (not ethers) for blockchain interaction
- Hardcoded Sepolia RPC URL and contract address
- ABI loaded from `client/abis/crowdfunding.json`

## Testing

### Contract Tests
- Located in `crowdfunding-dapp/test/Crowdfunding.test.js`
- Test campaign creation, donations, withdrawals, refunds
- Uses Hardhat testing framework with ethers

### Backend Tests
- Jest configuration in `be/package.json`
- Test files: `src/**/*.spec.ts`
- Coverage output: `be/coverage/`

### Frontend Tests
- Vitest configuration
- Uses `@testing-library/react` and `@testing-library/dom`
- Test environment: jsdom

## Blockchain Interaction Patterns

**Frontend (wagmi/viem):**
- Use hooks from wagmi for wallet connection
- Contract reads via `useReadContract`
- Contract writes via `useWriteContract`
- ABIs imported from `src/config/abis.ts`

**Client SDK (viem):**
- Create `publicClient` for reads
- Create `walletClient` with private key for writes
- Use contract methods: `publicClient.readContract()`, `walletClient.writeContract()`

**Common Pattern:**
```typescript
// Reading
const campaign = await publicClient.readContract({
  address: CONTRACT_ADDRESS,
  abi: CROWDFUNDING_ABI,
  functionName: 'getCampaign',
  args: [campaignId]
})

// Writing
const hash = await walletClient.writeContract({
  address: CONTRACT_ADDRESS,
  abi: CROWDFUNDING_ABI,
  functionName: 'donate',
  args: [campaignId],
  value: parseEther(amount)
})
```

## Environment Setup

**Required for Smart Contracts:**
- Create `crowdfunding-dapp/.env`:
  - `SEPOLIA_RPC_URL` - Infura/Alchemy RPC endpoint
  - `PRIVATE_KEY` - Deployer wallet private key
  - `ETHERSCAN_API_KEY` - For contract verification
  - Optional: `POLYGONSCAN_API_KEY`, `BSCSCAN_API_KEY`

**Required for Backend:**
- PostgreSQL database running
- Copy `be/.env.example` to `be/.env` and configure

**Required for Frontend:**
- Copy `client-app/.env.example` to `client-app/.env`
- Set `VITE_API_URL` to backend URL

## Important Notes

- **Contract Address:** After deploying, update address in both:
  - `client-app/src/config/contract.ts`
  - `client/index.ts` (if using SDK)

- **ABI Updates:** After contract changes:
  1. Compile contracts: `cd crowdfunding-dapp && npm run compile`
  2. Copy ABI from `crowdfunding-dapp/artifacts/contracts/.../*.json`
  3. Update `client-app/src/config/abis.ts` and `client/abis/crowdfunding.json`

- **Authentication Flow:**
  1. Frontend requests user to sign message with MetaMask
  2. Frontend sends `{ walletAddress, signature, message }` to backend
  3. Backend verifies signature using ethers.verifyMessage()
  4. Backend creates/finds user and returns JWT token
  5. Frontend stores JWT and includes in subsequent requests

- **Upgrade Process:**
  1. Create new implementation contract (e.g., CrowdfundingV3.sol)
  2. Run upgrade script: `cd crowdfunding-dapp && npm run upgrade`
  3. Proxy address stays the same, implementation address changes
  4. Update ABIs if interface changed

## Common Issues

**"Campaign does not exist" error:**
- Check contract address is correct in config files
- Verify you're on correct network (Sepolia)
- Campaign creator address should not be zero address

**Signature verification fails:**
- Ensure message format matches exactly between frontend and backend
- Check wallet address is lowercase normalized
- Verify timestamp is recent (implement expiry check if needed)

**Contract upgrade fails:**
- Ensure new contract inherits from previous version
- Storage layout must be append-only (no reordering existing variables)
- Use `reinitializer(n)` for new version initialization

**Frontend can't connect to backend:**
- Check CORS_ORIGIN in backend .env matches frontend URL
- Verify backend is running on correct port
- Check VITE_API_URL in frontend .env
