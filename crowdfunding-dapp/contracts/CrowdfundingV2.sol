// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "./CrowdfundingV1.sol";

contract CrowdfundingV2 is CrowdfundingV1 {
    uint256 public platformFeePercentage;
    address payable public platformWallet;

    function initializeV2(
        uint256 _feePercentage,
        address payable _platformWallet
    ) public reinitializer(2) {
        require(_feePercentage <= 1000, "Fee cannot exceed 10%");
        require(_platformWallet != address(0), "Invalid platform wallet");

        platformFeePercentage = _feePercentage;
        platformWallet = _platformWallet;
    }

    function getVersion() public pure override returns (string memory) {
        return "v2.0.0";
    }
}
