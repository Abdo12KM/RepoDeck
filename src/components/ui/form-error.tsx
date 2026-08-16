import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

interface FormErrorProps {
  error?: string | null;
  retryAfter?: number;
  className?: string;
}

export function FormError({ error, retryAfter, className }: FormErrorProps) {
  if (!error) return null;

  return (
    <div className={cn("space-y-1", className)}>
      <div className="text-destructive flex items-center justify-center gap-2">
        <AlertCircle className="h-4 w-4" />
        <p className="text-sm font-medium">{error}</p>
      </div>
      {retryAfter && (
        <p className="text-muted-foreground text-center text-xs">
          Wait {retryAfter} seconds before trying again.
        </p>
      )}
    </div>
  );
}
