"use client";

import { XCircle, CheckCircle2, Terminal, Zap, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function LandingWorkflowComparison() {
  return (
    <section
      id="workflow"
      className="border-border/60 bg-muted/20 border-y py-20 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <Badge
            variant="outline"
            className="text-primary border-primary/30 mb-3 px-3 py-1 text-xs font-semibold tracking-widest uppercase"
          >
            Workflow Speed
          </Badge>
          <h2 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
            Stop cloning repositories just to read a few files
          </h2>
          <p className="text-muted-foreground mt-4 text-base leading-relaxed">
            See how RepoDeck transforms reading open-source code and reviewing
            dependencies into a friction-free 1-second task.
          </p>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-2">
          {/* Traditional Workflow Card */}
          <div className="border-border/80 bg-card/60 flex flex-col justify-between rounded-2xl border p-6 shadow-xs sm:p-8">
            <div>
              <div className="border-border/80 mb-6 flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="bg-muted text-muted-foreground border-border/60 flex h-8 w-8 items-center justify-center rounded-lg border">
                    <Terminal className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-foreground text-base font-bold">
                      The Clunky Way
                    </h3>
                    <p className="text-muted-foreground text-xs">
                      Traditional desktop workflow
                    </p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="text-muted-foreground border-border/80 font-mono text-xs"
                >
                  5 - 10 Minutes
                </Badge>
              </div>

              <ul className="text-muted-foreground space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <XCircle className="text-destructive mt-0.5 h-5 w-5 shrink-0" />
                  <div>
                    <strong className="text-foreground font-medium">
                      Cloning massive repos:
                    </strong>{" "}
                    Downloading full Git history, blobs, and media files
                    consuming gigabytes on your SSD.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="text-destructive mt-0.5 h-5 w-5 shrink-0" />
                  <div>
                    <strong className="text-foreground font-medium">
                      Heavy desktop IDE startup:
                    </strong>{" "}
                    Opening VS Code or IntelliJ takes hundreds of megabytes of
                    RAM and triggers indexing spinners.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="text-destructive mt-0.5 h-5 w-5 shrink-0" />
                  <div>
                    <strong className="text-foreground font-medium">
                      Impossible on mobile:
                    </strong>{" "}
                    Cannot easily clone or navigate code trees on a phone or
                    tablet when away from your desk.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="text-destructive mt-0.5 h-5 w-5 shrink-0" />
                  <div>
                    <strong className="text-foreground font-medium">
                      Storage clutter:
                    </strong>{" "}
                    Dozens of forgotten repos pile up in your `~/Downloads` or
                    `~/Projects` folder.
                  </div>
                </li>
              </ul>
            </div>

            <div className="border-border/60 text-muted-foreground/80 mt-8 border-t pt-4 font-mono text-xs">
              $ git clone https://github.com/... [248MB received]
            </div>
          </div>

          {/* RepoDeck Workflow Card */}
          <div className="border-primary/40 bg-card flex flex-col justify-between rounded-2xl border p-6 shadow-md sm:p-8">
            <div>
              <div className="border-border/80 mb-6 flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="bg-primary/10 text-primary border-primary/20 flex h-8 w-8 items-center justify-center rounded-lg border">
                    <Zap className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-foreground text-base font-bold">
                      The RepoDeck Way
                    </h3>
                    <p className="text-muted-foreground text-xs font-medium">
                      Instant web code viewer
                    </p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="text-primary border-primary/30 font-mono text-xs"
                >
                  &lt; 1 Second
                </Badge>
              </div>

              <ul className="text-muted-foreground space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-primary mt-0.5 h-5 w-5 shrink-0" />
                  <div>
                    <strong className="text-foreground font-medium">
                      Instant streaming:
                    </strong>{" "}
                    Zero bytes saved to disk. Code files and directory trees are
                    streamed on demand.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-primary mt-0.5 h-5 w-5 shrink-0" />
                  <div>
                    <strong className="text-foreground font-medium">
                      60fps Tree Navigation:
                    </strong>{" "}
                    Virtualized file list scales effortlessly to huge
                    repositories with instantaneous branch switching.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-primary mt-0.5 h-5 w-5 shrink-0" />
                  <div>
                    <strong className="text-foreground font-medium">
                      First-class mobile experience:
                    </strong>{" "}
                    Review code, search paths, and inspect diffs comfortably on
                    any smartphone or tablet.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-primary mt-0.5 h-5 w-5 shrink-0" />
                  <div>
                    <strong className="text-foreground font-medium">
                      Zero maintenance & secure:
                    </strong>{" "}
                    Strict read-only GitHub App permissions. No global PATs or
                    token leaks.
                  </div>
                </li>
              </ul>
            </div>

            <div className="border-border/60 mt-8 flex items-center justify-between border-t pt-4">
              <span className="text-primary font-mono text-xs">
                Zero storage consumed · 100% cloud-speed
              </span>
              <Button asChild size="sm" className="h-8 gap-1.5 text-xs">
                <Link href="/repositories">
                  Try it now <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
