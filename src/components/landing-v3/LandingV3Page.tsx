"use client";

import { LandingV3Header } from "./LandingV3Header";
import { LandingV3Hero } from "./LandingV3Hero";
import { LandingV3ThemeStudio } from "./LandingV3ThemeStudio";
import { LandingV3SecurityBoundary } from "./LandingV3SecurityBoundary";
import { LandingV3Faq } from "./LandingV3Faq";
import { LandingV3Cta } from "./LandingV3Cta";
import { LandingV3Footer } from "./LandingV3Footer";

export function LandingV3Page() {
  return (
    <div className="bg-background text-foreground selection:bg-primary/20 selection:text-primary flex min-h-screen flex-col scroll-smooth antialiased">
      {/* Skip to Main Content Link for A11y */}
      <a
        href="#landing-v3-main"
        className="focus:bg-primary focus:text-primary-foreground sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:px-4 focus:py-2 focus:text-xs focus:font-bold focus:shadow-xl focus:outline-hidden"
      >
        Skip to main content
      </a>

      {/* Main Header */}
      <LandingV3Header />

      {/* Main landing flow */}
      <main id="landing-v3-main" className="flex-1">
        <LandingV3Hero />
        <LandingV3ThemeStudio />
        <LandingV3SecurityBoundary />
        <LandingV3Faq />
        <LandingV3Cta />
      </main>

      {/* Footer */}
      <LandingV3Footer />
    </div>
  );
}
