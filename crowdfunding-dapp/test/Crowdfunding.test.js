const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("CrowdfundingV1", function () {
  let crowdfunding;
  let owner, creator, donor1, donor2;

  beforeEach(async function () {
    [owner, creator, donor1, donor2] = await ethers.getSigners();

    const CrowdfundingV1 = await ethers.getContractFactory("CrowdfundingV1");
    crowdfunding = await upgrades.deployProxy(CrowdfundingV1, [], {
      initializer: "initialize",
      kind: "uups",
    });
    await crowdfunding.waitForDeployment();
  });

  describe("Campaign Creation", function () {
    it("Should create a campaign successfully", async function () {
      const goal = ethers.parseEther("10");
      const duration = 30;

      const tx = await crowdfunding
        .connect(creator)
        .createCampaign(goal, duration);
      await tx.wait();

      const campaign = await crowdfunding.getCampaign(0);
      expect(campaign.creator).to.equal(creator.address);
      expect(campaign.goal).to.equal(goal);
      expect(campaign.amountRaised).to.equal(0);
      expect(campaign.isActive).to.be.true;
    });

    it("Should fail with zero goal", async function () {
      await expect(
        crowdfunding.connect(creator).createCampaign(0, 30)
      ).to.be.revertedWith("Goal must be greater than 0");
    });

    it("Should fail with zero duration", async function () {
      await expect(
        crowdfunding.connect(creator).createCampaign(ethers.parseEther("10"), 0)
      ).to.be.revertedWith("Duration must be greater than 0");
    });
  });

  describe("Donations", function () {
    beforeEach(async function () {
      const goal = ethers.parseEther("10");
      await crowdfunding.connect(creator).createCampaign(goal, 30);
    });

    it("Should accept donations", async function () {
      const donationAmount = ethers.parseEther("5");

      await expect(
        crowdfunding.connect(donor1).donate(0, { value: donationAmount })
      )
        .to.emit(crowdfunding, "DonationReceived")
        .withArgs(0, donor1.address, donationAmount);

      const campaign = await crowdfunding.getCampaign(0);
      expect(campaign.amountRaised).to.equal(donationAmount);
    });

    it("Should track multiple donors", async function () {
      await crowdfunding
        .connect(donor1)
        .donate(0, { value: ethers.parseEther("3") });
      await crowdfunding
        .connect(donor2)
        .donate(0, { value: ethers.parseEther("2") });

      const donors = await crowdfunding.getDonors(0);
      expect(donors.length).to.equal(2);
      expect(donors).to.include(donor1.address);
      expect(donors).to.include(donor2.address);
    });

    it("Should fail when campaign has ended", async function () {
      await time.increase(31 * 24 * 60 * 60);

      await expect(
        crowdfunding
          .connect(donor1)
          .donate(0, { value: ethers.parseEther("1") })
      ).to.be.revertedWith("Campaign has ended");
    });
  });

  describe("Withdrawals", function () {
    beforeEach(async function () {
      const goal = ethers.parseEther("10");
      await crowdfunding.connect(creator).createCampaign(goal, 30);
      await crowdfunding
        .connect(donor1)
        .donate(0, { value: ethers.parseEther("10") });
    });

    it("Should allow creator to withdraw when goal is reached", async function () {
      await time.increase(31 * 24 * 60 * 60);

      const creatorBalanceBefore = await ethers.provider.getBalance(
        creator.address
      );

      const tx = await crowdfunding.connect(creator).withdrawFunds(0);
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const creatorBalanceAfter = await ethers.provider.getBalance(
        creator.address
      );

      expect(
        creatorBalanceAfter - creatorBalanceBefore + gasUsed
      ).to.be.closeTo(ethers.parseEther("10"), ethers.parseEther("0.01"));
    });

    it("Should fail if goal not reached", async function () {
      await crowdfunding
        .connect(creator)
        .createCampaign(ethers.parseEther("20"), 30);
      await crowdfunding
        .connect(donor1)
        .donate(1, { value: ethers.parseEther("5") });

      await time.increase(31 * 24 * 60 * 60);

      await expect(
        crowdfunding.connect(creator).withdrawFunds(1)
      ).to.be.revertedWith("Goal not reached");
    });

    it("Should fail if called by non-creator", async function () {
      await time.increase(31 * 24 * 60 * 60);

      await expect(
        crowdfunding.connect(donor1).withdrawFunds(0)
      ).to.be.revertedWith("Only campaign creator can call this");
    });
  });

  describe("Refunds", function () {
    beforeEach(async function () {
      const goal = ethers.parseEther("10");
      await crowdfunding.connect(creator).createCampaign(goal, 30);
      await crowdfunding
        .connect(donor1)
        .donate(0, { value: ethers.parseEther("5") });
    });

    it("Should allow refund when goal not reached", async function () {
      await time.increase(31 * 24 * 60 * 60);

      const donorBalanceBefore = await ethers.provider.getBalance(
        donor1.address
      );

      const tx = await crowdfunding.connect(donor1).refund(0);
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const donorBalanceAfter = await ethers.provider.getBalance(
        donor1.address
      );

      expect(donorBalanceAfter - donorBalanceBefore + gasUsed).to.be.closeTo(
        ethers.parseEther("5"),
        ethers.parseEther("0.01")
      );
    });

    it("Should fail if goal was reached", async function () {
      await crowdfunding
        .connect(donor2)
        .donate(0, { value: ethers.parseEther("5") });
      await time.increase(31 * 24 * 60 * 60);

      await expect(crowdfunding.connect(donor1).refund(0)).to.be.revertedWith(
        "Goal was reached"
      );
    });
  });
});
