"use client";

/**
 * SWR Configuration Provider
 * Global configuration for all SWR hooks
 */

import { SWRConfig } from "swr";
import { fetcher } from "@/lib/swr/fetcher";
import type { ReactNode } from "react";

interface SWRProviderProps {
  children: ReactNode;
}

export function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: false, // Don't refetch on tab focus (user controls refresh)
        dedupingInterval: 5000, // Dedupe requests within 5 seconds
        errorRetryCount: 3, // Retry failed requests 3 times
        keepPreviousData: true, // Show previous data while revalidating
        shouldRetryOnError: (error) => {
          // Don't retry on auth errors or not found
          if (error?.status === 401 || error?.status === 404) {
            return false;
          }
          return true;
        },
      }}
    >
      {children}
    </SWRConfig>
  );
}
