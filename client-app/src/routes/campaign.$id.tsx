import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useGetCampaign, useDonate, useGetDonors } from "@/hooks";
import { useAccount, useBalance } from "wagmi";
import { useState } from "react";

export const Route = createFileRoute("/campaign/$id")({
  component: CampaignDetailsPage,
});

function CampaignDetailsPage() {
  const { id } = Route.useParams();
  const campaignId = parseInt(id);
  const { data: campaign, isLoading, refetch } = useGetCampaign(campaignId);
  const { donors } = useGetDonors(campaignId);
  const { address } = useAccount();
  const { data: balance } = useBalance({ address });
  const { donate, isPending } = useDonate();
  const router = useRouter();

  const [donationAmount, setDonationAmount] = useState("");
  const [donationError, setDonationError] = useState("");
  const [donationSuccess, setDonationSuccess] = useState(false);

  if (isLoading || !campaign) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8 animate-pulse">
              <div className="h-64 bg-gray-300 rounded-lg mb-6" />
              <div className="h-8 bg-gray-300 rounded w-3/4 mb-4" />
              <div className="h-4 bg-gray-300 rounded w-1/2 mb-6" />
              <div className="h-32 bg-gray-300 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const progressPercentage =
    (parseFloat(campaign.amountRaised) / parseFloat(campaign.goal)) * 100;

  const daysLeft = Math.ceil(
    (new Date(campaign.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  const isExpired = daysLeft < 0;

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    setDonationError("");
    setDonationSuccess(false);

    if (!address) {
      setDonationError("Please connect your wallet first");
      return;
    }

    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      setDonationError("Please enter a valid donation amount");
      return;
    }

    try {
      await donate(campaignId, parseFloat(donationAmount));
      setDonationSuccess(true);
      setDonationAmount("");
      // Refetch campaign data after successful donation
      setTimeout(() => {
        refetch();
      }, 2000);
    } catch (error: any) {
      setDonationError(error.message || "Failed to donate");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link
            to="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
          >
            ← Back to Campaigns
          </Link>

          {/* Main Card */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Hero Image */}
            <div className="h-64 bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white">
              <div className="text-center">
                <h1 className="text-4xl font-bold mb-2">Campaign #{id}</h1>
                <p className="text-lg">Help us reach our goal!</p>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              {/* Creator Info */}
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-1">Created by</p>
                <p className="font-mono text-gray-700">{campaign.creator}</p>
              </div>

              {/* Progress */}
              <div className="mb-8">
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <p className="text-4xl font-bold text-gray-800">
                      {parseFloat(campaign.amountRaised).toFixed(4)} ETH
                    </p>
                    <p className="text-gray-600">
                      raised of {parseFloat(campaign.goal).toFixed(4)} ETH goal
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-800">
                      {progressPercentage.toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-600">funded</p>
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                  <div
                    className="bg-green-500 h-3 rounded-full transition-all"
                    style={{
                      width: `${Math.min(progressPercentage, 100)}%`,
                    }}
                  />
                </div>

                {/* Stats Row */}
                <div className="flex gap-6">
                  <div>
                    <p className="text-2xl font-bold text-gray-800">
                      {donors?.length || 0}
                    </p>
                    <p className="text-sm text-gray-600">donors</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">
                      {isExpired ? "Expired" : `${daysLeft}`}
                    </p>
                    <p className="text-sm text-gray-600">
                      {isExpired ? "" : "days to go"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Tags */}
              <div className="flex gap-2 flex-wrap mb-8">
                {campaign.goalReached && (
                  <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                    ✓ Goal Reached
                  </span>
                )}
                {!campaign.isActive && (
                  <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold">
                    Inactive
                  </span>
                )}
                {campaign.withdrawn && (
                  <span className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">
                    Funds Withdrawn
                  </span>
                )}
                {isExpired && (
                  <span className="px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                    Expired
                  </span>
                )}
              </div>

              {/* Donation Form */}
              {campaign.isActive && !isExpired && (
                <div className="border-t pt-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    Support This Campaign
                  </h2>

                  {!address ? (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                      <p className="text-gray-700 mb-4">
                        Connect your wallet to donate to this campaign
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleDonate} className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label
                            htmlFor="amount"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Donation Amount (ETH)
                          </label>
                          {balance && (
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-gray-500">Your Balance:</span>
                              <span className="font-semibold text-gray-700">
                                {parseFloat(balance.formatted).toFixed(4)} {balance.symbol}
                              </span>
                            </div>
                          )}
                        </div>
                        <input
                          type="number"
                          id="amount"
                          step="0.0001"
                          min="0.0001"
                          value={donationAmount}
                          onChange={(e) => setDonationAmount(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="0.01"
                          disabled={isPending}
                        />
                      </div>

                      {/* Quick amounts */}
                      <div className="flex gap-2">
                        {[0.01, 0.05, 0.1, 0.5].map((amount) => (
                          <button
                            key={amount}
                            type="button"
                            onClick={() => setDonationAmount(amount.toString())}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                            disabled={isPending}
                          >
                            {amount} ETH
                          </button>
                        ))}
                      </div>

                      {donationError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                          {donationError}
                        </div>
                      )}

                      {donationSuccess && (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                          Donation successful! Thank you for your support! 🎉
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isPending || !donationAmount}
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        {isPending ? "Processing..." : "Donate Now"}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* Campaign Details */}
              <div className="border-t pt-8 mt-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Campaign Information
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Campaign ID</span>
                    <span className="font-semibold">{id}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Goal Amount</span>
                    <span className="font-semibold">
                      {parseFloat(campaign.goal).toFixed(4)} ETH
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Amount Raised</span>
                    <span className="font-semibold">
                      {parseFloat(campaign.amountRaised).toFixed(4)} ETH
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Deadline</span>
                    <span className="font-semibold">
                      {new Date(campaign.deadline).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Total Donors</span>
                    <span className="font-semibold">{donors?.length || 0}</span>
                  </div>
                </div>
              </div>

              {/* Donors List */}
              {donors && donors.length > 0 && (
                <div className="border-t pt-8 mt-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    Supporters ({donors.length})
                  </h2>
                  <div className="space-y-2">
                    {donors.map((donor, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="w-10 h-10 bg-linear-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <p className="font-mono text-sm text-gray-700">
                          {donor.slice(0, 10)}...{donor.slice(-8)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
