// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract Crowfunding {
    struct Campaign {
        address payable creator;
        uint256 goal;
        uint256 deadline;
        uint256 amountRaised;
        mapping(address => uint256) donations;
        address[] donors;
        bool withdrawn;
    }

    uint256 public campaignCount;
    mapping(uint256 => Campaign) campaigns;

    event CampaignCreated(
        uint256 indexed campaignId,
        address indexed creator,
        uint256 goal,
        uint256 deadline
    );

    function createCampaign(
        uint256 _goal,
        uint256 _durationInDays
    ) external returns (uint256) {
        require(_goal > 0, "Goal must be greater than 0");
        require(_durationInDays > 0, "Duration must be greater than 0");

        uint256 campaignId = campaignCount++;
        Campaign storage newCampaign = campaigns[campaignId];
        newCampaign.creator = payable(msg.sender);
        newCampaign.goal = _goal;
        newCampaign.deadline = block.timestamp + (_durationInDays * 1 days);
        newCampaign.amountRaised = 0;
        newCampaign.withdrawn = false;
        emit CampaignCreated(
            campaignId,
            msg.sender,
            _goal,
            newCampaign.deadline
        );
        return campaignId;
    }

    function getCampaign(
        uint256 campaignId
    )
        external
        view
        returns (
            address creator,
            uint256 goal,
            uint256 deadline,
            uint256 amountRaised,
            bool withdrawn,
            bool isActive,
            bool goalReached
        )
    {
        Campaign storage campaign = campaigns[campaignId];
        return (
            campaign.creator,
            campaign.goal,
            campaign.deadline,
            campaign.amountRaised,
            campaign.withdrawn,
            block.timestamp < campaign.deadline,
            campaign.amountRaised >= campaign.goal
        );
    }
}
