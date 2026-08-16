"use client";

import { ExternalLink, Github } from "lucide-react";
import { RepoDeckLogo } from "@/components/ui/RepoDeckLogo";
import {
  REPODECK_DEMO_ROUTE,
  REPODECK_GITHUB_URL,
  REPODECK_SIGN_IN_HREF,
} from "./landing-v3-demo";

export function LandingV3Footer() {
  return (
    <footer className="border-border/40 bg-background text-muted-foreground border-t py-12 text-xs">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          {/* Logo & Tagline */}
          <div className="flex flex-col items-center gap-2 sm:items-start">
            <RepoDeckLogo iconSize={20} />
            <p className="text-muted-foreground/80 text-[11px]">
              Focused, read-only GitHub repository viewer for desktop, tablet,
              and mobile.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-6">
            <a
              href={REPODECK_DEMO_ROUTE}
              className="hover:text-foreground transition-colors"
            >
              Open the RepoDeck demo
            </a>
            <a
              href={REPODECK_SIGN_IN_HREF}
              className="hover:text-foreground transition-colors"
            >
              Sign in to browse yours
            </a>
            <a
              href={REPODECK_GITHUB_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="hover:text-foreground inline-flex items-center gap-1 transition-colors"
            >
              <Github className="h-3.5 w-3.5" />
              <span>GitHub</span>
              <ExternalLink className="h-3 w-3 opacity-60" />
            </a>
          </div>
        </div>

        {/* Bottom Rule */}
        <div className="border-border/40 text-muted-foreground/60 mt-8 flex flex-col items-center justify-between border-t pt-6 text-[11px] sm:flex-row">
          <p>© {new Date().getFullYear()} RepoDeck. Read-only code viewer.</p>
          <div className="mt-2 flex items-center gap-2 sm:mt-0">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>RepoDeck demo served from cache</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
