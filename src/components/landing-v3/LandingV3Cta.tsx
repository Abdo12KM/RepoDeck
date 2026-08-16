"use client";

import { ArrowRight, Github, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { REPODECK_DEMO_ROUTE, REPODECK_SIGN_IN_HREF } from "./landing-v3-demo";

export function LandingV3Cta() {
  return (
    <section className="border-border/40 bg-muted/15 relative overflow-hidden border-t py-16 sm:py-24">
      {/* Background Subtle Radial Glow */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-20 [background:radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(56,189,248,0.18),transparent_80%)]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-4xl space-y-5 px-4 text-center sm:px-6 lg:px-8">
        <div className="border-primary/20 bg-primary/5 text-primary inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-xs font-medium">
          <Zap className="h-3.5 w-3.5" />
          <span>Open the real demo route</span>
        </div>

        <h2 className="text-foreground text-2xl font-bold tracking-tight [text-wrap:balance] sm:text-4xl">
          Read RepoDeck inside RepoDeck.
        </h2>

        <p className="text-muted-foreground mx-auto max-w-xl text-sm leading-relaxed [text-wrap:pretty] sm:text-base">
          The landing page points to one fixed repository, with its full tree
          and files served from the server cache. Sign in when you want to
          browse your own public or selected private repositories.
        </p>

        <div className="flex flex-col items-center justify-center gap-3 pt-3 sm:flex-row">
          <Button
            asChild
            className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 gap-2 rounded-lg px-5 text-sm font-semibold shadow-xs transition-all active:scale-98"
          >
            <a href={REPODECK_DEMO_ROUTE}>
              <Github className="h-4 w-4" />
              <span>Open the RepoDeck demo</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </Button>
          <a
            href={REPODECK_SIGN_IN_HREF}
            className="text-muted-foreground hover:text-foreground inline-flex h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-colors"
          >
            Sign in to browse yours
          </a>
        </div>
      </div>
    </section>
  );
}
