import { CampaignResponse } from "@/types/campaign";

const isServer = typeof window === "undefined";
const API_URL = isServer ? process.env.API_URL : import.meta.env.VITE_API_URL;

interface ApiOptions {
  cookie?: string;
}

export const campaignsApi = {
  /**
   * Fetch all active campaigns from the backend
   */
  getAll: async (): Promise<CampaignResponse[]> => {
    const response = await fetch(`${API_URL}/campaigns`);

    if (!response.ok) {
      throw new Error("Failed to fetch campaigns");
    }

    return response.json();
  },

  /**
   * Fetch a single campaign by ID
   */
  getById: async (
    id: string,
    options?: ApiOptions
  ): Promise<CampaignResponse | null> => {
    const headers: HeadersInit = {};

    if (options?.cookie) {
      headers.Cookie = options.cookie;
    }

    const response = await fetch(`${API_URL}/campaigns/${id}`, {
      headers,
      credentials: isServer ? undefined : "include",
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error("Failed to fetch campaign");
    }

    return response.json();
  },
};
