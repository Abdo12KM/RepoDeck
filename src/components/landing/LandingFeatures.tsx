"use client";

import {
  Zap,
  ShieldCheck,
  FolderTree,
  Smartphone,
  Sparkles,
  Command,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const FEATURES = [
  {
    icon: Zap,
    title: "Zero Local Clones",
    badge: "0 MB",
    description:
      "Browse multi-gigabyte codebases in seconds without cloning to disk or filling your local storage. Just paste a link and start reading.",
  },
  {
    icon: Sparkles,
    title: "18 Shiki 3 Syntax Themes",
    badge: "TextMate",
    description:
      "Accurate TextMate grammar highlighting with 18 verified themes including Vesper, Synthwave '84, Tokyo Night, Catppuccin, Gruvbox, and Dracula.",
  },
  {
    icon: FolderTree,
    title: "60fps Virtualized File Tree",
    badge: "TanStack Virtual",
    description:
      "Powered by @tanstack/react-virtual, the file explorer effortlessly handles 100,000+ files with smooth scrolling, instant folder expansion, and zero DOM bloat.",
  },
  {
    icon: Command,
    title: "⌘K Quick Switcher & Palette",
    badge: "⌘K / Ctrl+K",
    description:
      "Fuzzy search any file across the entire repository or jump instantly to your recently viewed files with fast keyboard shortcuts.",
  },
  {
    icon: Smartphone,
    title: "Engineered for Mobile & Touch",
    badge: "Responsive",
    description:
      "Review pull requests and study code on your commute. Intuitive bottom-sheet drawers, touch-friendly hit areas, and zero horizontal scroll overflow.",
  },
  {
    icon: ShieldCheck,
    title: "Granular GitHub App Security",
    badge: "Read-Only",
    description:
      "Connect private repositories with fine-grained, repository-level permissions. RepoDeck never edits code, writes commits, or asks for global PATs.",
  },
];

export function LandingFeatures() {
  return (
    <section id="features" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <Badge
            variant="outline"
            className="text-foreground border-border/80 mb-3 px-3 py-1 text-xs font-semibold tracking-widest uppercase"
          >
            Core Capabilities
          </Badge>
          <h2 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to read code with total clarity
          </h2>
          <p className="text-muted-foreground mt-4 text-base leading-relaxed">
            Eliminate the heavyweight baggage of traditional IDEs when all you
            want to do is explore, inspect, and understand a repository.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <Card
                key={feat.title}
                className="group border-border/80 bg-card/80 hover:border-border hover:bg-card relative transition-all hover:shadow-sm"
              >
                <CardContent className="p-6">
                  {/* Icon & Badge */}
                  <div className="mb-4 flex items-center justify-between">
                    <div className="border-border/70 bg-muted/50 text-foreground flex h-10 w-10 items-center justify-center rounded-lg border">
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <Badge
                      variant="outline"
                      className="text-muted-foreground font-mono text-[10px]"
                    >
                      {feat.badge}
                    </Badge>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-foreground text-base font-semibold tracking-tight">
                    {feat.title}
                  </h3>
                  <p className="text-muted-foreground mt-2 text-xs leading-relaxed sm:text-sm">
                    {feat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
