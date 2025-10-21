import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

function etherToWei(ether: number): bigint {
  return BigInt(ether * 10 ** 18);
}

export default buildModule("Crowdfunding", (m) => {
  const crowdfunding = m.contract("Crowdfunding");

  const goal = etherToWei(0.5);
  const durationInDays = 10n;
  m.call(crowdfunding, "createCampaign", [goal, durationInDays]);

  return { crowdfunding };
});
