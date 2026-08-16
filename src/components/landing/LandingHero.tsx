"use client";

import { Shield, Zap, Smartphone, Code } from "lucide-react";
import { LandingQuickLaunch } from "./LandingQuickLaunch";
import { LandingInteractiveMockup } from "./LandingInteractiveMockup";

export function LandingHero() {
  return (
    <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top Announcement Pill */}
        <div className="mb-6 flex justify-center">
          <div className="border-border/80 bg-muted/50 text-foreground inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-medium shadow-2xs">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>Read-only GitHub code viewer · Zero clones needed</span>
          </div>
        </div>

        {/* Hero Title & Subtitle */}
        <div className="mx-auto max-w-4xl space-y-5 text-center">
          <h1 className="text-foreground text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            Browse any GitHub repository without cloning.
          </h1>

          <p className="text-muted-foreground mx-auto max-w-2xl text-base leading-relaxed sm:text-lg">
            A fast, responsive code reader for desktop, tablet, and mobile.
            Features 18 Shiki syntax themes, 60fps virtualized file trees, and
            instant file search.
          </p>
        </div>

        {/* Quick Launch Search Bar */}
        <div className="mt-10 mb-8">
          <LandingQuickLaunch />
        </div>

        {/* Trust Badges */}
        <div className="text-muted-foreground mb-16 flex flex-wrap items-center justify-center gap-3 pt-2 text-xs">
          <div className="bg-muted/40 border-border/60 flex items-center gap-2 rounded-lg border px-3 py-1.5">
            <Zap className="text-foreground/80 h-3.5 w-3.5" />
            <span className="text-foreground/90 font-mono">0 MB on disk</span>
          </div>
          <div className="bg-muted/40 border-border/60 flex items-center gap-2 rounded-lg border px-3 py-1.5">
            <Shield className="text-foreground/80 h-3.5 w-3.5" />
            <span className="text-foreground/90 font-medium">
              Read-only permissions
            </span>
          </div>
          <div className="bg-muted/40 border-border/60 flex items-center gap-2 rounded-lg border px-3 py-1.5">
            <Smartphone className="text-foreground/80 h-3.5 w-3.5" />
            <span className="text-foreground/90 font-medium">
              Mobile & tablet ready
            </span>
          </div>
          <div className="bg-muted/40 border-border/60 flex items-center gap-2 rounded-lg border px-3 py-1.5">
            <Code className="text-foreground/80 h-3.5 w-3.5" />
            <span className="text-foreground/90 font-medium">
              18 Shiki themes
            </span>
          </div>
        </div>

        {/* Interactive App Mockup Showcase */}
        <div className="mt-6">
          <LandingInteractiveMockup />
        </div>
      </div>
    </section>
  );
}
