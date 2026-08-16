"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Code2, Database, Layers, Sparkles, Zap, Palette } from "lucide-react";

const TECH_STACK = [
  {
    name: "Next.js 16 App Router",
    role: "Fullstack Framework",
    description:
      "Server components, streaming route handlers, and zero-bundle server logic.",
    icon: Zap,
    color: "text-foreground",
  },
  {
    name: "React 19 & TypeScript",
    role: "Component Architecture",
    description:
      "Strict types, concurrent UI transitions, and robust modern state handling.",
    icon: Code2,
    color: "text-cyan-500",
  },
  {
    name: "Tailwind CSS v4",
    role: "Modern Styling Engine",
    description:
      "High-performance CSS compilation with unified OKLCH theme color tokens.",
    icon: Palette,
    color: "text-sky-500",
  },
  {
    name: "Shiki 3",
    role: "Syntax Highlighting",
    description:
      "TextMate grammar parser providing studio-grade highlighting identical to VS Code.",
    icon: Sparkles,
    color: "text-purple-500",
  },
  {
    name: "Neon Postgres & Drizzle",
    role: "Serverless Database",
    description:
      "Instant branching Postgres with type-safe schema definitions and zero connection lag.",
    icon: Database,
    color: "text-emerald-500",
  },
  {
    name: "@tanstack/react-virtual",
    role: "Tree Virtualization",
    description:
      "Renders huge directories at 60fps with tiny DOM memory footprint.",
    icon: Layers,
    color: "text-amber-500",
  },
];

export function LandingTechStack() {
  return (
    <section
      id="stack"
      className="border-border/60 bg-muted/10 border-t py-20 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <Badge
            variant="outline"
            className="text-primary border-primary/30 mb-3 px-3 py-1 text-xs font-semibold tracking-widest uppercase"
          >
            Engineering Foundation
          </Badge>
          <h2 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
            Built with modern web technologies
          </h2>
          <p className="text-muted-foreground mt-4 text-base leading-relaxed">
            Crafted with an uncompromising focus on speed, developer ergonomics,
            and rock-solid stability.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {TECH_STACK.map((tech) => {
            const Icon = tech.icon;
            return (
              <Card
                key={tech.name}
                className="border-border/80 bg-card/60 hover:border-primary/40 backdrop-blur-xs transition-all duration-200"
              >
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="bg-muted border-border/60 flex h-10 w-10 items-center justify-center rounded-xl border">
                      <Icon className={`h-5 w-5 ${tech.color}`} />
                    </div>
                    <div>
                      <h3 className="text-foreground text-sm font-bold">
                        {tech.name}
                      </h3>
                      <p className="text-muted-foreground font-mono text-[11px]">
                        {tech.role}
                      </p>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    {tech.description}
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
