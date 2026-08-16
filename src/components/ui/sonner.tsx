"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
} from "lucide-react";

const Toaster = ({ ...props }: ToasterProps) => {
  const { resolvedTheme } = useTheme();

  return (
    <Sonner
      theme={
        (resolvedTheme === "dark" ? "dark" : "light") as ToasterProps["theme"]
      }
      className="toaster group font-sans"
      position="top-center"
      richColors={false}
      icons={{
        success: (
          <CircleCheckIcon className="size-4 shrink-0 text-emerald-500" />
        ),
        info: <InfoIcon className="text-primary size-4 shrink-0" />,
        warning: (
          <TriangleAlertIcon className="size-4 shrink-0 text-amber-500" />
        ),
        error: <OctagonXIcon className="text-destructive size-4 shrink-0" />,
        loading: (
          <Loader2Icon className="text-primary size-4 shrink-0 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--card)",
          "--normal-text": "var(--card-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card group-[.toaster]:text-card-foreground group-[.toaster]:border-border group-[.toaster]:shadow-xl font-sans text-xs border rounded-[var(--radius)]",
          description: "group-[.toast]:text-muted-foreground text-[11px]",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground text-xs font-semibold rounded-[calc(var(--radius)-2px)] px-3 py-1.5",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground hover:group-[.toast]:text-foreground text-xs font-medium rounded-[calc(var(--radius)-2px)] px-3 py-1.5",
          closeButton:
            "group-[.toast]:bg-background group-[.toast]:text-foreground group-[.toast]:border-border",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
