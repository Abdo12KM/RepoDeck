"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

const FAQS = [
  {
    question: "Do I need a GitHub account to use RepoDeck?",
    answer:
      "No! You can browse any public GitHub repository anonymously without signing in. Simply paste a GitHub repository URL or type owner/repo into the quick launcher.",
  },
  {
    question: "How does RepoDeck access private repositories securely?",
    answer:
      "RepoDeck integrates via a dedicated GitHub App rather than asking for broad personal access tokens (PATs). When you connect your account, you explicitly select which repositories the app can read. RepoDeck only requires read-only metadata and contents permissions and never requests write or admin access.",
  },
  {
    question: "Does RepoDeck clone or store my repository code?",
    answer:
      "Never. RepoDeck streams file content and directory trees directly from GitHub APIs on demand. No repository code is stored, indexed in background databases, or retained on servers.",
  },
  {
    question: "Can I use RepoDeck on mobile phones and tablets?",
    answer:
      "Yes, RepoDeck is engineered with a mobile-first responsive layout. It features swipeable drawer menus for directory navigation, touch-friendly hit areas, and optimized typography for reviewing code on screens of any size.",
  },
  {
    question: "How does the file tree stay fast on huge repositories?",
    answer:
      "RepoDeck uses `@tanstack/react-virtual` to virtualize the file tree DOM elements. Whether a repository contains 50 files or 150,000 files, only the currently visible rows are rendered in the browser DOM, ensuring smooth 60fps scrolling and rapid folder toggling.",
  },
  {
    question: "Can I share direct links to specific files and branches?",
    answer:
      "Yes. The entire application state (owner, repo, branch ref, and selected file path) is continuously synchronized with the URL search query parameters. You can copy the URL in your browser at any time and send it directly to a teammate.",
  },
];

export function LandingFaq() {
  return (
    <section id="faq" className="py-20 sm:py-28">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <Badge
            variant="outline"
            className="text-primary border-primary/30 mb-3 px-3 py-1 text-xs font-semibold tracking-widest uppercase"
          >
            FAQ
          </Badge>
          <h2 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground mt-4 text-base leading-relaxed">
            Have questions about how RepoDeck works? Here are answers to our
            most common inquiries.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-3">
          {FAQS.map((faq, idx) => (
            <AccordionItem
              key={idx}
              value={`item-${idx}`}
              className="border-border/80 bg-card/60 data-[state=open]:border-primary/40 rounded-xl border px-5 backdrop-blur-sm transition-all data-[state=open]:shadow-md"
            >
              <AccordionTrigger className="text-foreground py-4 text-left text-sm font-semibold hover:no-underline sm:text-base">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pt-1 pb-4 text-sm leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
