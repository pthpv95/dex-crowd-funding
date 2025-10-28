export interface CampaignResponse {
  id: string;
  creatorId: string;
  creator: {
    id: string;
    walletAddress: string;
  };
  description: string;
  goal: string; // wei as string
  deadline: string; // ISO date string
  isWithdrawn: boolean;
  isActive: boolean;
  isGoalReached: boolean;
  onChainId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignDataContract {
  creator: string;
  goal: string;
  deadline: string;
  amountRaised: string;
  withdrawn: boolean;
  isActive: boolean;
  goalReached: boolean;
}
