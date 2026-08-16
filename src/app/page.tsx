import type { Metadata } from "next";
import { LandingV3Page } from "@/components/landing-v3";

export const metadata: Metadata = {
  title: "RepoDeck · Read GitHub repositories in a focused viewer",
  description:
    "Open RepoDeck itself in the real read-only viewer, then sign in to browse your own public or selected private repositories.",
  keywords: [
    "GitHub repository viewer",
    "Read GitHub code",
    "Read-only GitHub viewer",
    "Mobile GitHub code viewer",
    "Shiki syntax themes",
    "Online code explorer",
    "RepoDeck",
  ],
  openGraph: {
    title: "RepoDeck · Read GitHub repositories in a focused viewer",
    description:
      "Open the real RepoDeck demo route, with the full codebase served from a server-side cache.",
    type: "website",
    url: "https://repodeck.abdok.dev/",
  },
  twitter: {
    card: "summary_large_image",
    title: "RepoDeck · Read GitHub repositories in a focused viewer",
    description:
      "Open the real RepoDeck demo route, then sign in to browse your own repositories.",
  },
};

export default function RootPage() {
  return <LandingV3Page />;
}
