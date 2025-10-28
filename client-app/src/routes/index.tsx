import { createFileRoute, Link } from "@tanstack/react-router";
import { useGetCampaignsFromApi } from "@/hooks";
import { useAccount, useConnect } from "wagmi";
import CampaignCard from "@/components/CampaignCard";

export const Route = createFileRoute("/")({ component: HomePage });

function HomePage() {
  const { data: campaigns = [], isLoading } = useGetCampaignsFromApi();
  const { address } = useAccount();
  const { connectors, connect } = useConnect();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-linear-to-r from-green-500 to-blue-600 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold mb-4">
            Decentralized Crowdfunding
          </h1>
          <p className="text-xl mb-8">
            Help people around the world with blockchain technology
          </p>
          <div className="flex gap-4">
            {address ? (
              <Link
                to="/create"
                className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Start a Campaign
              </Link>
            ) : (
              <div className="flex gap-3">
                {connectors.map((connector) => (
                  <button
                    key={connector.uid}
                    onClick={() => connect({ connector })}
                    className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                  >
                    Connect with {connector.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Campaigns Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              Active Campaigns
            </h2>
            <p className="text-gray-600 mt-2">
              {isLoading ? "Loading..." : `${campaigns.length} campaigns`}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow-md h-96 animate-pulse"
              >
                <div className="h-48 bg-gray-300" />
                <div className="p-5 space-y-3">
                  <div className="h-6 bg-gray-300 rounded" />
                  <div className="h-4 bg-gray-300 rounded w-2/3" />
                  <div className="h-2 bg-gray-300 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : campaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500 text-xl mb-4">
              No campaigns yet. Be the first to create one!
            </p>
            {address && (
              <Link
                to="/create"
                className="inline-block bg-green-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
              >
                Create Campaign
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
