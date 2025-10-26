const isServer = typeof window === "undefined";
const API_URL = isServer ? process.env.API_URL : import.meta.env.VITE_API_URL;

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

interface ApiOptions {
  cookie?: string;
}

export const authApi = {
  login: async (data: LoginRequest, options?: ApiOptions): Promise<LoginResponse> => {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    // On server, forward the cookie header
    if (options?.cookie) {
      headers.Cookie = options.cookie;
    }

    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers,
      credentials: isServer ? undefined : "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Authentication failed");
    }

    return response.json();
  },

  logout: async (options?: ApiOptions): Promise<{ message: string }> => {
    const headers: HeadersInit = {};

    if (options?.cookie) {
      headers.Cookie = options.cookie;
    }

    const response = await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      headers,
      credentials: isServer ? undefined : "include",
    });

    if (!response.ok) {
      throw new Error("Logout failed");
    }

    return response.json();
  },

  getProfile: async (options?: ApiOptions): Promise<ProfileResponse> => {
    const headers: HeadersInit = {};

    if (options?.cookie) {
      headers.Cookie = options.cookie;
    }

    const response = await fetch(`${API_URL}/auth/profile`, {
      headers,
      credentials: isServer ? undefined : "include",
    });

    if (!response.ok) {
      throw new Error("Not authenticated");
    }

    return response.json();
  },

  refresh: async (options?: ApiOptions): Promise<LoginResponse> => {
    const headers: HeadersInit = {};

    if (options?.cookie) {
      headers.Cookie = options.cookie;
    }

    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers,
      credentials: isServer ? undefined : "include",
    });

    if (!response.ok) {
      throw new Error("Token refresh failed");
    }

    return response.json();
  },
};
