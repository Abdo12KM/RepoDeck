"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, ChevronDown, Code2, Files, Search, Settings2 } from "lucide-react";
import styles from "./LandingV2Page.module.css";

export function LandingMobilePreview() {
  const [view, setView] = useState<"files" | "code">("files");

  return (
    <div className={styles.phoneFrame}>
      <div className={styles.phoneSpeaker} aria-hidden="true" />
      <div className={styles.phoneScreen}>
        <div className={styles.phoneHeader}>
          <div>
            <span className={styles.phoneKicker}>RepoDeck</span>
            <strong>next.js</strong>
          </div>
          <span className={styles.phoneBranch}>canary</span>
        </div>

        <div className={styles.phoneContent}>
          {view === "files" ? (
            <div className={styles.phoneFiles}>
              <div className={styles.phoneSectionTitle}>
                <span>Repository files</span>
                <Search aria-hidden="true" size={15} />
              </div>
              <div className={styles.phoneFolder}>
                <ChevronDown aria-hidden="true" size={14} />
                <Files aria-hidden="true" size={15} />
                <span>src/components</span>
              </div>
              <button type="button" className={styles.phoneFileActive} onClick={() => setView("code")}>
                <Code2 aria-hidden="true" size={15} />
                <span>RepositoryViewer.tsx</span>
                <ArrowRight aria-hidden="true" className={styles.phoneFileArrow} size={15} />
              </button>
              <div className={styles.phoneFileMuted}>
                <Code2 aria-hidden="true" size={15} />
                <span>ViewerHeader.tsx</span>
              </div>
              <div className={styles.phoneFileMuted}>
                <Code2 aria-hidden="true" size={15} />
                <span>ViewerTreePanel.tsx</span>
              </div>
            </div>
          ) : (
            <div className={styles.phoneCode}>
              <button type="button" className={styles.phoneBack} onClick={() => setView("files")}>
                <ArrowLeft aria-hidden="true" size={15} />
                Files
              </button>
              <div className={styles.phoneCodeTitle}>RepositoryViewer.tsx</div>
              <pre>
                <code>
                  <span><b>01</b> const viewer = useViewer();</span>
                  <span><b>02</b> </span>
                  <span><b>03</b> return (</span>
                  <span><b>04</b>   &lt;CodeFileViewer /&gt;</span>
                  <span><b>05</b> );</span>
                </code>
              </pre>
            </div>
          )}
        </div>

        <div className={styles.phoneBottomBar}>
          <button type="button" aria-label="Show files" aria-pressed={view === "files"} onClick={() => setView("files")}>
            <Files aria-hidden="true" size={16} />
            <span>Files</span>
          </button>
          <button type="button" aria-label="Show code" aria-pressed={view === "code"} onClick={() => setView("code")}>
            <Code2 aria-hidden="true" size={16} />
            <span>Read</span>
          </button>
          <button type="button" aria-label="Open search" onClick={() => setView("files")}>
            <Search aria-hidden="true" size={16} />
            <span>Search</span>
          </button>
          <button type="button" aria-label="Open tools" onClick={() => setView("code")}>
            <Settings2 aria-hidden="true" size={16} />
            <span>Tools</span>
          </button>
        </div>
      </div>
    </div>
  );
}
