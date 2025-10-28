import { abis, CROWDFUNDING_CONTRACT_ADDRESS } from "@/config";
import { formatDateTime } from "@/utils";
import { formatEther, parseEther } from "viem";
import { useAccount, useReadContract, useWriteContract } from "wagmi";

// Campaign data type
export interface CampaignData {
  creator: string;
  goal: string;
  deadline: string;
  amountRaised: string;
  withdrawn: boolean;
  isActive: boolean;
  goalReached: boolean;
}

export const useCreateCampaign = () => {
  const { address } = useAccount();
  const { writeContractAsync, ...rest } = useWriteContract();

  const createCampaign = async (goal: number, durationInDays: number) => {
    if (!address) {
      throw new Error("No account connected");
    }
    const goalInWei = parseEther(goal.toString());

    const campaignId = await writeContractAsync({
      address: CROWDFUNDING_CONTRACT_ADDRESS,
      abi: abis.CROWDFUNDING,
      functionName: "createCampaign",
      args: [goalInWei, BigInt(durationInDays)],
    });
    return campaignId;
  };

  return { createCampaign, ...rest };
};

export const useGetCampaign = (id: number) => {
  const {
    data: rawData,
    isLoading,
    error,
    refetch,
  } = useReadContract({
    address: CROWDFUNDING_CONTRACT_ADDRESS,
    abi: abis.CROWDFUNDING,
    functionName: "getCampaign",
    args: [id],
  });

  const data: CampaignData | undefined = rawData
    ? (() => {
        const result = rawData as [
          string,
          bigint,
          bigint,
          bigint,
          boolean,
          boolean,
          boolean,
        ];
        return {
          creator: result[0],
          goal: formatEther(result[1]),
          deadline: formatDateTime(Number(result[2]) * 1000),
          amountRaised: formatEther(result[3]),
          withdrawn: result[4],
          isActive: result[5],
          goalReached: result[6],
        };
      })()
    : undefined;

  return { data, isLoading, error, refetch };
};

export const useGetCampaignCount = () => {
  const { data, isLoading, error, refetch } = useReadContract({
    address: CROWDFUNDING_CONTRACT_ADDRESS,
    abi: abis.CROWDFUNDING,
    functionName: "campaignCount",
    query: {
      // don't retry if the query fails
      retry: false,
    },
  });

  return {
    count: data ? Number(data) : 0,
    isLoading,
    error,
    refetch,
  };
};

export const useDonate = () => {
  const { address } = useAccount();
  const { writeContractAsync, ...rest } = useWriteContract();

  const donate = async (campaignId: number, amount: number) => {
    if (!address) {
      throw new Error("No account connected");
    }
    const amountInWei = parseEther(amount.toString());

    const hash = await writeContractAsync({
      address: CROWDFUNDING_CONTRACT_ADDRESS,
      abi: abis.CROWDFUNDING,
      functionName: "donate",
      args: [BigInt(campaignId)],
      value: amountInWei,
    });
    return hash;
  };

  return { donate, ...rest };
};

export const useGetDonors = (campaignId: number) => {
  const { data, isLoading, error, refetch } = useReadContract({
    address: CROWDFUNDING_CONTRACT_ADDRESS,
    abi: abis.CROWDFUNDING,
    functionName: "getDonors",
    args: [BigInt(campaignId)],
  });

  return {
    donors: data as string[] | undefined,
    isLoading,
    error,
    refetch,
  };
};
