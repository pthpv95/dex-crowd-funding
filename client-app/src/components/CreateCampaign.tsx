import { useCreateCampaign } from "@/hooks";

const CreateCampaign = () => {
  const { createCampaign, isPending, error } = useCreateCampaign();

  const handleCreateCampaign = async () => {
    const campaignId = await createCampaign(0.05, 10);
    console.log("🚀 ~ handleCreateCampaign ~ campaignId:", campaignId);
  };

  return (
    <div>
      <button
        className="bg-blue-500 text-white p-2 rounded-md"
        disabled={isPending}
        onClick={handleCreateCampaign}
      >
        {isPending ? "Creating..." : "Create Campaign"}
      </button>
      {error && <div className="text-red-500">{error.message}</div>}
    </div>
  );
};

export default CreateCampaign;
