#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import zlib from "zlib";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// Read package.json for default project name
let projectName = "repo";
try {
  const pkgPath = path.join(rootDir, "package.json");
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    if (pkg.name) {
      projectName = pkg.name
        .replace(/^@[\w-]+\//, "")
        .replace(/[^a-zA-Z0-9._-]/g, "-");
    }
  }
} catch {
  projectName = "repo";
}

// Parse command-line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    output: null,
    name: null,
    timestamp: false,
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "-h" || arg === "--help") {
      options.help = true;
    } else if (arg === "-t" || arg === "--timestamp") {
      options.timestamp = true;
    } else if (arg === "-o" || arg === "--output" || arg === "--out") {
      options.output = args[++i];
    } else if (arg === "-n" || arg === "--name") {
      options.name = args[++i];
    } else if (!arg.startsWith("-") && !options.output) {
      options.output = arg;
    }
  }

  return options;
}

// Convert JavaScript Date to MS-DOS date and time for ZIP header
function dateToDos(date) {
  const d = date instanceof Date && !isNaN(date.getTime()) ? date : new Date();
  const year = d.getFullYear();
  const dosYear = year < 1980 ? 0 : year - 1980;
  const dosDate = (dosYear << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
  const dosTime =
    (d.getHours() << 11) |
    (d.getMinutes() << 5) |
    Math.floor(d.getSeconds() / 2);
  return { dosDate, dosTime };
}

// Fallback CRC32 lookup table
const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[i] = c >>> 0;
}

