"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Code2,
  Database,
  Lock,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { REPODECK_DEMO_ROUTE, REPODECK_SIGN_IN_HREF } from "./landing-v3-demo";

export function LandingV3SecurityBoundary() {
  return (
    <section
      id="security"
      className="border-border/40 bg-muted/10 relative border-t py-16 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-3 text-center">
          <h2 className="text-foreground text-2xl font-bold tracking-tight [text-wrap:balance] sm:text-4xl">
            One public demo. Your repositories stay yours.
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed [text-wrap:pretty] sm:text-base">
            The RepoDeck demo is a real viewer route backed by a server-side
            snapshot. Sign in when you want to browse your own public or
            selected private repositories with your GitHub access.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="border-border/80 bg-card flex flex-col justify-between rounded-xl border p-6 shadow-xs sm:p-7">
            <div className="space-y-4">
              <div className="border-border/50 flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-500">
                    <Code2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-foreground text-sm font-bold">
                      RepoDeck demo route
                    </h3>
                    <p className="text-muted-foreground text-xs">
                      Full codebase, server-side cache
                    </p>
                  </div>
                </div>
                <span className="rounded bg-sky-500/10 px-2 py-0.5 font-mono text-[11px] font-medium text-sky-500">
                  Public
                </span>
              </div>

              <ul className="text-muted-foreground space-y-2.5 text-xs sm:text-sm">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  <span>Opens the actual RepoDeck viewer</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  <span>Includes the complete repository tree and files</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Database className="mt-0.5 h-4 w-4 shrink-0 text-sky-500" />
                  <span>Visitors read the shared database snapshot</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  <span>No repository picker or anonymous repo probing</span>
                </li>
              </ul>
            </div>

            <div className="border-border/40 mt-6 border-t pt-4">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="w-full justify-between text-xs"
              >
                <Link href={REPODECK_DEMO_ROUTE}>
                  <span>Open the RepoDeck demo</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="border-border/80 bg-card flex flex-col justify-between rounded-xl border p-6 shadow-xs sm:p-7">
            <div className="space-y-4">
              <div className="border-border/50 flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                    <Lock className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-foreground text-sm font-bold">
                      Your repositories
                    </h3>
                    <p className="text-muted-foreground text-xs">
                      Authenticated GitHub access
                    </p>
                  </div>
                </div>
                <span className="rounded bg-emerald-500/10 px-2 py-0.5 font-mono text-[11px] font-medium text-emerald-500">
                  Read-only
                </span>
              </div>

              <ul className="text-muted-foreground space-y-2.5 text-xs sm:text-sm">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  <span>Use your authenticated GitHub request budget</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  <span>
                    Browse public repositories without the shared anonymous
                    budget
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  <span>
                    Select exact private repositories for RepoDeck to read
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <XCircle className="text-muted-foreground/60 mt-0.5 h-4 w-4 shrink-0" />
                  <span className="text-muted-foreground/80">
                    Never requests write, push, PR, or delete permissions
                  </span>
                </li>
              </ul>
            </div>

            <div className="border-border/40 mt-6 border-t pt-4">
              <Button
                asChild
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90 w-full justify-between text-xs"
              >
                <a href={REPODECK_SIGN_IN_HREF}>
                  <span>Sign in to browse yours</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </Button>
            </div>
          </div>
        </div>

        <div className="border-border/60 bg-background text-muted-foreground mt-8 rounded-xl border p-4 text-xs">
          <div className="text-foreground mb-1 flex items-center gap-2 font-semibold">
            <ShieldCheck className="text-primary h-4 w-4" />
            <span>Product Scope Guarantees</span>
          </div>
          <p className="leading-relaxed">
            RepoDeck does not clone repositories, execute code, write files,
            create commits, push changes, open pull requests, or persist private
            repository source code in database tables. The public demo is the
            deliberate exception: its fixed RepoDeck snapshot is cached so
            visitors can inspect the product without repeatedly calling GitHub.
          </p>
        </div>
      </div>
    </section>
  );
}
