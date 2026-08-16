"use client";

import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronRight,
  ExternalLink,
  Github,
  Link2,
  LockKeyhole,
  Smartphone,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { LandingV2Header } from "./LandingV2Header";
import { LandingEventDisplay } from "./LandingEventDisplay";
import { LandingMobilePreview } from "./LandingMobilePreview";
import { LandingRepositoryProbe } from "./LandingRepositoryProbe";
import styles from "./LandingV2Page.module.css";

/*
 * Direction contract — event-display reader
 * Thesis: RepoDeck makes the exact repository path the hero object.
 * World: a dark technical instrument panel with cyan, yellow, and red signal accents.
 * Story: paste the reference, follow the file signal, share the exact path.
 * First viewport: show the repository probe and a believable reader state together.
 * Finish: return the reader to its smallest promise — bring the URL, leave the clone.
 */

const READ_STAGES = [
  {
    number: "01",
    title: "Paste the reference",
    description: "Use owner/repository, a GitHub URL, or a direct tree and file link.",
    icon: Link2,
  },
  {
    number: "02",
    title: "Follow the signal",
    description: "Move through branches, folders, tabs, Markdown, images, and code without leaving the reader.",
    icon: ChevronRight,
  },
  {
    number: "03",
    title: "Share the exact path",
    description: "The repository, branch, and selected file stay addressable in the URL.",
    icon: ExternalLink,
  },
];

export function LandingV2Page() {
  const { authenticated, signIn } = useAuth();

  return (
    <div className={styles.page}>
      <a href="#landing-main" className={styles.skipLink}>
        Skip to content
      </a>
      <LandingV2Header />

      <main id="landing-main">
        <section className={styles.hero}>
          <div className={styles.heroGrid}>
            <div className={styles.heroCopy}>
              <p className={styles.eyebrow}>RepoDeck / read-only code viewer</p>
              <h1 className={styles.heroTitle}>
                Read the repository.
                <span>Keep the rest of the machine closed.</span>
              </h1>
              <p className={styles.heroLead}>
                Open a GitHub repository in a focused reader built for the moment you need one file, one branch, or one answer. No clone required. No editor chrome to work around.
              </p>
              <LandingRepositoryProbe />
              <div className={styles.heroTrust}>
                <span><Check aria-hidden="true" size={14} /> Public repositories open anonymously</span>
                <span><LockKeyhole aria-hidden="true" size={14} /> Private access stays read-only</span>
              </div>
            </div>

            <div className={styles.heroDisplay}>
              <LandingEventDisplay />
              <p className={styles.displayNote}>
                The same workspace narrows cleanly on a phone. File navigation becomes a thumb-reachable map, while the selected file keeps the reading surface.
              </p>
            </div>
          </div>

          <div className={styles.heroRail} role="group" aria-label="RepoDeck product boundaries">
            <span>GitHub API, server-side</span>
            <span>0 local clones</span>
            <span>URL-addressable state</span>
            <span>Desktop, tablet, mobile</span>
          </div>
        </section>

        <section className={styles.readPathSection} id="read-path">
          <div className={styles.sectionIntro}>
            <h2>Open the part you came for.</h2>
            <p>
              RepoDeck is shaped around reading, not setting up a second development environment. The route stays small so the content can stay legible.
            </p>
          </div>

          <ol className={styles.stageList}>
            {READ_STAGES.map((stage) => {
              const Icon = stage.icon;
              return (
                <li key={stage.number} className={styles.stageItem}>
                  <span className={styles.stageNumber}>{stage.number}</span>
                  <div className={styles.stageContent}>
                    <div className={styles.stageTitle}>
                      <Icon aria-hidden="true" size={17} />
                      <h3>{stage.title}</h3>
                    </div>
                    <p>{stage.description}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        <section className={styles.mobileSection} id="mobile">
          <div className={styles.mobileCopy}>
            <h2>Bring the file map with you.</h2>
            <p>
              A phone is often where a quick inspection happens. RepoDeck keeps the repository tree, code controls, and current branch within a thumb-friendly flow instead of shrinking a desktop workspace until it becomes a puzzle.
            </p>
            <ul className={styles.checkList}>
              <li><Smartphone aria-hidden="true" size={17} /> File tree in a drawer when space is tight</li>
              <li><Check aria-hidden="true" size={17} /> Code tools sized for touch and short sessions</li>
              <li><Check aria-hidden="true" size={17} /> Bottom navigation keeps the next action close</li>
            </ul>
          </div>
          <div className={styles.mobileDemo}>
            <LandingMobilePreview />
          </div>
        </section>

        <section className={styles.accessSection} id="access">
          <div className={styles.accessHeader}>
            <h2>Public by default. Private by selection.</h2>
            <p>
              Anonymous browsing stays open for public repositories. Private access is a separate GitHub App flow with the repository permissions GitHub shows you before you connect it.
            </p>
          </div>
          <div className={styles.accessDetails}>
            <div className={styles.accessColumn}>
              <span className={styles.accessIndex}>PUBLIC</span>
              <h3>Start without signing in</h3>
              <p>Paste a public repository or a direct file URL and RepoDeck resolves the branch and path for you.</p>
              <Link href="/repositories" className={styles.inlineLink}>
                Open a public repository <ArrowRight aria-hidden="true" size={15} />
              </Link>
            </div>
            <div className={styles.accessColumn}>
              <span className={styles.accessIndex}>PRIVATE</span>
              <h3>Select what the App can read</h3>
              <p>RepoDeck asks GitHub for metadata and contents read-only access. It does not edit, commit, push, or run repository code.</p>
              {!authenticated ? (
                <button type="button" className={styles.inlineButton} onClick={() => signIn()}>
                  <Github aria-hidden="true" size={15} />
                  Sign in with GitHub
                </button>
              ) : (
                <Link href="/repositories" className={styles.inlineLink}>
                  Open your viewer <ArrowRight aria-hidden="true" size={15} />
                </Link>
              )}
            </div>
          </div>
        </section>

        <section className={styles.closeSection}>
          <div className={styles.closeMark} aria-hidden="true" />
          <h2>Bring the URL. Leave the clone.</h2>
          <p>Open a repository now, then keep the exact branch and file path ready to share.</p>
          <Link href="/repositories" className={styles.closeCta}>
            Open the repository viewer
            <ArrowRight aria-hidden="true" size={17} />
          </Link>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <Link href="/landing" className={styles.footerBrand}>
            RepoDeck
          </Link>
          <p>Read-only GitHub repository viewer.</p>
          <div className={styles.footerLinks}>
            <Link href="/repositories">Open viewer</Link>
            <a href="https://github.com" target="_blank" rel="noreferrer noopener">
              GitHub <ExternalLink aria-hidden="true" size={13} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
