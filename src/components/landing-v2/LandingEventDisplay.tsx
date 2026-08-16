"use client";

import { useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Clipboard,
  FileCode2,
  FileText,
  Folder,
  GitBranch,
  LockKeyhole,
  Search,
} from "lucide-react";
import styles from "./LandingV2Page.module.css";

type FileSignal = {
  id: string;
  path: string;
  name: string;
  kind: "tsx" | "md" | "json";
  lines: string[];
};

const FILE_SIGNALS: FileSignal[] = [
  {
    id: "viewer",
    path: "src/components/viewer/RepositoryViewer.tsx",
    name: "RepositoryViewer.tsx",
    kind: "tsx",
    lines: [
      "const { owner, repo, branch } = useViewer();",
      "",
      "return (",
      "  <div className=\"flex h-full w-full\">",
      "    <ViewerTreePanel />",
      "    <CodeFileViewer branch={branch} />",
      "  </div>",
      ");",
    ],
  },
  {
    id: "readme",
    path: "README.md",
    name: "README.md",
    kind: "md",
    lines: [
      "# RepoDeck",
      "",
      "A focused, responsive GitHub repository viewer.",
      "",
      "- Open public repositories without cloning",
      "- Keep the file path in a shareable URL",
      "- Read on desktop, tablet, or mobile",
    ],
  },
  {
    id: "package",
    path: "package.json",
    name: "package.json",
    kind: "json",
    lines: [
      '{ "name": "repodeck",',
      '  "private": true,',
      '  "scripts": {',
      '    "dev": "next dev",',
      '    "build": "next build"',
      "  }",
      "}",
    ],
  },
];

function FileGlyph({ kind }: { kind: FileSignal["kind"] }) {
  if (kind === "md") return <FileText aria-hidden="true" size={15} />;
  return <FileCode2 aria-hidden="true" size={15} />;
}

