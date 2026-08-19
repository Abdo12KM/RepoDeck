"use client";

import { useCallback, useEffect } from "react";
import useSWR from "swr";
import { requestJson } from "@/lib/swr/fetcher";

export interface AuthResponse {
  authenticated: boolean;
  user: {
    userId: string;
    githubLogin: string;
    avatarUrl: string | null;
  } | null;
}

const AUTH_CHANNEL = "repodeck-auth";

export type AuthStatus = "loading" | "authenticated" | "anonymous" | "error";

export function resolveAuthStatus(
  data: AuthResponse | undefined,
  error: unknown,
): AuthStatus {
  // Preserve a confirmed authenticated session across background revalidation
  // errors, but never treat missing/failed session data as a confirmed logout.
  if (data?.authenticated === true) return "authenticated";
  if (error) return "error";
  if (data?.authenticated === false) return "anonymous";
  return "loading";
}

async function currentPushSubscription(): Promise<PushSubscription | null> {
  if (
    typeof navigator === "undefined" ||
    !("serviceWorker" in navigator) ||
    !("PushManager" in window)
  ) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration("/");
    return (await registration?.pushManager.getSubscription()) ?? null;
  } catch {
    return null;
  }
}

export function useAuth() {
  const { data, error, isLoading, mutate } = useSWR<AuthResponse>(
    "/api/auth/session",
    requestJson,
    { revalidateOnFocus: false },
  );

  useEffect(() => {
    if (!("BroadcastChannel" in window)) return;

    const channel = new BroadcastChannel(AUTH_CHANNEL);
    channel.addEventListener("message", (event) => {
      if (event.data === "signed-out") {
        void mutate(
          { authenticated: false, user: null },
          { revalidate: false },
        );
      }
    });

    return () => channel.close();
  }, [mutate]);

  const status = resolveAuthStatus(data, error);

  const signIn = useCallback((returnTo = "/repositories") => {
    window.location.assign(
      `/api/auth/github/start?returnTo=${encodeURIComponent(returnTo)}`,
    );
  }, []);

  const connectPrivate = useCallback(() => {
    window.location.assign("/api/github/install/start");
  }, []);

  const signOut = useCallback(async () => {
    const subscription = await currentPushSubscription();

    await requestJson("/api/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint: subscription?.endpoint ?? null }),
    });

    try {
      await subscription?.unsubscribe();
    } catch (error) {
      console.warn("Browser push unsubscribe after logout failed:", error);
    }

    await mutate({ authenticated: false, user: null }, { revalidate: false });

    if ("BroadcastChannel" in window) {
      const channel = new BroadcastChannel(AUTH_CHANNEL);
      channel.postMessage("signed-out");
      channel.close();
    }

    window.location.assign("/repositories");
  }, [mutate]);

  return {
    status,
    authenticated: status === "authenticated",
    user: data?.user ?? null,
    isLoading,
    error,
    signIn,
    connectPrivate,
    signOut,
  };
}
