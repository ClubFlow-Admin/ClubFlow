// Generates a large library of procedurally-drawn local SVG "demo photography" assets —
// abstract editorial cover-art (gradient background + a category-appropriate glyph), not
// real photographs. Used so the seeded demo dataset has unique, visually distinct hero
// imagery per article without depending on any external image service or scraped/licensed
// photography. Run with: node scripts/generate-demo-media.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUT_DIR = join(process.cwd(), "public", "images", "demo");
mkdirSync(OUT_DIR, { recursive: true });

const CATEGORIES = [
  { key: "industry", label: "Industry", from: "#0f5132", to: "#34d399", glyph: "flag" },
  { key: "club-developments", label: "Club Developments", from: "#7c4a03", to: "#f59e0b", glyph: "crane" },
  { key: "executive-moves", label: "Executive Moves", from: "#1e293b", to: "#64748b", glyph: "briefcase" },
  { key: "jobs", label: "Jobs", from: "#0f766e", to: "#2dd4bf", glyph: "badge" },
  { key: "technology", label: "Technology", from: "#312e81", to: "#818cf8", glyph: "chip" },
  { key: "mergers-acquisitions", label: "Mergers & Acquisitions", from: "#1e3a8a", to: "#d97706", glyph: "rings" },
  { key: "capital-investments", label: "Capital Investments", from: "#065f46", to: "#ca8a04", glyph: "bars" },
  { key: "club-rankings", label: "Club Rankings", from: "#0c4a6e", to: "#38bdf8", glyph: "trophy" },
  { key: "podcasts", label: "Podcasts", from: "#4c1d95", to: "#a78bfa", glyph: "mic" },
  { key: "clubopspro", label: "ClubOpsPro", from: "#064e3b", to: "#34d399", glyph: "clipboard" }
];

const IMAGES_PER_CATEGORY = 9;
const WIDTH = 1600;
const HEIGHT = 1000;

function clamp(value) {
  return Math.max(0, Math.min(255, value));
}

function hexToRgb(hex) {
  const value = hex.replace("#", "");
  return { r: parseInt(value.slice(0, 2), 16), g: parseInt(value.slice(2, 4), 16), b: parseInt(value.slice(4, 6), 16) };
}

function rgbToHex({ r, g, b }) {
  return `#${[r, g, b].map((channel) => clamp(Math.round(channel)).toString(16).padStart(2, "0")).join("")}`;
}

function shift(hex, amount) {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex({ r: r + amount, g: g + amount, b: b + amount });
}

