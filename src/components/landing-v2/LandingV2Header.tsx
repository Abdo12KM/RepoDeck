"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Github, Menu, X } from "lucide-react";
import { RepoDeckIcon } from "@/components/ui/RepoDeckLogo";
import { useAuth } from "@/hooks/useAuth";
import styles from "./LandingV2Page.module.css";

const NAV_LINKS = [
  { label: "Read path", href: "#read-path" },
  { label: "Mobile", href: "#mobile" },
  { label: "Access", href: "#access" },
];

export function LandingV2Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { authenticated, isLoading, signIn } = useAuth();

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={styles.nav}>
      <div className={styles.navInner}>
        <Link
          href="/landing"
          className={styles.brand}
          onClick={closeMenu}
          aria-label="RepoDeck landing page"
        >
          <RepoDeckIcon
            size={28}
            variant="flat"
            tint={false}
            alt=""
            className={styles.brandIcon}
          />
          <span>RepoDeck</span>
        </Link>

        <nav className={styles.desktopNav} aria-label="Landing page">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className={styles.navLink}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className={styles.navActions}>
          {!isLoading && !authenticated ? (
            <button type="button" className={styles.textButton} onClick={() => signIn()}>
              Sign in
            </button>
          ) : null}
          <Link href="/repositories" className={styles.navCta}>
            Open viewer
            <ArrowUpRight aria-hidden="true" size={15} />
          </Link>
          <button
            type="button"
            className={styles.menuButton}
            aria-expanded={menuOpen}
            aria-controls="landing-mobile-nav"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X aria-hidden="true" size={20} /> : <Menu aria-hidden="true" size={20} />}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div id="landing-mobile-nav" className={styles.mobileNav}>
          <nav aria-label="Mobile landing page">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} className={styles.mobileNavLink} onClick={closeMenu}>
                {link.label}
              </a>
            ))}
          </nav>
          <div className={styles.mobileNavRule} />
          <div className={styles.mobileNavActions}>
            {!isLoading && !authenticated ? (
              <button type="button" className={styles.mobileSecondaryButton} onClick={() => { closeMenu(); signIn(); }}>
                <Github aria-hidden="true" size={16} />
                Sign in with GitHub
              </button>
            ) : null}
            <Link href="/repositories" className={styles.mobilePrimaryButton} onClick={closeMenu}>
              Open repository viewer
              <ArrowUpRight aria-hidden="true" size={16} />
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
