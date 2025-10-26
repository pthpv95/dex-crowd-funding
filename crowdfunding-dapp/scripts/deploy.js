const { ethers, upgrades } = require("hardhat");

async function main() {
  console.log("Deploying CrowdfundingV1...");

  const CrowdfundingV1 = await ethers.getContractFactory("CrowdfundingV1");
  const crowdfunding = await upgrades.deployProxy(CrowdfundingV1, [], {
    initializer: "initialize",
    kind: "uups",
  });

  await crowdfunding.waitForDeployment();
  const address = await crowdfunding.getAddress();

  console.log("CrowdfundingV1 proxy deployed to:", address);

  const implementationAddress = await upgrades.erc1967.getImplementationAddress(
    address
  );
  console.log("Implementation address:", implementationAddress);

  const version = await crowdfunding.getVersion();
  console.log("Version:", version);

  console.log("\n=== Save these addresses ===");
  console.log("Proxy Address:", address);
  console.log("Implementation Address:", implementationAddress);
  console.log("\nAdd PROXY_ADDRESS to your .env file");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
