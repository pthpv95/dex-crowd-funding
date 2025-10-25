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

test();
