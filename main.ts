// news-image-20261123 — entrypoint (Node 22, standard library only).
//
// The entry's image is drawn in advance and shipped beside this file as
// entry.png: a one-page newspaper front page summing up the world news of
// Monday 23 November 2026 (COP31 collapses in Antalya, war escalates at the
// Strait of Hormuz, Ukraine strikes back at sea, and three more stories).
//
// This program copies that image byte-for-byte to the grader's output
// directory, so both runs write identical bytes. It validates the file
// before copying: it must be a whole PNG of at most 1 MiB.
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const source = join(here, "entry.png");
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const target = join(outDir, "entry.png");

const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47];
const MAX_BYTES = 1048576;

if (!existsSync(source)) {
  throw new Error(`entry.png is missing next to main.ts (${source})`);
}

const bytes = readFileSync(source);

if (bytes.length === 0 || bytes.length > MAX_BYTES) {
  throw new Error(`entry.png has an unexpected size (${bytes.length} bytes)`);
}
for (let i = 0; i < PNG_MAGIC.length; i++) {
  if (bytes[i] !== PNG_MAGIC[i]) {
    throw new Error("entry.png is not a PNG file");
  }
}

// The gate caps the image at 1024 by 1024 pixels: read the size from the
// PNG header (IHDR: width at bytes 16-19, height at bytes 20-23, big-endian).
const width = bytes.readUInt32BE(16);
const height = bytes.readUInt32BE(20);
if (width > 1024 || height > 1024) {
  throw new Error(`entry.png is ${width}x${height}, over the 1024x1024 cap`);
}

mkdirSync(outDir, { recursive: true });
copyFileSync(source, target);

const written = statSync(target).size;
if (written !== bytes.length) {
  throw new Error(`short write: ${written} of ${bytes.length} bytes`);
}

console.log(`wrote ${target} (${written} bytes)`);
