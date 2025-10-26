const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export interface LoginRequest {
  walletAddress: string;
  signature: string;
  message: string;
}

export interface User {
  id: string;
  walletAddress: string;
  createdAt?: string;
}

export interface LoginResponse {
  message: string;
  user: User;
}

export interface ProfileResponse {
  user: User;
}

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Authentication failed");
    }

    return response.json();
  },

  logout: async (): Promise<{ message: string }> => {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Logout failed");
    }

    return response.json();
  },

  getProfile: async (): Promise<ProfileResponse> => {
    const response = await fetch(`${API_URL}/auth/profile`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Not authenticated");
    }

    return response.json();
  },

  refresh: async (): Promise<LoginResponse> => {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Token refresh failed");
    }

    return response.json();
  },
};