function calculateCrc32(buf) {
  if (typeof zlib.crc32 === "function") {
    return zlib.crc32(buf) >>> 0;
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// High-speed, zero-dependency ZIP archive creator that processes one file at a time.
class FastZipArchive {
  constructor(outputPath) {
    this.outputPath = outputPath;
    this.fd = fs.openSync(outputPath, "w");
    this.offset = 0;
    this.entries = [];
  }

  addFile(relPathInZip, absoluteFilePath) {
    const normName = relPathInZip.replace(/\\/g, "/").replace(/^\/+/, "");
    const nameBuf = Buffer.from(normName, "utf8");

    const stat = fs.statSync(absoluteFilePath);
    const rawBuffer = fs.readFileSync(absoluteFilePath);
    const uncompressedSize = rawBuffer.length;
    const crc = calculateCrc32(rawBuffer);

    // Compress with deflate level 6 (standard good balance of speed and ratio)
    let compressedData =
      uncompressedSize > 0
        ? zlib.deflateRawSync(rawBuffer, { level: 6 })
        : Buffer.alloc(0);
    let method = 8; // Deflate

    // If compression doesn't reduce size (or for 0-byte files), store uncompressed
    if (compressedData.length >= uncompressedSize && uncompressedSize > 0) {
      compressedData = rawBuffer;
      method = 0; // Stored
    }

    const compressedSize = compressedData.length;
    const { dosDate, dosTime } = dateToDos(stat.mtime);
    const localHeaderOffset = this.offset;

    // Local file header (30 bytes + name length)
    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0); // signature
    localHeader.writeUInt16LE(20, 4); // version needed (2.0)
    localHeader.writeUInt16LE(0x0800, 6); // general flags: bit 11 = UTF-8 filenames
    localHeader.writeUInt16LE(method, 8); // compression method
    localHeader.writeUInt16LE(dosTime, 10);
    localHeader.writeUInt16LE(dosDate, 12);
    localHeader.writeUInt32LE(crc, 14);
    localHeader.writeUInt32LE(compressedSize, 18);
    localHeader.writeUInt32LE(uncompressedSize, 22);
    localHeader.writeUInt16LE(nameBuf.length, 26);
    localHeader.writeUInt16LE(0, 28); // extra field length

    fs.writeSync(this.fd, localHeader);
    fs.writeSync(this.fd, nameBuf);
    if (compressedSize > 0) {
      fs.writeSync(this.fd, compressedData);
    }

    this.offset += 30 + nameBuf.length + compressedSize;

    // Unix permissions or standard file mode
    const mode = stat.mode || 0o100644;
    const externalAttributes = (mode << 16) >>> 0;

    this.entries.push({
      nameBuf,
      method,
      dosTime,
      dosDate,
      crc,
      compressedSize,
      uncompressedSize,
      externalAttributes,
      offset: localHeaderOffset,
    });
  }

  finish() {
    const cdOffset = this.offset;
    let cdSize = 0;

    for (const entry of this.entries) {
      // Central directory header (46 bytes + name length)
      const cdHeader = Buffer.alloc(46);
      cdHeader.writeUInt32LE(0x02014b50, 0); // signature
      cdHeader.writeUInt16LE((3 << 8) | 20, 4); // version made by (Unix / v2.0)
      cdHeader.writeUInt16LE(20, 6); // version needed (2.0)
      cdHeader.writeUInt16LE(0x0800, 8); // flags: UTF-8
      cdHeader.writeUInt16LE(entry.method, 10);
      cdHeader.writeUInt16LE(entry.dosTime, 12);
      cdHeader.writeUInt16LE(entry.dosDate, 14);
      cdHeader.writeUInt32LE(entry.crc, 16);
      cdHeader.writeUInt32LE(entry.compressedSize, 20);
      cdHeader.writeUInt32LE(entry.uncompressedSize, 24);
      cdHeader.writeUInt16LE(entry.nameBuf.length, 28);
      cdHeader.writeUInt16LE(0, 30); // extra field length
      cdHeader.writeUInt16LE(0, 32); // comment length
      cdHeader.writeUInt16LE(0, 34); // disk start
      cdHeader.writeUInt16LE(0, 36); // internal file attributes
      cdHeader.writeUInt32LE(entry.externalAttributes, 38);
      cdHeader.writeUInt32LE(entry.offset, 42);

      fs.writeSync(this.fd, cdHeader);
      fs.writeSync(this.fd, entry.nameBuf);
      cdSize += 46 + entry.nameBuf.length;
    }

    // End of central directory record (22 bytes)
    const eocd = Buffer.alloc(22);
    eocd.writeUInt32LE(0x06054b50, 0); // signature
    eocd.writeUInt16LE(0, 4); // disk number
    eocd.writeUInt16LE(0, 6); // disk with central directory
    eocd.writeUInt16LE(this.entries.length, 8); // entries on disk
    eocd.writeUInt16LE(this.entries.length, 10); // total entries
    eocd.writeUInt32LE(cdSize, 12); // size of CD
    eocd.writeUInt32LE(cdOffset, 16); // offset of CD
    eocd.writeUInt16LE(0, 20); // comment length

    fs.writeSync(this.fd, eocd);
    fs.closeSync(this.fd);
  }
}

// Collect non-gitignored files using git ls-files
function getNonGitignoredFiles() {
  try {
    // -z uses null byte separation to safely handle spaces and special characters
    // --cached: tracked files
    // --others: untracked files
    // --exclude-standard: respect .gitignore, .git/info/exclude, and global ignores
    const stdout = execSync(
      "git ls-files -z --cached --others --exclude-standard",
      {
        cwd: rootDir,
        maxBuffer: 64 * 1024 * 1024,
        encoding: "buffer",
        stdio: ["pipe", "pipe", "ignore"],
      },
    );

    const fileEntries = stdout.toString("utf8").split("\0").filter(Boolean);
    const files = [];

    for (const relPath of fileEntries) {
      const absPath = path.join(rootDir, relPath);
      // Skip if file was deleted locally or is a directory
      if (fs.existsSync(absPath)) {
        const stat = fs.statSync(absPath);
        if (stat.isFile()) {
          files.push({
            relPath: relPath.replace(/\\/g, "/"),
            absPath,
            size: stat.size,
          });
        }
      }
    }

    return files;
  } catch (error) {
    console.warn(
      "⚠️  Git command failed or not in git repo, falling back to manual file walker...",
    );
    return getFilesFallback(rootDir);
  }
}

// Fallback directory walker if git is unavailable
function getFilesFallback(dir, files = []) {
  const hardIgnore = new Set([
    ".git",
    "node_modules",
    ".next",
    "build",
    "out",
    "coverage",
    ".vercel",
    ".turbo",
    "tmp",
    "temp",
  ]);

  function walk(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      if (hardIgnore.has(entry.name)) continue;
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile()) {
        const relPath = path.relative(rootDir, fullPath).replace(/\\/g, "/");
        files.push({
          relPath,
          absPath: fullPath,
          size: fs.statSync(fullPath).size,
        });
      }
    }
  }

  walk(dir);
  return files;
}

