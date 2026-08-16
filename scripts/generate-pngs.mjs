import sharp from "sharp";
import fs from "fs";
import path from "path";

const OUT_DIR = path.resolve("public");
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

// Pure white monochrome SVG emblem (NO TEXT), specifically engineered for CSS masking, tinting, and blend modes
function createWhiteEmblemSvg(size = 1024) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Back Layer Card with subtle translucency -->
  <rect
    x="6.75"
    y="2.75"
    width="14.5"
    height="14.5"
    rx="3.5"
    stroke="#ffffff"
    stroke-opacity="0.45"
    stroke-width="1.75"
  />
  <!-- Back Layer Top-Right Accent -->
  <path
    d="M17.5 6.5h.5a1.5 1.5 0 0 1 1.5 1.5v.5"
    stroke="#ffffff"
    stroke-opacity="0.8"
    stroke-width="1.5"
    stroke-linecap="round"
  />

  <!-- Front Layer Main Repository Card -->
  <rect
    x="2.75"
    y="6.75"
    width="14.5"
    height="14.5"
    rx="3.5"
    fill="#ffffff"
    fill-opacity="0.08"
    stroke="#ffffff"
    stroke-width="1.75"
  />

  <!-- Git Branch Nodes -->
  <circle cx="6.75" cy="11.25" r="1.6" fill="#ffffff" />
  <circle cx="13.25" cy="11.25" r="1.6" fill="#ffffff" />
  <circle cx="6.75" cy="16.75" r="1.6" fill="#ffffff" />

  <!-- Git Trunk -->
  <path
    d="M6.75 11.25v5.5"
    stroke="#ffffff"
    stroke-width="1.75"
    stroke-linecap="round"
  />

  <!-- Smooth Branch Curve -->
  <path
    d="M6.75 14.5c0-1.8 1.45-3.25 3.25-3.25h3.25"
    stroke="#ffffff"
    stroke-width="1.75"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
</svg>`;
}

// 3D Glass/Glow White Emblem (NO TEXT) for rich specular highlights
function create3DGlowEmblemSvg(size = 1024) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="0.6" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
    <linearGradient id="glassGrad" x1="2" y1="6" x2="18" y2="22" gradientUnits="userSpaceOnUse">
      <stop stop-color="#ffffff" stop-opacity="0.22" />
      <stop offset="1" stop-color="#ffffff" stop-opacity="0.03" />
    </linearGradient>
  </defs>

  <!-- Back Layer Card -->
  <rect
    x="6.75"
    y="2.75"
    width="14.5"
    height="14.5"
    rx="3.5"
    stroke="#ffffff"
    stroke-opacity="0.5"
    stroke-width="1.75"
  />

  <!-- Front Layer Card with Glass Gradient -->
  <rect
    x="2.75"
    y="6.75"
    width="14.5"
    height="14.5"
    rx="3.5"
    fill="url(#glassGrad)"
    stroke="#ffffff"
    stroke-width="1.75"
    filter="url(#glow)"
  />

  <!-- Glowing Git Branch Geometry -->
  <g filter="url(#glow)">
    <circle cx="6.75" cy="11.25" r="1.6" fill="#ffffff" />
    <circle cx="13.25" cy="11.25" r="1.6" fill="#ffffff" />
    <circle cx="6.75" cy="16.75" r="1.6" fill="#ffffff" />

    <path
      d="M6.75 11.25v5.5"
      stroke="#ffffff"
      stroke-width="1.75"
      stroke-linecap="round"
    />

    <path
      d="M6.75 14.5c0-1.8 1.45-3.25 3.25-3.25h3.25"
      stroke="#ffffff"
      stroke-width="1.75"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </g>
</svg>`;
}

async function main() {
  console.log("Generating transparent PNG assets without text...");

  const sizes = [64, 128, 256, 512, 1024];

  for (const size of sizes) {
    // 1. Crisp white mask PNG
    const svg1 = Buffer.from(createWhiteEmblemSvg(size));
    await sharp(svg1)
      .png()
      .toFile(path.join(OUT_DIR, `repodeck-emblem-${size}.png`));

    // 2. 3D Glow glass mask PNG
    const svg2 = Buffer.from(create3DGlowEmblemSvg(size));
    await sharp(svg2)
      .png()
      .toFile(path.join(OUT_DIR, `repodeck-glass-${size}.png`));
  }

  // Copy default standard sizes
  await sharp(Buffer.from(createWhiteEmblemSvg(512)))
    .png()
    .toFile(path.join(OUT_DIR, `repodeck-emblem.png`));

  await sharp(Buffer.from(create3DGlowEmblemSvg(512)))
    .png()
    .toFile(path.join(OUT_DIR, `repodeck-glass.png`));

  console.log("Successfully generated all transparent PNG emblem assets!");
}

main().catch(console.error);
