"use client";

import React from "react";
import {
  FolderTree,
  Search,
  SlidersHorizontal,
  Smartphone,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { LandingV3InteractivePhone } from "./LandingV3InteractivePhone";

const MOBILE_FEATURES = [
  {
    icon: FolderTree,
    title: "Thumb-Reachable File Explorer",
    description:
      "A slide-up drawer keeps the entire repository tree accessible on mobile without cramped sidebars.",
  },
  {
    icon: SlidersHorizontal,
    title: "Dedicated Mobile Code Tools",
    description:
      "Toggle word wrap, line numbers, and font zoom with one touch so long lines never get cropped.",
  },
  {
    icon: Search,
    title: "Quick Switcher & Command Palette",
    description:
      "Jump between files, branches, and symbols on the go using instant fuzzy search.",
  },
  {
    icon: Zap,
    title: "Responsive loaded trees",
    description:
      "Virtualized scrolling keeps the full demo tree responsive. Sign in when you want to browse your own repositories.",
  },
];

export function LandingV3MobileExperience() {
  return (
    <section
      id="mobile-reader"
      className="border-border/40 bg-muted/10 relative border-t py-16 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left Column: Value Copy & Interactive Feature Highlights */}
          <div className="space-y-6 lg:col-span-6">
            <div className="border-primary/20 bg-primary/5 text-primary inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-xs font-medium">
              <Smartphone className="h-3.5 w-3.5" />
              <span>Mobile-First Code Reader</span>
            </div>

            <h2 className="text-foreground text-2xl font-bold tracking-tight [text-wrap:balance] sm:text-4xl">
              Code reading that actually works on a phone.
            </h2>

            <p className="text-muted-foreground text-sm leading-relaxed [text-wrap:pretty] sm:text-base">
              Inspecting code on mobile shouldn&apos;t mean pinching and
              horizontal-scrolling through a broken desktop UI. RepoDeck adapts
              into a responsive instrument with bottom navigation, slide
              drawers, and word-wrapping.
            </p>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 gap-3.5 pt-2 sm:grid-cols-2">
              {MOBILE_FEATURES.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="border-border/70 bg-card rounded-xl border p-4 shadow-2xs"
                  >
                    <div className="bg-primary/10 text-primary mb-2 flex h-7 w-7 items-center justify-center rounded-lg">
                      <Icon className="h-4 w-4" />
                    </div>
                    <h3 className="text-foreground text-xs font-bold">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground mt-1 text-[11px] leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Interactive Notice */}
            <div className="border-primary/20 bg-primary/5 text-foreground/90 flex items-center gap-2 rounded-lg border px-3 py-2 text-xs">
              <span className="bg-primary h-1.5 w-1.5 animate-pulse rounded-full" />
              <span>
                Interactive phone replica: tap <strong>Files</strong>,{" "}
                <strong>Tools</strong>, or <strong>Search</strong> to try it.
              </span>
            </div>
          </div>

          {/* Right Column: The Exact Interactive Phone Demo Replica */}
          <div className="flex justify-center lg:col-span-6">
            <LandingV3InteractivePhone />
          </div>
        </div>
      </div>
    </section>
  );
}
