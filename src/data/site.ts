// Facts from veon/client.json only (company.contacts, socials, C-001 / B-F005). Nothing here is invented.

export const phones = {
  salon: { label: "(044) 206-80-00", href: "tel:+380442068000" },
  salon2: { label: "(067) 406-80-00", href: "tel:+380674068000" },
  service: { label: "(044) 206-80-05", href: "tel:+380442068005" },
  service2: { label: "(044) 206-80-07", href: "tel:+380442068007" },
} as const;

export const email = { label: "info@avtocentr.com.ua", href: "mailto:info@avtocentr.com.ua" } as const;

export const address = {
  street: "Столичне шосе, 90",
  locality: "м. Київ",
  district: "Голосіївський район",
  postal: "03045",
  full: "03045, м. Київ, Голосіївський район, Столичне шосе, 90",
} as const;

export const mapsUrl =
  "https://www.google.com/maps/search/?api=1&query=" +
  encodeURIComponent("Столичне шосе, 90, Київ, 03045");

export const socials = [
  { name: "Instagram", url: "https://www.instagram.com/ukravto.na.stolychnomu/" },
  { name: "Facebook", url: "https://www.facebook.com/ukravto.na.stolychnomu/" },
  { name: "YouTube", url: "https://www.youtube.com/channel/UCO8ZdGYbjWjq4iVBYuB8Fbg" },
] as const;

/** Opening hours (C-001). `days` uses JS getDay(): 0 = Sunday. */
export interface HoursRow { label: string; days: number[]; open: string; close: string }
export const hours: Record<"salon" | "service", HoursRow[]> = {
  salon: [
    { label: "Пн–пт", days: [1, 2, 3, 4, 5], open: "09:00", close: "19:00" },
    { label: "Субота", days: [6], open: "10:00", close: "18:00" },
    { label: "Неділя", days: [0], open: "10:00", close: "16:00" },
  ],
  service: [
    { label: "Пн–пт", days: [1, 2, 3, 4, 5], open: "08:00", close: "20:00" },
    { label: "Субота", days: [6], open: "09:00", close: "18:00" },
    { label: "Неділя", days: [0], open: "09:00", close: "16:00" },
  ],
};

export const saleBrands = ["Chery", "Jetour", "Kia", "Opel", "Peugeot", "KGM"] as const;
export const serviceBrands = ["Kia", "Opel", "Peugeot", "Citroen", "Chery", "Jetour", "KGM"] as const;

/** Ukrainian plural: 1 модель, 2 моделі, 5 моделей. */
export const plural = (n: number, one: string, few: string, many: string): string => {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
};
export const modelsWord = (n: number): string => `${n}\u00a0${plural(n, "модель", "моделі", "моделей")}`;
