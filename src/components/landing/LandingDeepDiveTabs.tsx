"use client";

import {
  Globe,
  Lock,
  Smartphone,
  GitFork,
  ArrowRight,
  ShieldAlert,
  CheckCircle,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export function LandingDeepDiveTabs() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <Badge
            variant="outline"
            className="text-primary border-primary/30 mb-3 px-3 py-1 text-xs font-semibold tracking-widest uppercase"
          >
            Deep Dive
          </Badge>
          <h2 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
            Precision engineered for every code inspection scenario
          </h2>
          <p className="text-muted-foreground mt-4 text-base leading-relaxed">
            Explore how RepoDeck delivers an exceptional developer experience
            whether you are inspecting public libraries or auditing private
            enterprise services.
          </p>
        </div>

        <Tabs defaultValue="public" className="w-full">
          <div className="mb-10 flex max-w-full justify-start px-1 sm:justify-center">
            <TabsList className="bg-muted/60 border-border/80 h-11 rounded-xl border p-1">
              <TabsTrigger
                value="public"
                className="data-[state=active]:bg-card gap-2 rounded-lg px-4 py-2 text-xs font-medium data-[state=active]:shadow-sm sm:text-sm"
              >
                <Globe className="text-primary h-4 w-4" />
                <span>Public Repositories</span>
              </TabsTrigger>
              <TabsTrigger
                value="private"
                className="data-[state=active]:bg-card gap-2 rounded-lg px-4 py-2 text-xs font-medium data-[state=active]:shadow-sm sm:text-sm"
              >
                <Lock className="h-4 w-4 text-emerald-500" />
                <span>Private GitHub App</span>
              </TabsTrigger>
              <TabsTrigger
                value="mobile"
                className="data-[state=active]:bg-card gap-2 rounded-lg px-4 py-2 text-xs font-medium data-[state=active]:shadow-sm sm:text-sm"
              >
                <Smartphone className="h-4 w-4 text-purple-500" />
                <span>Mobile & Touch UX</span>
              </TabsTrigger>
              <TabsTrigger
                value="branching"
                className="data-[state=active]:bg-card gap-2 rounded-lg px-4 py-2 text-xs font-medium data-[state=active]:shadow-sm sm:text-sm"
              >
                <GitFork className="h-4 w-4 text-amber-500" />
                <span>Branch & Path Deep-links</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Public Repos Tab */}
          <TabsContent value="public" className="outline-hidden">
            <div className="border-border/80 bg-card grid grid-cols-1 items-center gap-8 rounded-2xl border p-6 shadow-lg sm:p-10 lg:grid-cols-12">
              <div className="space-y-4 lg:col-span-6">
                <Badge variant="secondary" className="text-primary text-xs">
                  Zero Sign-in Barrier
                </Badge>
                <h3 className="text-foreground text-2xl font-bold">
                  Paste any GitHub link and start reading immediately
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  You do not need to sign in, create an account, or configure
                  SSH keys to view public code. Paste full URLs like
                  `github.com/vercel/next.js/blob/canary/packages/next/src/server/base-server.ts`
                  and jump directly to that exact file and branch.
                </p>
                <ul className="text-muted-foreground space-y-2.5 pt-2 text-xs">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="text-primary h-4 w-4" />
                    <span>
                      Instant automatic resolution of default and custom branch
                      names
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="text-primary h-4 w-4" />
                    <span>
                      Real-time file search by filename or folder path
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="text-primary h-4 w-4" />
                    <span>
                      Copy file contents, raw code, or deep links with a single
                      click
                    </span>
                  </li>
                </ul>
                <div className="pt-4">
                  <Button asChild className="gap-2">
                    <Link href="/repositories">
                      Try Public Repo <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="border-border/80 bg-muted/30 rounded-xl border p-5 font-mono text-xs lg:col-span-6">
                <div className="border-border/60 text-muted-foreground mb-3 flex items-center justify-between border-b pb-3">
                  <span>URL Parser Input</span>
                  <Badge variant="outline" className="text-[10px]">
                    auto-detect
                  </Badge>
                </div>
                <div className="bg-background text-primary mb-3 truncate rounded-lg border p-3 font-semibold">
                  https://github.com/shadcn-ui/ui/blob/main/packages/cli/src/index.ts
                </div>
                <div className="text-muted-foreground space-y-1.5 text-[11px]">
                  <div>
                    ✓ Owner: <span className="text-foreground">shadcn-ui</span>
                  </div>
                  <div>
                    ✓ Repo: <span className="text-foreground">ui</span>
                  </div>
                  <div>
                    ✓ Branch: <span className="text-foreground">main</span>
                  </div>
                  <div>
                    ✓ Path:{" "}
                    <span className="text-foreground">
                      packages/cli/src/index.ts
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Private Repos Tab */}
          <TabsContent value="private" className="outline-hidden">
            <div className="border-border/80 bg-card grid grid-cols-1 items-center gap-8 rounded-2xl border p-6 shadow-lg sm:p-10 lg:grid-cols-12">
              <div className="space-y-4 lg:col-span-6">
                <Badge variant="secondary" className="text-xs text-emerald-500">
                  Enterprise-Grade Security
                </Badge>
                <h3 className="text-foreground text-2xl font-bold">
                  Read-only GitHub App with repository-level access control
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Traditional tools often demand full account Personal Access
                  Tokens (PATs) that carry excessive risk. RepoDeck uses modern
                  GitHub App installation workflows with strictly read-only
                  repository permissions.
                </p>
                <ul className="text-muted-foreground space-y-2.5 pt-2 text-xs">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    <span>
                      Choose specifically which repositories the app can read
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    <span>
                      AES-GCM token encryption with secure session cookie
                      validation
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    <span>
                      Zero repository code storage or caching in background
                      databases
                    </span>
                  </li>
                </ul>
                <div className="pt-4">
                  <Button asChild className="gap-2">
                    <Link href="/repositories">
                      Connect Private Repos <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="border-border/80 bg-muted/30 rounded-xl border p-5 text-xs lg:col-span-6">
                <div className="mb-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
                  <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-emerald-500">
                    <ShieldAlert className="h-4 w-4" />
                    <span>Strict Permission Sandbox</span>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Metadata: Read-only
                    <br />
                    Contents: Read-only
                    <br />
                    Pull Requests / Issues / Administration: No access
                  </p>
                </div>
                <p className="text-muted-foreground font-mono text-[11px]">
                  All requests execute securely server-side without exposing API
                  credentials to client scripts.
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Mobile & Touch UX Tab */}
          <TabsContent value="mobile" className="outline-hidden">
            <div className="border-border/80 bg-card grid grid-cols-1 items-center gap-8 rounded-2xl border p-6 shadow-lg sm:p-10 lg:grid-cols-12">
              <div className="space-y-4 lg:col-span-6">
                <Badge variant="secondary" className="text-xs text-purple-500">
                  Native Mobile Flow
                </Badge>
                <h3 className="text-foreground text-2xl font-bold">
                  Read, review, and search code anywhere on the go
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Code review shouldn&apos;t be confined to a desk. RepoDeck
                  provides a first-class mobile interface featuring
                  touch-optimized drawer menus, safe area support for iOS
                  notches, and seamless code scrolling.
                </p>
                <ul className="text-muted-foreground space-y-2.5 pt-2 text-xs">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-purple-500" />
                    <span>
                      Full virtualized file hierarchy in slide-over drawers
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-purple-500" />
                    <span>
                      Horizontal scrollable code blocks with font scaling
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-purple-500" />
                    <span>
                      Instant theme toggle for day/night reading comfort
                    </span>
                  </li>
                </ul>
              </div>

              <div className="flex justify-center lg:col-span-6">
                <div className="border-border bg-background w-full max-w-sm rounded-2xl border p-4 shadow-xl">
                  <div className="mb-3 flex items-center justify-between border-b pb-2 text-xs font-semibold">
                    <span>Mobile Tree Sheet</span>
                    <Badge variant="outline" className="text-[10px]">
                      active
                    </Badge>
                  </div>
                  <div className="space-y-2 font-mono text-xs">
                    <div className="bg-muted flex items-center justify-between rounded p-2">
                      <span>📁 src/app</span>
                      <span className="text-muted-foreground text-[10px]">
                        3 files
                      </span>
                    </div>
                    <div className="bg-primary/10 text-primary flex items-center justify-between rounded p-2">
                      <span>📄 page.tsx</span>
                      <span className="text-[10px] font-bold">Viewing</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Branch & Deep-links Tab */}
          <TabsContent value="branching" className="outline-hidden">
            <div className="border-border/80 bg-card grid grid-cols-1 items-center gap-8 rounded-2xl border p-6 shadow-lg sm:p-10 lg:grid-cols-12">
              <div className="space-y-4 lg:col-span-6">
                <Badge variant="secondary" className="text-xs text-amber-500">
                  Shareable State
                </Badge>
                <h3 className="text-foreground text-2xl font-bold">
                  Every file, branch, and state is fully addressable via URL
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  RepoDeck synchronizes viewer state with URL search parameters.
                  Bookmark files, share exact branches with teammates, or embed
                  direct viewer links in issues and PR discussions.
                </p>
                <ul className="text-muted-foreground space-y-2.5 pt-2 text-xs">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-amber-500" />
                    <span>
                      Fast branch switching with automatic ref synchronization
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-amber-500" />
                    <span>
                      State persisted in URL queries: `owner`, `repo`, `ref`,
                      `path`
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-amber-500" />
                    <span>
                      Image viewer with zoom and transparent checkerboard
                      preview
                    </span>
                  </li>
                </ul>
              </div>

              <div className="border-border/80 bg-muted/30 rounded-xl border p-5 font-mono text-xs lg:col-span-6">
                <p className="text-muted-foreground mb-2 font-semibold">
                  Shareable Deep Link Format:
                </p>
                <div className="bg-background mb-4 rounded-lg border p-3 text-xs break-all text-amber-500">
                  https://repodeck.abdok.dev/repositories?owner=vercel&repo=next.js&ref=canary&path=packages%2Fnext%2Fpackage.json
                </div>
                <p className="text-muted-foreground text-[11px]">
                  Anyone who clicks this link will directly open the canary
                  branch and load `packages/next/package.json` with zero extra
                  steps.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
