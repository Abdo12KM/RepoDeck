import sharp from "sharp";
import fs from "fs";
import path from "path";

const BRAIN_DIR =
  "C:\\Users\\ABDO\\.gemini\\antigravity-ide\\brain\\297d871e-2524-47c2-80e0-f62ce3652413";
const OUT_DIR = path.resolve("public");

async function extractAlphaFromBlackBg(inputPath, outputPath, threshold = 15) {
  if (!fs.existsSync(inputPath)) {
    console.log("File not found:", inputPath);
    return;
  }

  const image = sharp(inputPath);
  const { data, info } = await image
    .raw()
    .toBuffer({ resolveWithObject: true });

  const channels = info.channels; // usually 3 (RGB)
  const width = info.width;
  const height = info.height;
  const rgbaBuffer = Buffer.alloc(width * height * 4);

  for (let i = 0; i < width * height; i++) {
    const r = data[i * channels];
    const g = data[i * channels + 1];
    const b = data[i * channels + 2];

    const brightness = (r + g + b) / 3;

    rgbaBuffer[i * 4] = r;
    rgbaBuffer[i * 4 + 1] = g;
    rgbaBuffer[i * 4 + 2] = b;

    if (brightness < threshold) {
      rgbaBuffer[i * 4 + 3] = 0; // Completely transparent
    } else {
      // Smooth alpha ramp
      const alpha = Math.min(
        255,
        Math.round(((brightness - threshold) / (255 - threshold)) * 255 * 1.3),
      );
      rgbaBuffer[i * 4 + 3] = alpha;
    }
  }

  await sharp(rgbaBuffer, { raw: { width, height, channels: 4 } })
    .png()
    .toFile(outputPath);

  console.log(`Created transparent PNG: ${outputPath}`);
}

async function main() {
  const emblemAiJpg = path.join(
    BRAIN_DIR,
    "repodeck_monochrome_emblem_1786764003385.jpg",
  );
  const glassAiJpg = path.join(
    BRAIN_DIR,
    "repodeck_monochrome_glass_1786763983434.jpg",
  );

  await extractAlphaFromBlackBg(
    emblemAiJpg,
    path.join(OUT_DIR, "ai-emblem-transparent.png"),
    20,
  );
  await extractAlphaFromBlackBg(
    glassAiJpg,
    path.join(OUT_DIR, "ai-glass-transparent.png"),
    25,
  );
}

main().catch(console.error);
