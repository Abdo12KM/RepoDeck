"use client";

import Link from "next/link";
import { ArrowRight, Github } from "lucide-react";
import { RepoDeckLogo } from "@/components/ui/RepoDeckLogo";
import { Button } from "@/components/ui/button";
import { REPODECK_DEMO_ROUTE, REPODECK_GITHUB_URL } from "./landing-v3-demo";

const NAV_LINKS = [
  { label: "Syntax Studio", href: "#syntax-studio" },
  { label: "Access", href: "#security" },
  { label: "FAQ", href: "#faq" },
];

export function LandingV3Header() {
  return (
    <header className="border-border/40 bg-background/80 sticky top-0 z-50 w-full border-b backdrop-blur-md transition-all">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="focus-visible:ring-primary flex items-center gap-2.5 rounded-lg p-1 outline-hidden transition-opacity hover:opacity-90 focus-visible:ring-2"
            aria-label="RepoDeck Home"
          >
            <RepoDeckLogo iconSize={36} />
          </Link>
        </div>

        {/* Desktop Nav Anchors */}
        <nav
          className="text-muted-foreground hidden items-center gap-1 text-xs font-medium lg:flex"
          aria-label="Main Navigation"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="hover:bg-muted/60 hover:text-foreground focus-visible:ring-primary rounded-md px-3 py-1.5 transition-colors focus-visible:ring-1 focus-visible:outline-hidden"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <a
            href={REPODECK_GITHUB_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="border-border/60 bg-muted/30 text-muted-foreground hover:border-border hover:bg-muted/70 hover:text-foreground focus-visible:ring-primary inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-all focus-visible:ring-1 focus-visible:outline-hidden"
            aria-label="View on GitHub"
          >
            <Github className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">GitHub</span>
          </a>

          <Button
            asChild
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90 h-8 gap-1.5 rounded-lg px-3 text-xs font-medium shadow-xs transition-all active:scale-98"
          >
            <a href={REPODECK_DEMO_ROUTE}>
              <span>Open demo</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}
