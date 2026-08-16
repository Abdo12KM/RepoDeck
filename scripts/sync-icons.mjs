import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const iconPkgPath = path.dirname(
  require.resolve("material-icon-theme/package.json"),
);

const SRC_ICONS = path.join(iconPkgPath, "icons");
const SRC_DIST = path.join(iconPkgPath, "dist");
const DEST = path.resolve("public/icons/material-icon-theme");

async function sync() {
  try {
    if (!fs.existsSync(DEST)) {
      fs.mkdirSync(DEST, { recursive: true });
    }

    // Copy all SVG icons
    const destIcons = path.join(DEST, "icons");
    if (fs.existsSync(destIcons)) {
      // Remove old icons to ensure a clean sync
      fs.rmSync(destIcons, { recursive: true, force: true });
    }
    fs.cpSync(SRC_ICONS, destIcons, { recursive: true });

    // Copy manifest
    // The library generates the manifest dynamically in dist/
    // We need this JSON to know which file maps to which icon
    fs.copyFileSync(
      path.join(SRC_DIST, "material-icons.json"),
      path.join(DEST, "manifest.json"),
    );

    console.log("✅ Material Icons synced to public folder");
  } catch (error) {
    console.error("❌ Error syncing icons:", error);
    process.exit(1);
  }
}

sync();
