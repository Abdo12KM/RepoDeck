"use client";

import Link from "next/link";
import { ArrowRight, Github } from "lucide-react";
import { RepoDeckIcon } from "@/components/ui/RepoDeckLogo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export function LandingCta() {
  const { authenticated, signIn } = useAuth();

  return (
    <section className="relative py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="border-border/80 bg-card rounded-2xl border p-8 text-center shadow-md sm:p-14">
          <div className="mx-auto max-w-2xl space-y-6">
            <h2 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
              A quieter, faster way to read code.
            </h2>

            <p className="text-muted-foreground text-base leading-relaxed">
              Open any public repository or connect your GitHub account to start
              browsing code instantly without local clones.
            </p>

            <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="h-11 w-full gap-2 px-7 text-sm font-semibold shadow-xs sm:w-auto"
              >
                <Link href="/repositories">
                  <RepoDeckIcon
                    size={18}
                    variant="flat"
                    className="h-4.5 w-4.5"
                  />
                  <span>Launch RepoDeck</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>

              {!authenticated ? (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => signIn()}
                  className="border-border/80 hover:bg-muted h-11 w-full gap-2 px-6 text-sm font-medium sm:w-auto"
                >
                  <Github className="h-4 w-4" />
                  <span>Sign in with GitHub</span>
                </Button>
              ) : null}
            </div>

            <p className="text-muted-foreground/70 pt-2 font-mono text-xs">
              Free & Open Source · Read-only access
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
