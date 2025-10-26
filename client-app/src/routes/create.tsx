import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useCreateCampaign } from "@/hooks";
import { useAccount } from "wagmi";
import { useState } from "react";

export const Route = createFileRoute("/create")({
  component: CreateCampaignPage,
});

function CreateCampaignPage() {
  const { address } = useAccount();
  const { createCampaign, isPending } = useCreateCampaign();
  const router = useRouter();

  const [formData, setFormData] = useState({
    goal: "",
    durationInDays: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!address) {
      setError("Please connect your wallet first");
      return;
    }

    if (!formData.goal || parseFloat(formData.goal) <= 0) {
      setError("Please enter a valid goal amount");
      return;
    }

    if (!formData.durationInDays || parseInt(formData.durationInDays) <= 0) {
      setError("Please enter a valid duration");
      return;
    }

    try {
      const campaignId = await createCampaign(
        parseFloat(formData.goal),
        parseInt(formData.durationInDays)
      );
      setSuccess(true);

      // Redirect to home page after 2 seconds
      setTimeout(() => {
        router.navigate({ to: "/" });
      }, 2000);
    } catch (error: any) {
      setError(error.message || "Failed to create campaign");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (!address) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                Connect Your Wallet
              </h1>
              <p className="text-gray-600 mb-6">
                You need to connect your wallet to create a campaign
              </p>
              <Link
                to="/"
                className="inline-block bg-green-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
              >
                Go to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Back Button */}
          <Link
            to="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
          >
            ← Back to Home
          </Link>

          {/* Form Card */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Start a Campaign
            </h1>
            <p className="text-gray-600 mb-8">
              Create a crowdfunding campaign and get support from the community
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Goal Amount */}
              <div>
                <label
                  htmlFor="goal"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Goal Amount (ETH) *
                </label>
                <input
                  type="number"
                  id="goal"
                  name="goal"
                  step="0.001"
                  min="0.001"
                  value={formData.goal}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., 1.0"
                  disabled={isPending}
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  How much ETH do you need to raise?
                </p>
              </div>

              {/* Quick Goal Amounts */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Quick select:
                </p>
                <div className="flex gap-2 flex-wrap">
                  {[0.1, 0.5, 1, 5, 10].map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, goal: amount.toString() })
                      }
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                      disabled={isPending}
                    >
                      {amount} ETH
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div>
                <label
                  htmlFor="durationInDays"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Campaign Duration (Days) *
                </label>
                <input
                  type="number"
                  id="durationInDays"
                  name="durationInDays"
                  min="1"
                  value={formData.durationInDays}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., 30"
                  disabled={isPending}
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  How many days will your campaign run?
                </p>
              </div>

              {/* Quick Duration */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Quick select:
                </p>
                <div className="flex gap-2 flex-wrap">
                  {[7, 14, 30, 60, 90].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          durationInDays: days.toString(),
                        })
                      }
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                      disabled={isPending}
                    >
                      {days} days
                    </button>
                  ))}
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">
                  📋 Before you start:
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• You'll need to pay gas fees to create the campaign</li>
                  <li>
                    • Once created, the goal and duration cannot be changed
                  </li>
                  <li>• You can withdraw funds only if the goal is reached</li>
                  <li>
                    • If the goal is not reached, donors can get their refunds
                  </li>
                </ul>
              </div>

              {/* Connected Wallet */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Connected wallet:</p>
                <p className="font-mono text-sm text-gray-800">{address}</p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                  Campaign created successfully! 🎉 Redirecting...
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isPending || success}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isPending
                  ? "Creating Campaign..."
                  : success
                    ? "Campaign Created!"
                    : "Create Campaign"}
              </button>
            </form>
          </div>

          {/* Help Section */}
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              How it works
            </h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    Create Your Campaign
                  </h3>
                  <p className="text-sm text-gray-600">
                    Set your funding goal and campaign duration
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Get Support</h3>
                  <p className="text-sm text-gray-600">
                    Share your campaign and receive donations from supporters
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    Withdraw Funds
                  </h3>
                  <p className="text-sm text-gray-600">
                    Once your goal is reached, withdraw the funds to your wallet
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
