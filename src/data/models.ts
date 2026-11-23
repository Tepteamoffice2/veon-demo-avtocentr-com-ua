// 46 models from content/models.tsv (C-009), prepared by scripts/prepare-assets.mjs into models.json.
import raw from "./models.json";

export interface ModelImage { file: string; w: number; h: number }
export interface Model {
  brand: string;
  brandSlug: string;
  name: string;
  price: number | null; // null = price on request (Peugeot e-3008 is «від 0 грн» on the old site, C-011)
  img: { x1: ModelImage; x2: ModelImage };
  natural: { w: number; h: number };
}

export const models: Model[] = raw as Model[];

/** «1 275 000» with non-breaking spaces. */
export const formatPrice = (n: number): string => n.toLocaleString("en-US").replace(/,/g, " ");
export const priceText = (m: Model): string => (m.price ? `від ${formatPrice(m.price)} грн` : "Ціну уточнюйте");

export interface Shelf { id: string; title: string; from: number; to: number; items: Model[] }
const bounds: [string, string, number, number][] = [
  ["budget-1", `до 900 000 грн`, 0, 900_000],
  ["budget-2", `900 000 – 1 200 000 грн`, 900_000, 1_200_000],
  ["budget-3", `1 200 000 – 1 500 000 грн`, 1_200_000, 1_500_000],
  ["budget-4", `від 1 500 000 грн`, 1_500_000, Infinity],
];
const byPrice = (a: Model, b: Model) => (a.price ?? 0) - (b.price ?? 0);

// Peugeot e-3008 has no price («від 0 грн» on the old site, C-011): it closes the last shelf with «Ціну уточнюйте» (U-R009).
export const shelves: Shelf[] = bounds.map(([id, title, from, to]) => ({
  id, title, from, to,
  items: [
    ...models.filter((m) => m.price !== null && m.price >= from && m.price < to).sort(byPrice),
    ...(to === Infinity ? models.filter((m) => m.price === null) : []),
  ],
}));

/** Sale brands in order of their starting price (as in the hero line). */
export const brands = (() => {
  const map = new Map<string, { brand: string; slug: string; count: number; min: number }>();
  for (const m of models) {
    const b = map.get(m.brand) ?? { brand: m.brand, slug: m.brandSlug, count: 0, min: Infinity };
    b.count += 1;
    if (m.price) b.min = Math.min(b.min, m.price);
    map.set(m.brand, b);
  }
  return [...map.values()].sort((a, b) => a.min - b.min);
})();

/** Hero line: one car per brand as listed in concept §8.2 (side profiles), ordered by price. */
const heroNames = ["Chery Tiggo 2 Pro", "Jetour X50", "Kia XCeed", "Opel Mokka", "KGM Torres", "Peugeot 408"];
export const heroCars: Model[] = heroNames.map((n) => {
  const m = models.find((x) => x.name === n);
  if (!m) throw new Error(`hero model not found: ${n}`);
  return m;
});

export const priceRange = {
  min: Math.min(...models.filter((m) => m.price).map((m) => m.price as number)),
  max: Math.max(...models.map((m) => m.price ?? 0)),
};
