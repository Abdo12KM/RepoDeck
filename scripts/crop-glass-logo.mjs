import sharp from "sharp";
import fs from "fs";
import path from "path";

const BRAIN_DIR =
  "C:\\Users\\ABDO\\.gemini\\antigravity-ide\\brain\\297d871e-2524-47c2-80e0-f62ce3652413";
const OUT_DIR = path.resolve("public");

async function cropAndMakeTransparent() {
  const glassInput = path.join(
    BRAIN_DIR,
    "repodeck_monochrome_glass_1786763983434.jpg",
  );

  if (!fs.existsSync(glassInput)) {
    console.error("Input file not found:", glassInput);
    return;
  }

  // 1. Crop only the 3D isometric glass stack (excluding the "RepoDeck" text at the bottom)
  // The glass deck is located between y=50 and y=780, x=100 and x=924
  const croppedBuffer = await sharp(glassInput)
    .extract({ left: 100, top: 60, width: 824, height: 720 })
    .toBuffer();

  // 2. Pad to a clean square (1024x1024) with black background before alpha extraction
  const squaredBuffer = await sharp(croppedBuffer)
    .resize(900, 786, { fit: "contain", background: { r: 0, g: 0, b: 0 } })
    .extend({
      top: 119,
      bottom: 119,
      left: 62,
      right: 62,
      background: { r: 0, g: 0, b: 0 },
    })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data, info } = squaredBuffer;
  const width = info.width;
  const height = info.height;
  const channels = info.channels;
  const rgbaBuffer = Buffer.alloc(width * height * 4);

  const threshold = 18;

  for (let i = 0; i < width * height; i++) {
    const r = data[i * channels];
    const g = data[i * channels + 1];
    const b = data[i * channels + 2];

    const brightness = (r + g + b) / 3;

    rgbaBuffer[i * 4] = r;
    rgbaBuffer[i * 4 + 1] = g;
    rgbaBuffer[i * 4 + 2] = b;

    if (brightness < threshold) {
      rgbaBuffer[i * 4 + 3] = 0; // Pure transparent
    } else {
      // Smooth specular alpha curve
      const factor = (brightness - threshold) / (255 - threshold);
      const alpha = Math.min(
        255,
        Math.round(Math.pow(factor, 0.85) * 255 * 1.25),
      );
      rgbaBuffer[i * 4 + 3] = alpha;
    }
  }

  const outputPath = path.join(OUT_DIR, "ai-glass-transparent.png");

  await sharp(rgbaBuffer, { raw: { width, height, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(outputPath);

  console.log(
    `Successfully generated clean transparent glass logo (NO TEXT): ${outputPath}`,
  );
}

cropAndMakeTransparent().catch(console.error);
