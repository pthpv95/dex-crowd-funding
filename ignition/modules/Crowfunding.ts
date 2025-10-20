import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("Crowdfunding", (m) => {
  const crowdfunding = m.contract("Crowdfunding");

  m.call(crowdfunding, "createCampaign", [10n, 10n]);

  return { crowdfunding };
});
