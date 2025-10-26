import { formatEther, parseEther, parseGwei, parseUnits } from "viem";
import {
  getCampaign,
  getCampaignCount,
  getAllDonors,
  createCampaign,
} from "./index.js";

async function example() {
  try {
    // Get total campaign count
    const count = await getCampaignCount();
    console.log(`Total campaigns: ${count}`);

    // Get campaign data for campaign ID 0
    if (count > 0) {
      const campaign = await getCampaign(0);
      console.log("Campaign 0 data:", {
        creator: campaign.creator,
        goal: campaign.goal.toString(),
        deadline: new Date(Number(campaign.deadline) * 1000).toISOString(),
        amountRaised: campaign.amountRaised.toString(),
        withdrawn: campaign.withdrawn,
        isActive: campaign.isActive,
        goalReached: campaign.goalReached,
      });

      // Get donors for campaign 0
      const donors = await getAllDonors(0);
      console.log(`Donors for campaign 0: ${donors.length} donors`);
      console.log("Donor addresses:", donors);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

// example();

async function test() {
  const campaignId = await createCampaign(
    BigInt(1000000000000000000), // 1 ETH
    BigInt(10) // 10 days
  );
  console.log("Campaign created with ID:", campaignId);
  const campaign = await getCampaign(campaignId);
  console.log("Campaign data:", {
    creator: campaign.creator,
    goal: campaign.goal.toString(),
    deadline: new Date(Number(campaign.deadline) * 1000).toISOString(),
    amountRaised: campaign.amountRaised.toString(),
    withdrawn: campaign.withdrawn,
  });
}

// test();

// example();

async function getCampaignById(campaignId: number) {
  const campaign = await getCampaign(campaignId);
  // console.log("Campaign data:", campaign);
  const goal = formatEther(campaign.goal);
  console.log("Goal:", goal);
  const deadline = new Date(Number(campaign.deadline) * 1000).toISOString();
  console.log("Deadline:", deadline);
  const amountRaised = parseGwei(campaign.amountRaised.toString());
  console.log("Amount raised:", amountRaised);
  const withdrawn = campaign.withdrawn;
  console.log("Withdrawn:", withdrawn);
  const isActive = campaign.isActive;
  console.log("Is active:", isActive);
  const goalReached = campaign.goalReached;
  console.log("Goal reached:", goalReached);
}

getCampaignById(0);