function glyphMarkup(glyph) {
  switch (glyph) {
    case "flag":
      return `<g stroke="white" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <line x1="0" y1="260" x2="0" y2="-40" />
        <path d="M0 -40 L130 -5 L0 30 Z" fill="white" stroke="none" />
        <ellipse cx="0" cy="270" rx="60" ry="14" fill="white" stroke="none" opacity="0.85" />
      </g>`;
    case "crane":
      return `<g stroke="white" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <line x1="-10" y1="260" x2="-10" y2="-120" />
        <line x1="-10" y1="-120" x2="170" y2="-60" />
        <line x1="60" y1="-83" x2="60" y2="60" />
        <rect x="-90" y="180" width="60" height="80" fill="white" stroke="none" opacity="0.85" />
        <rect x="-10" y="160" width="60" height="100" fill="white" stroke="none" opacity="0.7" />
      </g>`;
    case "briefcase":
      return `<g stroke="white" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <rect x="-140" y="-30" width="280" height="190" rx="18" />
        <path d="M-60 -30 V-70 a30 30 0 0 1 30 -30 h60 a30 30 0 0 1 30 30 V-30" />
        <line x1="-140" y1="65" x2="140" y2="65" />
      </g>`;
    case "badge":
      return `<g stroke="white" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <rect x="-110" y="-150" width="220" height="300" rx="24" />
        <circle cx="0" cy="-50" r="50" fill="white" stroke="none" opacity="0.85" />
        <line x1="-60" y1="60" x2="60" y2="60" />
        <line x1="-60" y1="100" x2="60" y2="100" />
      </g>`;
    case "chip":
      return `<g stroke="white" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <rect x="-110" y="-110" width="220" height="220" rx="20" />
        ${[-70, 0, 70].map((offset) => `<line x1="${offset}" y1="-150" x2="${offset}" y2="-110" />`).join("")}
        ${[-70, 0, 70].map((offset) => `<line x1="${offset}" y1="110" x2="${offset}" y2="150" />`).join("")}
        ${[-70, 0, 70].map((offset) => `<line x1="-150" y1="${offset}" x2="-110" y2="${offset}" />`).join("")}
        ${[-70, 0, 70].map((offset) => `<line x1="110" y1="${offset}" x2="150" y2="${offset}" />`).join("")}
      </g>`;
    case "rings":
      return `<g stroke="white" stroke-width="14" fill="none">
        <circle cx="-55" cy="0" r="95" />
        <circle cx="55" cy="0" r="95" />
      </g>`;
    case "bars":
      return `<g fill="white" opacity="0.88">
        <rect x="-150" y="40" width="70" height="160" />
        <rect x="-55" y="-30" width="70" height="230" />
        <rect x="40" y="-110" width="70" height="310" />
        <circle cx="75" cy="-160" r="36" fill="none" stroke="white" stroke-width="8" />
      </g>`;
    case "trophy":
      return `<g stroke="white" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M-80 -120 h160 v70 a80 80 0 0 1 -160 0 Z" />
        <path d="M-80 -100 h-40 a40 60 0 0 0 50 80" />
        <path d="M80 -100 h40 a40 60 0 0 1 -50 80" />
        <line x1="0" y1="30" x2="0" y2="80" />
        <rect x="-70" y="80" width="140" height="30" rx="6" />
      </g>`;
    case "mic":
      return `<g stroke="white" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <rect x="-45" y="-160" width="90" height="170" rx="45" fill="white" stroke="none" opacity="0.88" />
        <path d="M-100 -20 a100 100 0 0 0 200 0" />
        <line x1="0" y1="80" x2="0" y2="140" />
        <line x1="-60" y1="140" x2="60" y2="140" />
      </g>`;
    case "clipboard":
      return `<g stroke="white" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <rect x="-110" y="-140" width="220" height="290" rx="16" />
        <rect x="-45" y="-165" width="90" height="40" rx="10" fill="white" stroke="none" opacity="0.85" />
        <path d="M-55 -20 l30 30 l70 -80" />
        <line x1="-55" y1="60" x2="55" y2="60" />
        <line x1="-55" y1="100" x2="55" y2="100" />
      </g>`;
    default:
      return "";
  }
}

function buildSvg({ from, to, angle, glyph, seedIndex }) {
  const fromShifted = shift(from, (seedIndex % 3) * 6 - 6);
  const toShifted = shift(to, (seedIndex % 4) * 5 - 8);
  const x2 = 50 + 50 * Math.cos((angle * Math.PI) / 180);
  const y2 = 50 + 50 * Math.sin((angle * Math.PI) / 180);
  const x1 = 100 - x2;
  const y1 = 100 - y2;
  const glyphX = 1080 + (seedIndex % 3) * 60;
  const glyphY = 560 + (seedIndex % 2) * 40;
  const scale = 1.5 + (seedIndex % 3) * 0.18;
  const dotOpacity = 0.05 + (seedIndex % 3) * 0.03;

  return `<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">
      <stop offset="0%" stop-color="${fromShifted}" />
      <stop offset="100%" stop-color="${toShifted}" />
    </linearGradient>
    <pattern id="dots" width="46" height="46" patternUnits="userSpaceOnUse">
      <circle cx="4" cy="4" r="3" fill="white" opacity="${dotOpacity}" />
    </pattern>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)" />
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#dots)" />
  <g transform="translate(${glyphX} ${glyphY}) scale(${scale})" opacity="0.5">
    ${glyphMarkup(glyph)}
  </g>
</svg>`;
}

let written = 0;
for (const category of CATEGORIES) {
  for (let index = 0; index < IMAGES_PER_CATEGORY; index += 1) {
    const angle = (index * 40) % 360;
    const svg = buildSvg({ from: category.from, to: category.to, angle, glyph: category.glyph, seedIndex: index });
    const fileName = `${category.key}-${String(index + 1).padStart(2, "0")}.svg`;
    writeFileSync(join(OUT_DIR, fileName), svg, "utf8");
    written += 1;
  }
}

console.log(`Generated ${written} demo media images in ${OUT_DIR}`);
