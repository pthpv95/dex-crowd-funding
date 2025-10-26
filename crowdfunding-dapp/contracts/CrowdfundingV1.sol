// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";

contract CrowdfundingV1 is
    Initializable,
    UUPSUpgradeable,
    OwnableUpgradeable,
    ReentrancyGuardUpgradeable
{
    struct Campaign {
        address payable creator;
        uint256 goal;
        uint256 deadline;
        uint256 amountRaised;
        bool withdrawn;
        mapping(address => uint256) donations;
        address[] donors;
    }

    mapping(uint256 => Campaign) public campaigns;
    uint256 public campaignCount;

    event CampaignCreated(
        uint256 indexed campaignId,
        address indexed creator,
        uint256 goal,
        uint256 deadline
    );

    event DonationReceived(
        uint256 indexed campaignId,
        address indexed donor,
        uint256 amount
    );

    event FundsWithdrawn(
        uint256 indexed campaignId,
        address indexed creator,
        uint256 amount
    );

    event RefundIssued(
        uint256 indexed campaignId,
        address indexed donor,
        uint256 amount
    );

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() public initializer {
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();
        campaignCount = 0;
    }

    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyOwner {}

    modifier onlyCreator(uint256 _campaignId) {
        require(
            campaigns[_campaignId].creator == msg.sender,
            "Only campaign creator can call this"
        );
        _;
    }

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

    function donate(uint256 _campaignId) external payable nonReentrant {
        Campaign storage campaign = campaigns[_campaignId];

        require(block.timestamp < campaign.deadline, "Campaign has ended");
        require(msg.value > 0, "Donation must be greater than 0");
        require(campaign.creator != address(0), "Campaign does not exist");

        if (campaign.donations[msg.sender] == 0) {
            campaign.donors.push(msg.sender);
        }

        campaign.donations[msg.sender] += msg.value;
        campaign.amountRaised += msg.value;

        emit DonationReceived(_campaignId, msg.sender, msg.value);
    }

    function withdrawFunds(
        uint256 _campaignId
    ) external onlyCreator(_campaignId) nonReentrant {
        Campaign storage campaign = campaigns[_campaignId];

        require(
            block.timestamp >= campaign.deadline,
            "Campaign is still active"
        );
        require(campaign.amountRaised >= campaign.goal, "Goal not reached");
        require(!campaign.withdrawn, "Funds already withdrawn");
        require(campaign.amountRaised > 0, "No funds to withdraw");

        campaign.withdrawn = true;
        uint256 amount = campaign.amountRaised;

        (bool success, ) = campaign.creator.call{value: amount}("");
        require(success, "Transfer failed");

        emit FundsWithdrawn(_campaignId, campaign.creator, amount);
    }

    function refund(uint256 _campaignId) external nonReentrant {
        Campaign storage campaign = campaigns[_campaignId];

        require(
            block.timestamp >= campaign.deadline,
            "Campaign is still active"
        );
        require(campaign.amountRaised < campaign.goal, "Goal was reached");
        require(!campaign.withdrawn, "Funds already withdrawn");

        uint256 donatedAmount = campaign.donations[msg.sender];
        require(donatedAmount > 0, "No donation found");

        campaign.donations[msg.sender] = 0;
        campaign.amountRaised -= donatedAmount;

        (bool success, ) = payable(msg.sender).call{value: donatedAmount}("");
        require(success, "Refund failed");

        emit RefundIssued(_campaignId, msg.sender, donatedAmount);
    }

    function getCampaign(
        uint256 _campaignId
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
        Campaign storage campaign = campaigns[_campaignId];
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

    function getDonation(
        uint256 _campaignId,
        address _donor
    ) external view returns (uint256) {
        return campaigns[_campaignId].donations[_donor];
    }

    function getDonors(
        uint256 _campaignId
    ) external view returns (address[] memory) {
        return campaigns[_campaignId].donors;
    }

    function getVersion() public pure virtual returns (string memory) {
        return "v1.0.0";
    }
}
