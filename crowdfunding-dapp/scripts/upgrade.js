const { ethers, upgrades } = require("hardhat");
require("dotenv").config();

async function main() {
  const PROXY_ADDRESS = process.env.PROXY_ADDRESS;

  if (!PROXY_ADDRESS) {
    throw new Error("Please set PROXY_ADDRESS in your .env file");
  }

  console.log("Upgrading CrowdfundingV1 to CrowdfundingV2...");
  console.log("Proxy address:", PROXY_ADDRESS);

  const CrowdfundingV2 = await ethers.getContractFactory("CrowdfundingV2");

  const upgraded = await upgrades.upgradeProxy(PROXY_ADDRESS, CrowdfundingV2);

  await upgraded.waitForDeployment();
  const address = await upgraded.getAddress();

  console.log("CrowdfundingV2 upgraded at:", address);

  const newImplementationAddress =
    await upgrades.erc1967.getImplementationAddress(address);
  console.log("New implementation address:", newImplementationAddress);

  console.log("Initializing V2 variables...");
  const feePercentage = process.env.PLATFORM_FEE_PERCENTAGE || 250;
  const platformWallet = process.env.PLATFORM_WALLET_ADDRESS;

  if (!platformWallet) {
    throw new Error("Please set PLATFORM_WALLET_ADDRESS in your .env file");
  }

  const tx = await upgraded.initializeV2(feePercentage, platformWallet);
  await tx.wait();

  console.log("V2 initialized with:");
  console.log("- Platform fee:", feePercentage / 100, "%");
  console.log("- Platform wallet:", platformWallet);

  const version = await upgraded.getVersion();
  console.log("Current version:", version);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
