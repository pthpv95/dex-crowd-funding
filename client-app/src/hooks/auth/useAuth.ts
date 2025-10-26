import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi, type LoginRequest } from "../../api/auth";

export const AUTH_KEYS = {
  profile: ["auth", "profile"] as const,
};

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (data) => {
      // Update profile cache with the logged-in user
      queryClient.setQueryData(AUTH_KEYS.profile, { user: data.user });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      // Clear profile cache
      queryClient.setQueryData(AUTH_KEYS.profile, null);
      queryClient.invalidateQueries({ queryKey: AUTH_KEYS.profile });
    },
  });
}

export function useProfile(enabled = true) {
  return useQuery({
    queryKey: AUTH_KEYS.profile,
    queryFn: () => authApi.getProfile(),
    enabled,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useRefreshToken() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.refresh(),
    onSuccess: (data) => {
      queryClient.setQueryData(AUTH_KEYS.profile, { user: data.user });
    },
  });
}
