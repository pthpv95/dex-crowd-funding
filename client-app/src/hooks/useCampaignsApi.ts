import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { campaignsApi } from "@/api/campaigns";
import { CampaignResponse } from "@/types/campaign";

/**
 * Hook to fetch all active campaigns from the backend API
 */
export const useGetCampaignsFromApi = (): UseQueryResult<
  CampaignResponse[],
  Error
> => {
  return useQuery({
    queryKey: ["campaigns", "active"],
    queryFn: () => campaignsApi.getAll(),
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });
};

/**
 * Hook to fetch a single campaign by ID from the backend API
 */
export const useGetCampaignFromApi = (
  id: string | undefined
): UseQueryResult<CampaignResponse | null, Error> => {
  return useQuery({
    queryKey: ["campaigns", id],
    queryFn: () => {
      if (!id) {
        throw new Error("Campaign ID is required");
      }
      return campaignsApi.getById(id);
    },
    enabled: !!id, // Only run query if id is provided
    staleTime: 30000,
  });
};
