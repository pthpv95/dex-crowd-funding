# Decentralized Crowdfunding UI - Implementation Guide

## Overview
A complete GoFundMe-like UI implementation for the decentralized crowdfunding platform, built with React, TanStack Router, Wagmi, and Tailwind CSS.

## Features Implemented

### 1. **Home Page** (`/`)
- Hero section with call-to-action
- Grid layout of all active campaigns
- Campaign cards with:
  - Visual progress bars
  - Funding stats (raised/goal)
  - Time remaining countdown
  - Status badges (Goal Reached, Expired, Active, etc.)
- Responsive design (mobile, tablet, desktop)
- Wallet connection prompts

### 2. **Campaign Details Page** (`/campaign/:id`)
- Full campaign information display
- Real-time funding progress
- Donation form with:
  - Custom amount input
  - Quick donation buttons (0.01, 0.05, 0.1, 0.5 ETH)
  - Transaction status feedback
- Donor list showing all supporters
- Campaign statistics
- Status indicators

### 3. **Create Campaign Page** (`/create`)
- Form to create new campaigns
- Fields:
  - Goal amount (ETH)
  - Duration (days)
- Quick select buttons for common values
- Wallet connection requirement
- How it works section
- Real-time validation
- Success/error feedback

### 4. **Header Component**
- Sticky navigation bar
- Logo and branding
- Wallet connection status
- Connect/Disconnect buttons
- Navigation links (Browse, Create)
- Responsive mobile menu

## Custom Hooks Created

### `useGetCampaign(id: number)`
- Fetches campaign data by ID
- Returns formatted data with proper types
- Auto-formats ETH amounts and dates

### `useGetCampaignCount()`
- Returns total number of campaigns
- Used for pagination and display

### `useDonate()`
- Handles donation transactions
- Accepts campaign ID and amount
- Returns transaction hash

### `useGetDonors(campaignId: number)`
- Fetches all donors for a campaign
- Returns array of donor addresses

### `useCreateCampaign()`
- Creates new campaigns
- Handles wallet interaction
- Returns campaign ID

## Components

### `CampaignCard`
- Reusable card component
- Displays campaign summary
- Links to detail page
- Shows progress and status

### `Header`
- Global navigation
- Wallet connection UI
- Responsive design

## Styling

- **Color Scheme**: Green and blue gradient (professional, trustworthy)
- **Design System**: Clean, modern, card-based layout
- **Typography**: Clear hierarchy with bold headings
- **Interactive Elements**: Hover effects, transitions, loading states
- **Responsive**: Mobile-first approach with breakpoints

## Pages Structure

```
/                      → Home page (list all campaigns)
/campaign/:id          → Campaign details with donation form
/create                → Create new campaign
```

## Key Features

✅ **Wallet Integration**: Full Wagmi integration for wallet connection
✅ **Real-time Updates**: Campaign data updates after donations
✅ **Error Handling**: User-friendly error messages
✅ **Loading States**: Skeleton loaders and pending states
✅ **Responsive Design**: Works on all screen sizes
✅ **Status Badges**: Visual indicators for campaign status
✅ **Progress Tracking**: Visual progress bars
✅ **Donor Recognition**: List of all campaign supporters

## User Flow

1. **User visits home page**
   - Sees all active campaigns
   - Can connect wallet
   - Browse campaigns

2. **Click on campaign**
   - View full details
   - See donors list
   - Connect wallet to donate
   - Enter donation amount
   - Confirm transaction

3. **Create campaign**
   - Connect wallet (required)
   - Fill in goal and duration
   - Submit transaction
   - Redirected to home page

## Technology Stack

- **React**: UI framework
- **TanStack Router**: Routing and navigation
- **Wagmi**: Ethereum wallet interaction
- **Viem**: Ethereum utilities
- **Tailwind CSS**: Styling
- **TypeScript**: Type safety

## Next Steps (Optional Enhancements)

- Add campaign images/media upload
- Implement campaign search and filtering
- Add campaign categories
- Social sharing features
- Campaign updates/blog posts
- Withdraw funds functionality for creators
- Refund functionality for donors
- Campaign edit functionality
- Analytics dashboard for creators

## Running the Application

```bash
cd client-app
npm install
npm run dev
```

The application will be available at `http://localhost:3000`

## Notes

- All ETH amounts are formatted using `formatEther` for display
- Dates are formatted as ISO strings for consistency
- Campaign IDs start from 0 (matching smart contract)
- Gradients use `bg-linear-to-*` classes (Biome recommended)

