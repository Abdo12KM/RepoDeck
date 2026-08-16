"use client";

import {
  ArrowRight,
  CheckCircle2,
  Database,
  Github,
  LockKeyhole,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { REPODECK_DEMO_ROUTE, REPODECK_SIGN_IN_HREF } from "./landing-v3-demo";

export function LandingV3Hero() {
  return (
    <section className="relative overflow-hidden pt-16 pb-14 sm:pt-24 sm:pb-20 lg:pt-32 lg:pb-28">
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-40 [background:radial-gradient(ellipse_58%_48%_at_50%_0%,rgba(56,189,248,0.16),transparent_78%)]"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl">
          <div className="text-primary mb-6 inline-flex items-center gap-2 text-xs font-semibold">
            <span className="bg-primary h-1.5 w-1.5 rounded-full" />
            <span>Read-only GitHub code, in a focused workspace</span>
          </div>

          <h1 className="text-foreground max-w-[11ch] text-5xl font-extrabold tracking-[-0.03em] [text-wrap:balance] sm:text-6xl lg:text-[clamp(4rem,7vw,6rem)]">
            Read the codebase inside RepoDeck.
          </h1>

          <p className="text-muted-foreground mt-7 max-w-2xl text-base leading-relaxed [text-wrap:pretty] sm:text-lg">
            RepoDeck turns GitHub repositories into a focused, readable
            workspace. Open the public RepoDeck demo without spending anonymous
            GitHub requests, then sign in when you want to browse your own.
          </p>

          <div className="mt-9 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <Button
              asChild
              className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 gap-2 rounded-lg px-5 text-sm font-semibold shadow-xs transition-all active:scale-98"
            >
              <a href={REPODECK_DEMO_ROUTE}>
                <span>Open the RepoDeck demo</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </Button>
            <a
              href={REPODECK_SIGN_IN_HREF}
              className="text-muted-foreground hover:text-foreground focus-visible:ring-primary inline-flex h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-hidden"
            >
              <Github className="h-4 w-4" />
              <span>Browse your repositories</span>
            </a>
          </div>

          <div className="text-muted-foreground border-border/60 mt-10 flex max-w-2xl flex-wrap items-center gap-x-5 gap-y-3 border-t pt-5 text-xs">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              Full repository tree
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Database className="h-3.5 w-3.5 text-sky-500" />
              Public demo served from cache
            </span>
            <span className="inline-flex items-center gap-1.5">
              <LockKeyhole className="h-3.5 w-3.5 text-amber-500" />
              Read-only access
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
