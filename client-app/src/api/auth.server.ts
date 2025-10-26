import { createServerFn } from "@tanstack/react-start";
import type { ProfileResponse } from "./auth";

const API_URL = process.env.API_URL || "http://localhost:3001";

/**
 * Server function to get user profile
 * Automatically forwards cookies from the incoming request to the backend API
 */
export const getProfileServerFn = createServerFn({
  method: "GET",
}).handler(async (ctx: any) => {
  try {
    const cookie = ctx.request?.headers?.get("cookie");
    console.log("[Server Fn] getProfile - Cookie present:", !!cookie);

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (cookie) {
      headers.Cookie = cookie;
    }

    const response = await fetch(`${API_URL}/auth/profile`, {
      headers,
    });

    if (!response.ok) {
      console.log("[Server Fn] getProfile - Failed:", response.status);
      return null;
    }

    const data: ProfileResponse = await response.json();
    console.log("[Server Fn] getProfile - Success");
    return data;
  } catch (error) {
    console.error("[Server Fn] getProfile - Error:", error);
    return null;
  }
});

/**
 * Server function to logout user
 * Forwards the cookie to properly clear the session
 */
export const logoutServerFn = createServerFn({
  method: "POST",
}).handler(async (ctx: any) => {
  try {
    const cookie = ctx.request?.headers?.get("cookie");

    const headers: HeadersInit = {};
    if (cookie) {
      headers.Cookie = cookie;
    }

    const response = await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      headers,
    });

    if (!response.ok) {
      console.log("[Server Fn] logout - Failed:", response.status);
      return { success: false };
    }

    console.log("[Server Fn] logout - Success");
    return { success: true };
  } catch (error) {
    console.error("[Server Fn] logout - Error:", error);
    return { success: false };
  }
});
