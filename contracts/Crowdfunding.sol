// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract Crowdfunding {
    struct Campaign {
        address payable creator;
        uint256 goal;
        uint256 deadline;
        uint256 amountRaised;
        // to track the donations of each donor
        mapping(address => uint256) donations;
        address[] donors;
        // to track if the campaign has been withdrawn
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

    event DonateReceived(
        uint256 indexed campaignId,
        address indexed donor,
        uint256 amount
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

    function donate(uint256 _amount, uint256 _campaignId) external {
        require(_amount > 0, "Amount must greater than 0");
        Campaign storage existingCampaign = campaigns[_campaignId];
        // validate campaign existing
        require(
            existingCampaign.creator != address(0),
            "Campaign does not exist"
        );
        // validate campaign is not withdrawn
        require(!existingCampaign.withdrawn, "Campaign has been withdrawn");
        // validate campaign is not expired
        require(
            block.timestamp < existingCampaign.deadline,
            "Campaign has expired"
        );
        // validate campaign has not reached the goal
        require(
            existingCampaign.amountRaised < existingCampaign.goal,
            "Campaign has reached the goal"
        );
        // add donation to campaign
        existingCampaign.amountRaised += _amount;
        existingCampaign.donations[msg.sender] += _amount;
        existingCampaign.donors.push(msg.sender);
        emit DonateReceived(_campaignId, msg.sender, _amount);
    }

    function getAllDonors(
        uint256 _campaignId
    ) external view returns (address[] memory) {
        return campaigns[_campaignId].donors;
    }
}
