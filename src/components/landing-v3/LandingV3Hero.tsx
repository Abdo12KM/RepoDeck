"use client";

import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Database,
  ExternalLink,
  FileCode2,
  Folder,
  FolderTree,
  GitBranch,
  Github,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { RepoDeckIcon } from "@/components/ui/RepoDeckLogo";
import {
  REPODECK_DEMO_ROUTE,
  REPODECK_GITHUB_URL,
  REPODECK_SIGN_IN_HREF,
} from "./landing-v3-demo";

const DEMO_FILES: Array<{
  label: string;
  kind: "folder" | "file";
  nested?: boolean;
}> = [
  { label: "src", kind: "folder" },
  { label: "app", kind: "folder", nested: true },
  { label: "components", kind: "folder", nested: true },
  { label: "lib", kind: "folder", nested: true },
  { label: "package.json", kind: "file" },
  { label: "README.md", kind: "file" },
] as const;

export function LandingV3Hero() {
  return (
    <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 lg:pt-24 lg:pb-28">
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-40 [background:radial-gradient(ellipse_58%_48%_at_50%_0%,rgba(56,189,248,0.16),transparent_78%)]"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.86fr)] lg:gap-16">
          <div className="max-w-2xl">
            <div className="text-primary mb-5 inline-flex items-center gap-2 text-xs font-semibold">
              <span className="bg-primary h-1.5 w-1.5 rounded-full" />
              <span>One real demo, ready to open</span>
            </div>

            <h1 className="text-foreground max-w-[12ch] text-4xl font-extrabold tracking-[-0.03em] [text-wrap:balance] sm:text-6xl lg:text-7xl">
              Read the codebase inside RepoDeck.
            </h1>

            <p className="text-muted-foreground mt-6 max-w-2xl text-base leading-relaxed [text-wrap:pretty] sm:text-lg">
              Open RepoDeck&apos;s own repository in the actual viewer. The full
              tree and its files are cached server-side, so visitors can see the
              product without taking turns against GitHub&apos;s anonymous
              request limit.
            </p>

            <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <Button
                asChild
                className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 gap-2 rounded-lg px-5 text-sm font-semibold shadow-xs transition-all active:scale-98"
              >
                <a href={REPODECK_DEMO_ROUTE}>
                  <FolderTree className="h-4 w-4" />
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

            <div className="text-muted-foreground mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                Full repository tree
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Database className="h-3.5 w-3.5 text-sky-500" />
                Database-backed cache
              </span>
              <span className="inline-flex items-center gap-1.5">
                <LockKeyhole className="h-3.5 w-3.5 text-amber-500" />
                Read-only access
              </span>
            </div>
          </div>

          <div id="reader-preview" className="scroll-mt-24">
            <div className="text-muted-foreground mb-3 flex items-center justify-between px-1 text-[11px]">
              <span className="inline-flex items-center gap-1.5 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Live viewer route
              </span>
              <span className="font-mono">/repositories</span>
            </div>

            <div className="border-border/80 bg-card overflow-hidden rounded-2xl border shadow-xl">
              <div className="border-border/60 bg-muted/20 flex items-center justify-between border-b px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="bg-background flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border">
                    <RepoDeckIcon size={22} variant="flat" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-foreground truncate text-sm font-semibold">
                      Abdo12KM/repodeck
                    </p>
                    <p className="text-muted-foreground mt-0.5 flex items-center gap-1.5 font-mono text-[11px]">
                      <GitBranch className="h-3 w-3" />
                      main
                    </p>
                  </div>
                </div>
                <span className="shrink-0 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 font-mono text-[10px] font-medium text-emerald-500">
                  cached
                </span>
              </div>

              <div className="grid grid-cols-[minmax(0,0.76fr)_minmax(0,1.24fr)]">
                <div className="border-border/60 bg-background/60 min-h-64 border-r p-3">
                  <div className="text-muted-foreground mb-3 flex items-center justify-between text-[10px] font-semibold tracking-wider uppercase">
                    <span>Explorer</span>
                    <span className="font-mono font-normal normal-case">
                      full tree
                    </span>
                  </div>
                  <div className="space-y-1 font-mono text-[11px]">
                    {DEMO_FILES.map((file) => (
                      <div
                        key={file.label}
                        className={`text-muted-foreground flex items-center gap-1.5 rounded-md px-2 py-1.5 ${
                          file.nested ? "pl-5" : ""
                        } ${file.label === "src" ? "text-foreground bg-muted/60 font-semibold" : ""}`}
                      >
                        {file.kind === "folder" ? (
                          file.label === "src" ? (
                            <ChevronRight className="text-primary h-3 w-3 rotate-90" />
                          ) : (
                            <Folder className="h-3.5 w-3.5 text-amber-400/80" />
                          )
                        ) : (
                          <FileCode2 className="h-3.5 w-3.5 text-sky-400/80" />
                        )}
                        <span>{file.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#090d14] p-4 font-mono text-[11px] leading-relaxed">
                  <div className="text-muted-foreground/70 mb-4 flex items-center gap-2 border-b border-white/10 pb-3">
                    <FileCode2 className="h-3.5 w-3.5 text-sky-400" />
                    <span className="text-[#edf7f7]">README.md</span>
                    <span className="truncate text-[10px]">· cached file</span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[#f472b6]"># RepoDeck</p>
                    <p className="text-[#d1d5db]">A focused, read-only</p>
                    <p className="text-[#d1d5db]">GitHub repository viewer.</p>
                    <p className="text-[#6b7280]">{"// Read the whole project"}</p>
                    <p className="text-[#34d399]">
                      without cloning it locally.
                    </p>
                  </div>
                  <div className="text-muted-foreground/60 mt-8 flex items-center gap-2 border-t border-white/10 pt-3 text-[10px]">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span>tree loaded from server cache</span>
                  </div>
                </div>
              </div>

              <div className="border-border/60 flex items-center justify-between border-t px-4 py-3">
                <div className="text-muted-foreground flex items-center gap-2 text-[10px]">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Visitors read the same cached snapshot</span>
                </div>
                <a
                  href={REPODECK_DEMO_ROUTE}
                  className="text-primary hover:text-primary/80 inline-flex items-center gap-1 text-[11px] font-semibold transition-colors"
                >
                  Open route
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            <a
              href={REPODECK_GITHUB_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="text-muted-foreground hover:text-foreground mt-3 inline-flex items-center gap-1.5 px-1 text-[11px] transition-colors"
            >
              <Github className="h-3.5 w-3.5" />
              View the source on GitHub
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>

      <div className="border-border/60 mx-auto mt-14 flex max-w-4xl flex-col items-start justify-between gap-4 border-y px-4 py-4 text-xs sm:flex-row sm:items-center sm:px-6 lg:px-8">
        <div className="text-muted-foreground inline-flex items-center gap-2">
          <RefreshCw className="text-primary h-3.5 w-3.5" />
          <span>
            Cache refreshes happen on the server, not in each visitor&apos;s
            browser.
          </span>
        </div>
        <div className="text-muted-foreground inline-flex items-center gap-2">
          <LockKeyhole className="h-3.5 w-3.5 text-emerald-500" />
          <span>Source stays read-only</span>
        </div>
      </div>
    </section>
  );
}