function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(2) + " " + sizes[i];
}

function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

// Main execution
function main() {
  const options = parseArgs();

  if (options.help) {
    console.log(`
Usage: pnpm zip [options]
       node scripts/zip-repo.mjs [options]

Zips all tracked and untracked files in the repository that are not ignored by .gitignore
and outputs the zip archive to the project's /temp directory.

Options:
  -o, --output <path>    Specify custom output file or directory (default: temp/<repo-name>.zip)
  -n, --name <filename>  Specify archive name (default: <package-name>.zip)
  -t, --timestamp        Append timestamp to archive filename
  -h, --help             Show this help message
`);
    process.exit(0);
  }

  const startTime = Date.now();
  console.log("🔍 Scanning for non-gitignored repository files...");

  const files = getNonGitignoredFiles();
  if (files.length === 0) {
    console.error("❌ No files found to zip.");
    process.exit(1);
  }

  const totalRawBytes = files.reduce((acc, f) => acc + f.size, 0);

  // Determine output path (defaulting to /temp directory)
  const defaultTmpDir = path.join(rootDir, "temp");
  fs.mkdirSync(defaultTmpDir, { recursive: true });

  let targetZipPath;
  const dateStamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const baseName = options.name || projectName;
  const finalFileName = options.timestamp
    ? `${baseName}-${dateStamp}.zip`
    : `${baseName}.zip`;

  if (options.output) {
    const resolvedOut = path.resolve(rootDir, options.output);
    if (fs.existsSync(resolvedOut) && fs.statSync(resolvedOut).isDirectory()) {
      targetZipPath = path.join(resolvedOut, finalFileName);
    } else if (resolvedOut.endsWith("/") || resolvedOut.endsWith("\\")) {
      fs.mkdirSync(resolvedOut, { recursive: true });
      targetZipPath = path.join(resolvedOut, finalFileName);
    } else {
      targetZipPath = resolvedOut.endsWith(".zip")
        ? resolvedOut
        : `${resolvedOut}.zip`;
      fs.mkdirSync(path.dirname(targetZipPath), { recursive: true });
    }
  } else {
    targetZipPath = path.join(defaultTmpDir, finalFileName);
  }

  // If the zip file already exists, remove it before writing
  if (fs.existsSync(targetZipPath)) {
    fs.unlinkSync(targetZipPath);
  }

  // Filter out target zip if it happens to be in the list
  const normalizedTargetZip = path.normalize(targetZipPath);
  const filesToZip = files.filter(
    (f) => path.normalize(f.absPath) !== normalizedTargetZip,
  );

  console.log(
    `📦 Archiving ${filesToZip.length.toLocaleString()} files (${formatBytes(totalRawBytes)})...`,
  );

  const zip = new FastZipArchive(targetZipPath);

  let processedCount = 0;
  for (const file of filesToZip) {
    zip.addFile(file.relPath, file.absPath);
    processedCount++;
  }

  zip.finish();

  const zipStat = fs.statSync(targetZipPath);
  const duration = Date.now() - startTime;
  const ratio =
    totalRawBytes > 0
      ? (((totalRawBytes - zipStat.size) / totalRawBytes) * 100).toFixed(1)
      : "0.0";

  const relOutputPath = path.relative(rootDir, targetZipPath);
  const displayOutputPath = relOutputPath.startsWith("..")
    ? targetZipPath
    : relOutputPath;

  console.log("\n========================================");
  console.log("✅ Repository zipped successfully!");
  console.log(`📁 Destination:  ${displayOutputPath}`);
  console.log(`📊 Files:        ${processedCount.toLocaleString()} files`);
  console.log(
    `🗜️  Archive Size: ${formatBytes(zipStat.size)} (saved ${ratio}%)`,
  );
  console.log(`⏱️  Time:         ${formatDuration(duration)}`);
  console.log("========================================\n");
}

main();
