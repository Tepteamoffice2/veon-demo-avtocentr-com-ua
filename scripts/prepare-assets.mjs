// One-off asset preparation (run: npm run assets). Results are committed, so `npm run build` does not need ../content.
// 1) Fonts: copies latin + cyrillic woff2 subsets of Fira Sans / Fira Sans Condensed (OFL) from @fontsource to public/fonts.
// 2) Models: reads ../content/models.tsv, trims transparent margins of each PNG (cars stand on the bottom edge = wheels),
//    writes WebP 1x/2x to public/models and src/data/models.json with sizes. Never upscales past the natural size.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PROJECT = path.resolve(SITE, "..");
const nm = (p) => path.join(SITE, "node_modules", p);

// Fonts
const fontsOut = path.join(SITE, "public", "fonts");
fs.rmSync(fontsOut, { recursive: true, force: true });
fs.mkdirSync(fontsOut, { recursive: true });
const FONTS = { "fira-sans-condensed": [600, 700], "fira-sans": [400, 600, 700] };
for (const [fam, weights] of Object.entries(FONTS)) {
  for (const w of weights) for (const sub of ["latin", "cyrillic"]) {
    const name = `${fam}-${sub}-${w}-normal.woff2`;
    fs.copyFileSync(nm(`@fontsource/${fam}/files/${name}`), path.join(fontsOut, name));
  }
}
fs.copyFileSync(nm("@fontsource/fira-sans/LICENSE"), path.join(fontsOut, "OFL.txt"));

// Models
const CARD_W = 232; // css px of a car in a card (1x); 2x = 464, both capped by the trimmed natural width
const rows = fs.readFileSync(path.join(PROJECT, "content", "models.tsv"), "utf8").trim().split(/\r?\n/);
const out = path.join(SITE, "public", "models");
fs.mkdirSync(out, { recursive: true });
// Source defects (concept §5 «Изображения»): e-3008 has a stray blue badge top-left, Frontera stands on a blue floor.
// Pixels matching these rules become transparent before trimming (coordinates of the 619x260 source).
const inWheel = (x, y) => Math.hypot(x - 122, y - 210) <= 50 || Math.hypot(x - 505, y - 210) <= 50;
const CLEAN = {
  "0001_86": (x, y, r, g, b) => (x < 108 && y < 80) || (x < 108 && y < 100 && b > 180 && g > 120 && r < 120 && b - r > 90),
  "0001_85": (x, y, r, g, b, a) => y >= 214 && (!inWheel(x, y) || a < 160),
};
async function load(src, id) {
  if (!CLEAN[id]) return sharp(src);
  const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
    const i = (y * info.width + x) * 4;
    if (data[i + 3] > 0 && CLEAN[id](x, y, data[i], data[i + 1], data[i + 2], data[i + 3])) data[i + 3] = 0;
  }
  return sharp(data, { raw: info });
}
const brandSlug = { Kia: "kia", Opel: "opel", Peugeot: "peugeot", Chery: "chery", Jetour: "jetour", KGM: "kgm" };
const models = [];
for (const row of rows) {
  const [brand, name, , imgId, price] = row.split("|");
  const id = imgId.replace("/", "_");
  const src = path.join(PROJECT, "content", "client-assets", "models", `${id}.png`);
  const trimmed = await (await load(src, id)).trim({ threshold: 8 }).png().toBuffer({ resolveWithObject: true });
  const w2 = Math.min(trimmed.info.width, CARD_W * 2);
  const w1 = Math.min(trimmed.info.width, CARD_W);
  const files = {};
  for (const [key, w] of [["x1", w1], ["x2", w2]]) {
    const file = `${id}-${w}.webp`;
    const info = await sharp(trimmed.data).resize({ width: w, withoutEnlargement: true }).webp({ quality: 82, alphaQuality: 90, effort: 6 }).toFile(path.join(out, file));
    files[key] = { file: `/models/${file}`, w: info.width, h: info.height };
  }
  models.push({
    brand, brandSlug: brandSlug[brand], name,
    price: Number(price) || null,
    img: files, natural: { w: trimmed.info.width, h: trimmed.info.height },
  });
  console.log(id, name, trimmed.info.width + "x" + trimmed.info.height, "->", files.x1.w, files.x2.w);
}
fs.mkdirSync(path.join(SITE, "src", "data"), { recursive: true });
fs.writeFileSync(path.join(SITE, "src", "data", "models.json"), JSON.stringify(models, null, 1) + "\n");
console.log(`models: ${models.length}`);
