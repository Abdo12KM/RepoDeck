"use client";

import Link from "next/link";
import { Github, Command } from "lucide-react";
import { RepoDeckIcon } from "@/components/ui/RepoDeckLogo";
import { Badge } from "@/components/ui/badge";
import { Kbd } from "@/components/ui/kbd";

export function LandingFooter() {
  return (
    <footer className="border-border/60 bg-muted/20 border-t py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <RepoDeckIcon size={30} className="h-7.5 w-7.5" />
              <span className="text-base font-bold tracking-tight">
                RepoDeck
              </span>
              <Badge variant="outline" className="font-mono text-[10px]">
                v0.1.0
              </Badge>
            </Link>
            <p className="text-muted-foreground max-w-sm text-xs leading-relaxed">
              A focused, responsive GitHub repository viewer for reading code
              comfortably across desktop, tablet, and mobile devices without
              local clones.
            </p>
            <div className="text-muted-foreground touch-hidden flex items-center gap-2 pt-1 text-xs">
              <Kbd className="inline-flex items-center gap-1 font-mono text-[10px]">
                <Command className="h-2.5 w-2.5" /> K
              </Kbd>
              <span>Quick file & repo navigation inside the viewer</span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-foreground mb-3 text-xs font-bold tracking-wider uppercase">
              Navigation
            </h4>
            <ul className="text-muted-foreground space-y-2 text-xs">
              <li>
                <a
                  href="#features"
                  className="hover:text-foreground transition-colors"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#syntax-studio"
                  className="hover:text-foreground transition-colors"
                >
                  Syntax Studio
                </a>
              </li>
              <li>
                <a
                  href="#demo"
                  className="hover:text-foreground transition-colors"
                >
                  Interactive Demo
                </a>
              </li>
              <li>
                <a
                  href="#workflow"
                  className="hover:text-foreground transition-colors"
                >
                  Workflow Comparison
                </a>
              </li>
              <li>
                <a
                  href="#stack"
                  className="hover:text-foreground transition-colors"
                >
                  Tech Stack
                </a>
              </li>
              <li>
                <a
                  href="#faq"
                  className="hover:text-foreground transition-colors"
                >
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Product & Legal */}
          <div>
            <h4 className="text-foreground mb-3 text-xs font-bold tracking-wider uppercase">
              Application
            </h4>
            <ul className="text-muted-foreground space-y-2 text-xs">
              <li>
                <Link
                  href="/repositories"
                  className="hover:text-foreground transition-colors"
                >
                  Open Repository Viewer
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground flex items-center gap-1 transition-colors"
                >
                  <Github className="h-3 w-3" /> GitHub
                </a>
              </li>
              <li>
                <span className="text-muted-foreground/60">
                  Read-Only GitHub App
                </span>
              </li>
              <li>
                <span className="text-muted-foreground/60">
                  Next.js 16 App Router
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-border/60 text-muted-foreground flex flex-col items-center justify-between gap-4 border-t pt-6 text-xs sm:flex-row">
          <p>
            © {new Date().getFullYear()} RepoDeck. Crafted for reading code with
            total ease.
          </p>
          <div className="flex items-center gap-4 text-xs">
            <span>Built with Next.js, React 19, Shiki & Tailwind CSS v4</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
