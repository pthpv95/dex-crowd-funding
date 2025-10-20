import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { network } from "hardhat";

describe("Crowdfunding", async function () {
  const { viem } = await network.connect();
  const publicClient = await viem.getPublicClient();

  it("Should emit the CampaignCreated event when calling createCampaign()", async function () {
    const crowdfunding = await viem.deployContract("Crowdfunding");
    const goal = 1000000000000000000n; // 1 ETH
    const durationInDays = 7n;

    // Get the deployer address (creator)
    const [deployer] = await viem.getWalletClients();
    const creator = deployer.account.address;

    // Get the current block number before the transaction
    const deploymentBlockNumber = await publicClient.getBlockNumber();

    // Execute the transaction
    const hash = await crowdfunding.write.createCampaign([
      goal,
      durationInDays,
    ]);

    // Wait for the transaction to be mined
    await publicClient.waitForTransactionReceipt({ hash });

    // Get the events from the transaction
    const events = await publicClient.getContractEvents({
      address: crowdfunding.address,
      abi: crowdfunding.abi,
      eventName: "CampaignCreated",
      fromBlock: deploymentBlockNumber,
      strict: true,
    });

    // Verify that exactly one event was emitted
    assert.equal(
      events.length,
      1,
      "Should emit exactly one CampaignCreated event"
    );

    const event = events[0];

    // Assert the event data
    assert.equal(event.args.campaignId, 0n, "Campaign ID should be 0");
    assert.equal(
      event.args.creator.toLowerCase(),
      creator.toLowerCase(),
      "Creator should match deployer address"
    );
    assert.equal(event.args.goal, goal, "Goal should match the provided goal");

    // Verify deadline is approximately correct (within 10 seconds tolerance)
    const currentTimestamp = BigInt(Math.floor(Date.now() / 1000));
    const expectedDeadline = currentTimestamp + durationInDays * 86400n;
    const deadlineDiff =
      event.args.deadline > expectedDeadline
        ? event.args.deadline - expectedDeadline
        : expectedDeadline - event.args.deadline;
    assert.ok(
      deadlineDiff <= 10n,
      `Deadline should be within 10 seconds of expected. Expected: ${expectedDeadline}, Got: ${event.args.deadline}`
    );
  });

  it("Should emit CampaignCreated event with correct campaign ID sequence", async function () {
    const crowdfunding = await viem.deployContract("Crowdfunding");
    const [deployer] = await viem.getWalletClients();
    const creator = deployer.account.address;

    const goal1 = 1000000000000000000n; // 1 ETH
    const goal2 = 2000000000000000000n; // 2 ETH
    const durationInDays = 7n;

    // Get the current block number before the transactions
    const deploymentBlockNumber = await publicClient.getBlockNumber();

    // Create first campaign
    const hash1 = await crowdfunding.write.createCampaign([
      goal1,
      durationInDays,
    ]);
    await publicClient.waitForTransactionReceipt({ hash: hash1 });

    // Create second campaign
    const hash2 = await crowdfunding.write.createCampaign([
      goal2,
      durationInDays,
    ]);
    await publicClient.waitForTransactionReceipt({ hash: hash2 });

    // Get all CampaignCreated events
    const events = await publicClient.getContractEvents({
      address: crowdfunding.address,
      abi: crowdfunding.abi,
      eventName: "CampaignCreated",
      fromBlock: deploymentBlockNumber,
      strict: true,
    });

    // Verify that exactly two events were emitted
    assert.equal(
      events.length,
      2,
      "Should emit exactly two CampaignCreated events"
    );

    // Verify first campaign event
    const firstEvent = events[0];
    assert.equal(
      firstEvent.args.campaignId,
      0n,
      "First campaign ID should be 0"
    );
    assert.equal(
      firstEvent.args.creator.toLowerCase(),
      creator.toLowerCase(),
      "First campaign creator should match deployer address"
    );
    assert.equal(
      firstEvent.args.goal,
      goal1,
      "First campaign goal should match goal1"
    );

    // Verify second campaign event
    const secondEvent = events[1];
    assert.equal(
      secondEvent.args.campaignId,
      1n,
      "Second campaign ID should be 1"
    );
    assert.equal(
      secondEvent.args.creator.toLowerCase(),
      creator.toLowerCase(),
      "Second campaign creator should match deployer address"
    );
    assert.equal(
      secondEvent.args.goal,
      goal2,
      "Second campaign goal should match goal2"
    );

    // Verify both campaigns have reasonable deadlines
    const currentTimestamp = BigInt(Math.floor(Date.now() / 1000));
    const expectedDeadline = currentTimestamp + durationInDays * 86400n;

    const firstDeadlineDiff =
      firstEvent.args.deadline > expectedDeadline
        ? firstEvent.args.deadline - expectedDeadline
        : expectedDeadline - firstEvent.args.deadline;
    assert.ok(
      firstDeadlineDiff <= 10n,
      "First campaign deadline should be within 10 seconds of expected"
    );

    const secondDeadlineDiff =
      secondEvent.args.deadline > expectedDeadline
        ? secondEvent.args.deadline - expectedDeadline
        : expectedDeadline - secondEvent.args.deadline;
    assert.ok(
      secondDeadlineDiff <= 10n,
      "Second campaign deadline should be within 10 seconds of expected"
    );
  });

  it("Should revert when creating campaign with zero goal", async function () {
    const crowdfunding = await viem.deployContract("Crowdfunding");
    const durationInDays = 7n;

    try {
      await crowdfunding.write.createCampaign([0n, durationInDays]);
      assert.fail("Expected transaction to revert");
    } catch (error: any) {
      assert.ok(error.message.includes("Goal must be greater than 0"));
    }
  });

  it("Should revert when creating campaign with zero duration", async function () {
    const crowdfunding = await viem.deployContract("Crowdfunding");
    const goal = 1000000000000000000n;

    try {
      await crowdfunding.write.createCampaign([goal, 0n]);
      assert.fail("Expected transaction to revert");
    } catch (error: any) {
      assert.ok(error.message.includes("Duration must be greater than 0"));
    }
  });

  it("Should calculate deadline correctly for different durations", async function () {
    const crowdfunding = await viem.deployContract("Crowdfunding");
    const goal = 1000000000000000000n; // 1 ETH

    // Test with 1 day duration
    const oneDayDuration = 1n;
    const deploymentBlockNumber = await publicClient.getBlockNumber();

    const hash1 = await crowdfunding.write.createCampaign([
      goal,
      oneDayDuration,
    ]);
    await publicClient.waitForTransactionReceipt({ hash: hash1 });

    // Test with 30 days duration
    const thirtyDayDuration = 30n;
    const hash2 = await crowdfunding.write.createCampaign([
      goal,
      thirtyDayDuration,
    ]);
    await publicClient.waitForTransactionReceipt({ hash: hash2 });

    // Get all events
    const events = await publicClient.getContractEvents({
      address: crowdfunding.address,
      abi: crowdfunding.abi,
      eventName: "CampaignCreated",
      fromBlock: deploymentBlockNumber,
      strict: true,
    });

    assert.equal(
      events.length,
      2,
      "Should emit exactly two CampaignCreated events"
    );

    // Verify 1-day campaign deadline
    const oneDayEvent = events[0];
    const currentTimestamp = BigInt(Math.floor(Date.now() / 1000));
    const expectedOneDayDeadline = currentTimestamp + oneDayDuration * 86400n;
    const oneDayDeadlineDiff =
      oneDayEvent.args.deadline > expectedOneDayDeadline
        ? oneDayEvent.args.deadline - expectedOneDayDeadline
        : expectedOneDayDeadline - oneDayEvent.args.deadline;
    assert.ok(
      oneDayDeadlineDiff <= 10n,
      "1-day campaign deadline should be within 10 seconds of expected"
    );

    // Verify 30-day campaign deadline
    const thirtyDayEvent = events[1];
    const expectedThirtyDayDeadline =
      currentTimestamp + thirtyDayDuration * 86400n;
    const thirtyDayDeadlineDiff =
      thirtyDayEvent.args.deadline > expectedThirtyDayDeadline
        ? thirtyDayEvent.args.deadline - expectedThirtyDayDeadline
        : expectedThirtyDayDeadline - thirtyDayEvent.args.deadline;
    assert.ok(
      thirtyDayDeadlineDiff <= 10n,
      "30-day campaign deadline should be within 10 seconds of expected"
    );

    // Verify that 30-day deadline is significantly later than 1-day deadline
    assert.ok(
      thirtyDayEvent.args.deadline > oneDayEvent.args.deadline,
      "30-day deadline should be later than 1-day deadline"
    );
    const differenceInDays =
      (thirtyDayEvent.args.deadline - oneDayEvent.args.deadline) / 86400n;
    assert.ok(
      differenceInDays >= 29n && differenceInDays <= 30n,
      "Difference should be approximately 29-30 days"
    );
  });
});
