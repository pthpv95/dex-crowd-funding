import { useAccount, useConnect, useDisconnect } from "wagmi";
import CreateCampaign from "./CreateCampaign";
import { useGetCampaign } from "@/hooks";

const Campaigns = () => {
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { address } = useAccount();
  const campaignId = 0;

  const { data: campaign } = useGetCampaign(campaignId);
  console.log("🚀 ~ Campaigns ~ campaign:", campaign);

  return (
    <div>
      {address ? (
        <div className="flex flex-col items-center gap-2">
          Connected: {address}
          <button
            className="bg-blue-500 text-white p-2 rounded-md"
            onClick={() => disconnect()}
          >
            Disconnect
          </button>
          <CreateCampaign />
          {campaign && (
            <div>
              <h2>Campaign {campaignId}</h2>
              <p>Creator: {campaign.creator}</p>
              <p>Goal: ETH {campaign.goal}</p>
              <p>Deadline: {campaign.deadline}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2">
          {connectors.map((connector) => (
            <button
              key={connector.uid}
              onClick={() => {
                connect({ connector });
              }}
              className="bg-blue-500 text-white p-2 rounded-md"
            >
              {connector.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Campaigns;
