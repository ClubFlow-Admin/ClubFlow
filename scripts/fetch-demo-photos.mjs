// Fetches real, freely-licensed photographs from Wikimedia Commons (commons.wikimedia.org) —
// using their official public search + imageinfo API, not scraped or guessed URLs — and saves
// them locally under public/images/demo/<category>/. Commons only hosts public-domain or
// explicitly free-licensed media (CC0, CC-BY, CC-BY-SA, etc.), and every download here is kept
// only if the API reports one of those licenses, with full attribution captured for the
// MediaAsset `credit` field. Run with: node scripts/fetch-demo-photos.mjs
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const OUT_DIR = join(process.cwd(), "public", "images", "demo");
const TARGET_WIDTH = 1600;
const PER_CATEGORY = 9;
const ACCEPTED_LICENSES = new Set(["cc0", "cc-by-1.0", "cc-by-2.0", "cc-by-2.5", "cc-by-3.0", "cc-by-4.0", "cc-by-sa-1.0", "cc-by-sa-2.0", "cc-by-sa-2.5", "cc-by-sa-3.0", "cc-by-sa-4.0", "public domain", "pd"]);

const CATEGORY_QUERIES = {
  industry: ["golf course aerial view", "private golf clubhouse", "golf course landscape scenic"],
  "club-developments": ["construction site building crane", "architectural rendering building", "building renovation construction"],
  "executive-moves": ["boardroom meeting business", "corporate office meeting room", "executive office interior"],
  jobs: ["hotel lobby interior hospitality", "restaurant interior dining hospitality", "hotel reception staff"],
  technology: ["server room data center", "point of sale terminal retail", "golf simulator indoor"],
  "mergers-acquisitions": ["luxury hotel entrance facade", "corporate building entrance modern", "business handshake meeting"],
  "capital-investments": ["resort swimming pool", "fitness gym interior modern", "golf driving range practice facility"],
  "club-rankings": ["famous golf course hole scenic", "golf course coastal landscape", "golf green fairway scenic"],
  podcasts: ["podcast microphone studio", "radio studio microphone broadcast", "recording studio microphone"],
  clubopspro: ["business consulting meeting", "team meeting office leadership", "presentation conference room"]
};

const HEADERS = { "User-Agent": "ClubFlowDemoMediaBot/1.0 (internal demo dataset; contact: admin@clubflow.example)" };

// Search hits that are real Commons files but the wrong kind of image for an editorial hero photo
// (charts, infographics, etc.) — excluded even though the license check would otherwise pass.
const REJECTED_TITLES = new Set(["File:ISO 9001 Certification cost.png"]);

async function searchCommons(query, limit) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(`${query} filetype:bitmap`)}&srnamespace=6&srlimit=${limit}`;
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.query?.search ?? []).map((entry) => entry.title);
}

async function getImageInfo(title) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&format=json&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url|extmetadata|size&iiurlwidth=${TARGET_WIDTH}`;
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) return null;
  const data = await res.json();
  const pages = data.query?.pages ?? {};
  const page = Object.values(pages)[0];
  const info = page?.imageinfo?.[0];
  if (!info) return null;
  const license = (info.extmetadata?.LicenseShortName?.value ?? "").toLowerCase();
  const licenseKey = (info.extmetadata?.License?.value ?? license).toLowerCase();
  const artistRaw = info.extmetadata?.Artist?.value ?? "Unknown photographer";
  const artist = artistRaw.replace(/<[^>]+>/g, "").trim() || "Unknown photographer";
  return {
    title,
    width: info.width,
    height: info.height,
    thumbUrl: info.thumburl ?? info.url,
    descriptionUrl: info.descriptionurl,
    licenseShortName: info.extmetadata?.LicenseShortName?.value ?? "Unknown license",
    licenseKey,
    artist
  };
}

function isAcceptableLicense(licenseKey) {
  if (!licenseKey) return false;
  if (ACCEPTED_LICENSES.has(licenseKey)) return true;
  return [...ACCEPTED_LICENSES].some((accepted) => licenseKey.includes(accepted));
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Wikimedia titles/extensions don't always match true content (some .jpg search hits resolve to
// PNG bytes) — sniff the real format from magic bytes so the file is saved with an honest extension.
function detectExtension(buffer) {
  if (buffer.length >= 8 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) return "png";
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8) return "jpg";
  return null;
}

async function downloadBuffer(url, attempt = 1) {
  const res = await fetch(url, { headers: HEADERS });
  if (res.status === 429 && attempt <= 5) {
    const retryAfter = Number(res.headers.get("retry-after")) || attempt * 5;
    await sleep(retryAfter * 1000);
    return downloadBuffer(url, attempt + 1);
  }
  if (!res.ok) throw new Error(`download failed ${res.status} for ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function buildCategory(categoryKey, queries) {
  mkdirSync(join(OUT_DIR, categoryKey), { recursive: true });
  const seenTitles = new Set();
  const accepted = [];

  for (const query of queries) {
    if (accepted.length >= PER_CATEGORY) break;
    const titles = await searchCommons(query, 12);
    for (const title of titles) {
      if (accepted.length >= PER_CATEGORY) break;
      if (seenTitles.has(title)) continue;
      seenTitles.add(title);
      if (!/\.(jpe?g|png)$/i.test(title)) continue;
      let info;
      try {
        info = await getImageInfo(title);
        await new Promise((resolve) => setTimeout(resolve, 250));
      } catch {
        continue;
      }
      if (!info || !info.thumbUrl) continue;
      if (!isAcceptableLicense(info.licenseKey)) continue;
      if ((info.width ?? 0) < 900 || (info.height ?? 0) < 500) continue;
      if (REJECTED_TITLES.has(info.title)) continue;
      accepted.push(info);
    }
  }

  const manifestEntries = [];
  for (const [index, info] of accepted.entries()) {
    const n = String(index + 1).padStart(2, "0");
    const existingJpg = join(OUT_DIR, categoryKey, `${n}.jpg`);
    const existingPng = join(OUT_DIR, categoryKey, `${n}.png`);
    let fileName = existsSync(existingJpg) ? `${n}.jpg` : existsSync(existingPng) ? `${n}.png` : null;

    if (!fileName) {
      let buffer;
      try {
        buffer = await downloadBuffer(info.thumbUrl);
        await sleep(1200);
      } catch (error) {
        console.error(`Failed to download ${info.title}:`, error.message);
        continue;
      }
      const ext = detectExtension(buffer) ?? "jpg";
      fileName = `${n}.${ext}`;
      writeFileSync(join(OUT_DIR, categoryKey, fileName), buffer);
    }

    manifestEntries.push({
      file: fileName,
      sourceTitle: info.title,
      artist: info.artist,
      license: info.licenseShortName,
      sourceUrl: info.descriptionUrl
    });
    console.log(`[${categoryKey}] saved ${fileName} <- ${info.title} (${info.licenseShortName}, ${info.artist})`);
  }
  return manifestEntries;
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const manifest = {};
  for (const [categoryKey, queries] of Object.entries(CATEGORY_QUERIES)) {
    manifest[categoryKey] = await buildCategory(categoryKey, queries);
  }
  writeFileSync(join(OUT_DIR, "manifest.json"), JSON.stringify(manifest, null, 2), "utf8");
  const total = Object.values(manifest).reduce((sum, list) => sum + list.length, 0);
  console.log(`\nDone. Saved ${total} licensed demo photos across ${Object.keys(manifest).length} categories.`);
}

main();
