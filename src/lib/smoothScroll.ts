import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Lo spazio sotto l'header sticky lo danno le classi scroll-mt-* delle sezioni,
// che Lenis rispetta come scrollIntoView.
let lenis: Lenis | null = null;

/** Avvia Lenis e lo sincronizza con il ticker di GSAP e ScrollTrigger. */
export function initSmoothScroll() {
  if (lenis || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};

  const instance = new Lenis({ duration: 1.1, anchors: true });
  lenis = instance;
  instance.on("scroll", ScrollTrigger.update);

  const tick = (time: number) => instance.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  return () => {
    gsap.ticker.remove(tick);
    instance.destroy();
    lenis = null;
  };
}

export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenis) lenis.scrollTo(el);
  else el.scrollIntoView({ block: "start" });
}

export function scrollToTop() {
  if (lenis) lenis.scrollTo(0);
  else window.scrollTo({ top: 0 });
}

/** Blocca lo scroll della pagina (es. con una modale aperta). */
export function lockScroll(locked: boolean) {
  if (locked) lenis?.stop();
  else lenis?.start();
}
