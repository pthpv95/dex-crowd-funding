import { Link } from "@tanstack/react-router";
import { CampaignData } from "@/hooks";

interface CampaignCardProps {
  id: number;
  campaign: CampaignData;
}

const CampaignCard = ({ id, campaign }: CampaignCardProps) => {
  const progressPercentage =
    (parseFloat(campaign.amountRaised) / parseFloat(campaign.goal)) * 100;

  const daysLeft = Math.ceil(
    (new Date(campaign.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  const isExpired = daysLeft < 0;

  return (
    <Link
      to="/campaign/$id"
      params={{ id: id.toString() }}
      className="block bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden"
    >
      {/* Placeholder Image */}
      <div className="h-48 bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
        Campaign #{id}
      </div>

      <div className="p-5">
        {/* Title */}
        <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
          Campaign #{id}
        </h3>

        {/* Creator */}
        <p className="text-sm text-gray-500 mb-4">
          By {campaign.creator.slice(0, 6)}...{campaign.creator.slice(-4)}
        </p>

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all"
              style={{
                width: `${Math.min(progressPercentage, 100)}%`,
              }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-between items-center mb-2">
          <div>
            <p className="text-2xl font-bold text-gray-800">
              {parseFloat(campaign.amountRaised).toFixed(4)} ETH
            </p>
            <p className="text-sm text-gray-500">
              raised of {parseFloat(campaign.goal).toFixed(4)} ETH goal
            </p>
          </div>
        </div>

        {/* Status Tags */}
        <div className="flex gap-2 flex-wrap mt-3">
          {campaign.goalReached && (
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
              ✓ Goal Reached
            </span>
          )}
          {isExpired ? (
            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
              Expired
            </span>
          ) : (
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
              {daysLeft} days left
            </span>
          )}
          {!campaign.isActive && (
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
              Inactive
            </span>
          )}
          {campaign.withdrawn && (
            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
              Withdrawn
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default CampaignCard;
