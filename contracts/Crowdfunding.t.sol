// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {Crowdfunding} from "./Crowdfunding.sol";
import {Test} from "forge-std/Test.sol";

contract CrowdfundingTest is Test {
    Crowdfunding crowdfunding;

    function setUp() public {
        crowdfunding = new Crowdfunding();
    }

    function test_CreateCampaign() public {
        uint256 goal = 1 ether;
        uint256 durationInDays = 30;

        uint256 campaignId = crowdfunding.createCampaign(goal, durationInDays);

        // how to print campaignId?
        (
            address creator,
            uint256 returnedGoal,
            uint256 deadline,
            uint256 amountRaised,
            bool withdrawn,
            bool isActive,
            bool goalReached
        ) = crowdfunding.getCampaign(campaignId);

        emit log_uint(deadline);

        assertEq(campaignId, 1);
        assertEq(creator, address(this));
        assertEq(returnedGoal, goal);
        assertEq(amountRaised, 0);
        assertEq(withdrawn, false);
        assertEq(isActive, true);
        assertEq(goalReached, false);
        assertGt(deadline, block.timestamp);
    }
}
