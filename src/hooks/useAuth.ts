"use client";

import { useCallback } from "react";
import useSWR from "swr";
import { requestJson } from "@/lib/swr/fetcher";

interface AuthResponse {
  authenticated: boolean;
  user: {
    userId: string;
    githubLogin: string;
    avatarUrl: string | null;
  } | null;
}

export function useAuth() {
  const { data, error, isLoading, mutate } = useSWR<AuthResponse>(
    "/api/auth/session",
    requestJson,
    { revalidateOnFocus: false },
  );

  const signIn = useCallback((returnTo = "/repositories") => {
    window.location.assign(
      `/api/auth/github/start?returnTo=${encodeURIComponent(returnTo)}`,
    );
  }, []);

  const connectPrivate = useCallback(() => {
    window.location.assign("/api/github/install/start");
  }, []);

  const signOut = useCallback(async () => {
    await requestJson("/api/auth/logout", { method: "POST" });
    await mutate({ authenticated: false, user: null }, { revalidate: false });
    window.location.assign("/repositories");
  }, [mutate]);

  return {
    authenticated: data?.authenticated ?? false,
    user: data?.user ?? null,
    isLoading,
    error,
    signIn,
    connectPrivate,
    signOut,
  };
}
