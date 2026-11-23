// Page behaviour: today's hours (Kyiv time), mobile menu, active anchor in the header.
// Everything works as plain HTML without this file: hours show the full week, anchors scroll.
import { hours } from "../data/site";

/* Today in Europe/Kyiv, 0 = Sunday */
const kyivDay = (): number => {
  const wd = new Intl.DateTimeFormat("en-US", { timeZone: "Europe/Kyiv", weekday: "short" }).format(new Date());
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(wd);
};
const day = kyivDay();
if (day >= 0) {
  const salon = hours.salon.find((r) => r.days.includes(day));
  const service = hours.service.find((r) => r.days.includes(day));
  const hero = document.querySelector<HTMLElement>('[data-today="hero"]');
  if (hero && salon && service) {
    hero.textContent = `Столичне шосе, 90, Київ — сьогодні салон працює ${salon.open}–${salon.close}, сервіс ${service.open}–${service.close}.`;
  }
  document.querySelectorAll<HTMLTableRowElement>("tr[data-days]").forEach((tr) => {
    const days = (tr.dataset.days ?? "").split(",").map(Number);
    if (!days.includes(day)) return;
    tr.classList.add("is-today");
    const th = tr.querySelector("th");
    if (th && !th.querySelector(".today")) {
      const tag = document.createElement("span");
      tag.className = "today";
      tag.textContent = "сьогодні";
      th.append(" ", tag);
    }
  });
}

/* Full-screen menu: <dialog> gives focus containment and Esc; closes after choosing an anchor. */
const menu = document.querySelector<HTMLDialogElement>("#menu");
const opener = document.querySelector<HTMLButtonElement>("[data-menu-open]");
if (menu && opener && typeof menu.showModal === "function") {
  opener.addEventListener("click", () => {
    menu.showModal();
    opener.setAttribute("aria-expanded", "true");
  });
  menu.querySelector("[data-menu-close]")?.addEventListener("click", () => menu.close());
  menu.querySelectorAll("[data-menu-link]").forEach((a) => a.addEventListener("click", () => menu.close()));
  menu.addEventListener("close", () => opener.setAttribute("aria-expanded", "false"));
  opener.setAttribute("aria-expanded", "false");
}

/* Active anchor: the red 2 px line under the header item of the section in view. */
const links = new Map<string, HTMLAnchorElement>();
document.querySelectorAll<HTMLAnchorElement>("a[data-nav]").forEach((a) => links.set(a.hash.slice(1), a));
if ("IntersectionObserver" in window && links.size) {
  const visible = new Map<string, number>();
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) visible.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0);
    let best = "";
    let max = 0;
    for (const [id, r] of visible) if (r > max) { max = r; best = id; }
    links.forEach((a, id) => (id === best ? a.setAttribute("aria-current", "true") : a.removeAttribute("aria-current")));
  }, { rootMargin: "-30% 0px -50% 0px", threshold: [0, 0.01, 0.25, 0.5, 1] });
  links.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
}
