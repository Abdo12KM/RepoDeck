"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

const FAQ_ITEMS = [
  {
    question: "What is the RepoDeck demo?",
    answer:
      "It is a real /repositories route opened on Abdo12KM/repodeck at main. You can browse the same full tree and file reader used for other repositories, with the RepoDeck public snapshot preloaded into the server cache.",
  },
  {
    question: "Does every demo visitor call GitHub?",
    answer:
      "No. The demo route reads its tree and file contents from the database cache. The server can refresh that fixed public snapshot when it is stale, but visitors do not each probe GitHub while exploring the demo.",
  },
  {
    question: "Does RepoDeck clone repositories to my local machine?",
    answer:
      "No. RepoDeck does not execute git clone or write repository files to your machine. It requests file trees and contents from GitHub as you read them.",
  },
  {
    question: "How does mobile code reading work in RepoDeck?",
    answer:
      "RepoDeck includes a dedicated mobile interface with bottom navigation tabs (Files, Search, Code, Branch), slide-up file tree drawers, word-wrap toggles, and font zoom controls so code remains legible on any screen size.",
  },
  {
    question: "How are private repositories protected?",
    answer:
      "Private repository access uses a GitHub App with repository-level read-only permissions (Metadata: Read-only, Contents: Read-only). Access tokens are encrypted with AES-256-GCM before storage in Postgres, and responses are marked private, no-store.",
  },
  {
    question: "How do I browse my own repositories?",
    answer:
      "Sign in with GitHub from the landing page. Your authenticated access is used for your public repositories, and you can connect selected private repositories through RepoDeck's read-only GitHub App installation.",
  },
  {
    question: "Are file paths and branches shareable with my team?",
    answer:
      "Yes. The repository, branch, and active file path are synchronized into the URL (for example, /repositories?owner=Abdo12KM&repo=repodeck&ref=main&path=README.md). Anyone with access to that repository can open the same file.",
  },
];

export function LandingV3Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      id="faq"
      className="border-border/40 relative border-t py-16 sm:py-24"
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Section Intro */}
        <div className="space-y-3 text-center">
          <div className="border-primary/20 bg-primary/5 text-primary inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-xs font-medium">
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Frequently Asked Questions</span>
          </div>

          <h2 className="text-foreground text-2xl font-bold tracking-tight [text-wrap:balance] sm:text-4xl">
            Everything you need to know.
          </h2>

          <p className="text-muted-foreground text-sm leading-relaxed [text-wrap:pretty]">
            Clear answers about the real demo route, caching, and read-only
            access.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="mt-10 space-y-3">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={item.question}
                className="border-border/80 bg-card hover:border-border overflow-hidden rounded-xl border transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(index)}
                  className="text-foreground focus-visible:ring-primary flex w-full cursor-pointer items-center justify-between p-4.5 text-left text-sm font-bold transition-colors focus-visible:ring-2 focus-visible:outline-hidden sm:text-base"
                  aria-expanded={isOpen}
                >
                  <span className="pr-4">{item.question}</span>
                  <ChevronDown
                    className={cn(
                      "text-muted-foreground h-4 w-4 shrink-0 transition-transform duration-200",
                      isOpen && "text-primary rotate-180",
                    )}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      className="border-border/40 bg-muted/10 overflow-hidden border-t"
                    >
                      <div className="text-muted-foreground px-4.5 pt-2.5 pb-4.5 text-xs leading-relaxed sm:text-sm">
                        <p>{item.answer}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
