"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { ViewerProvider } from "@/hooks/useViewer";
import { RepositoryViewer } from "@/components/viewer";

export default function RepositoriesPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-background flex h-dvh items-center justify-center">
          <Loader2 className="text-muted-foreground h-5 w-5 animate-spin" />
        </div>
      }
    >
      <ViewerProvider>
        <RepositoryViewer />
      </ViewerProvider>
    </Suspense>
  );
}