export function LandingEventDisplay() {
  const [activeId, setActiveId] = useState("viewer");
  const [filesOpen, setFilesOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const activeFile = FILE_SIGNALS.find((file) => file.id === activeId) ?? FILE_SIGNALS[0];

  const selectFile = (id: string) => {
    setActiveId(id);
    setFilesOpen(false);
  };

  const copyFile = async () => {
    try {
      await navigator.clipboard.writeText(activeFile.lines.join("\n"));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className={styles.displayShell}>
      <div className={styles.displayTopline}>
        <div className={styles.displayIdentity}>
          <span className={styles.statusDot} aria-hidden="true" />
          <span>repodeck</span>
          <span className={styles.displaySlash}>/</span>
          <span className={styles.displayMuted}>next.js</span>
          <span className={styles.displaySlash}>/</span>
          <GitBranch aria-hidden="true" size={13} />
          <span className={styles.displayMuted}>canary</span>
        </div>
        <span className={styles.readOnlyBadge}>
          <LockKeyhole aria-hidden="true" size={12} />
          Read-only
        </span>
      </div>

      <button
        type="button"
        className={styles.mobileFilesButton}
        aria-expanded={filesOpen}
        onClick={() => setFilesOpen((open) => !open)}
      >
        <span>
          <Folder aria-hidden="true" size={15} />
          File map
        </span>
        {filesOpen ? <ChevronDown aria-hidden="true" size={15} /> : <ChevronRight aria-hidden="true" size={15} />}
      </button>

      {filesOpen ? (
        <div className={styles.mobileFileList}>
          <div className={styles.fileSearchLabel}>
            <Search aria-hidden="true" size={13} />
            Repository files
          </div>
          {FILE_SIGNALS.map((file) => (
            <button
              key={file.id}
              type="button"
              className={`${styles.fileItem} ${activeId === file.id ? styles.fileItemActive : ""}`}
              aria-pressed={activeId === file.id}
              onClick={() => selectFile(file.id)}
            >
              <FileGlyph kind={file.kind} />
              <span>{file.name}</span>
              {activeId === file.id ? <Check aria-hidden="true" size={14} /> : null}
            </button>
          ))}
        </div>
      ) : null}

      <div className={styles.displayBody}>
        <aside className={styles.fileRail} aria-label="Repository files">
          <div className={styles.fileRailHeader}>
            <span>Files</span>
            <span className={styles.fileCount}>3</span>
          </div>
          <div className={styles.fileSearch}>
            <Search aria-hidden="true" size={13} />
            <span>Filter paths</span>
          </div>
          <div className={styles.fileTree}>
            <div className={styles.folderRow}>
              <ChevronDown aria-hidden="true" size={13} />
              <Folder aria-hidden="true" size={15} />
              <span>src</span>
            </div>
            <div className={styles.folderChild}>
              <div className={styles.folderRow}>
                <ChevronDown aria-hidden="true" size={13} />
                <Folder aria-hidden="true" size={15} />
                <span>components</span>
              </div>
              <button
                type="button"
                className={`${styles.fileItem} ${activeId === "viewer" ? styles.fileItemActive : ""}`}
                aria-pressed={activeId === "viewer"}
                onClick={() => selectFile("viewer")}
              >
                <FileGlyph kind="tsx" />
                <span>{FILE_SIGNALS[0].name}</span>
              </button>
            </div>
            {FILE_SIGNALS.slice(1).map((file) => (
              <button
                key={file.id}
                type="button"
                className={`${styles.fileItem} ${activeId === file.id ? styles.fileItemActive : ""}`}
                aria-pressed={activeId === file.id}
                onClick={() => selectFile(file.id)}
              >
                <FileGlyph kind={file.kind} />
                <span>{file.name}</span>
              </button>
            ))}
          </div>
        </aside>

        <div className={styles.eventView}>
          <svg className={styles.eventSvg} viewBox="0 0 600 420" aria-hidden="true">
            <g className={styles.eventRings}>
              <circle cx="300" cy="206" r="70" />
              <circle cx="300" cy="206" r="122" />
              <circle cx="300" cy="206" r="176" />
              <circle cx="300" cy="206" r="228" />
            </g>
            <g className={styles.eventSpokes}>
              <path d="M300 206L72 86" />
              <path d="M300 206L126 364" />
              <path d="M300 206L530 92" />
              <path d="M300 206L498 350" />
            </g>
            <g className={styles.signalTracks}>
              <path className={styles.signalTrackYellow} d="M300 206C258 156 193 122 84 106" />
              <path className={styles.signalTrackCyan} d="M300 206C360 164 430 152 526 112" />
              <path className={styles.signalTrackBlue} d="M300 206C350 252 414 304 492 338" />
              <path className={styles.signalTrackRed} d="M300 206C244 246 185 298 112 354" />
              <path className={styles.signalTrackActive} d="M300 206C279 260 276 324 302 394" />
            </g>
            <g className={styles.eventNodes}>
              <circle cx="84" cy="106" r="4" />
              <circle cx="526" cy="112" r="4" />
              <circle cx="492" cy="338" r="4" />
              <circle cx="112" cy="354" r="4" />
              <circle cx="302" cy="394" r="4" />
            </g>
          </svg>

          <div className={styles.eventGridLabel}>repository cross-section / selected signal</div>
          <div className={styles.eventNode}>
            <span className={styles.eventNodePulse} aria-hidden="true" />
            <span className={styles.eventNodeLabel}>ACTIVE FILE</span>
            <strong>{activeFile.name}</strong>
            <span className={styles.eventNodeMeta}>{activeFile.kind.toUpperCase()} · {activeFile.lines.length} lines shown</span>
          </div>
          <div className={styles.eventLegend}>
            <span><i className={styles.legendYellow} /> branch path</span>
            <span><i className={styles.legendCyan} /> selected file</span>
            <span><i className={styles.legendRed} /> related signal</span>
          </div>
        </div>

        <section className={styles.codePane} aria-label="Selected file preview">
          <div className={styles.codeHeader}>
            <div className={styles.codeTitle}>
              <FileGlyph kind={activeFile.kind} />
              <span>{activeFile.path}</span>
            </div>
            <button type="button" className={styles.copyButton} onClick={copyFile} aria-label="Copy selected file preview">
              {copied ? <Check aria-hidden="true" size={14} /> : <Clipboard aria-hidden="true" size={14} />}
            </button>
          </div>
          <pre className={styles.codeBlock}>
            <code>
              {activeFile.lines.map((line, index) => (
                <span key={`${activeFile.id}-${index}`} className={styles.codeLine}>
                  <span className={styles.lineNumber}>{String(index + 1).padStart(2, "0")}</span>
                  <span className={line.trim().startsWith("//") ? styles.codeComment : styles.codeText}>{line || " "}</span>
                </span>
              ))}
            </code>
          </pre>
          <div className={styles.codeFooter}>
            <span>branch: canary</span>
            <span>path stays in URL</span>
          </div>
        </section>
      </div>
    </div>
  );
}
