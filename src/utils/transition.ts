import gsap from "gsap";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

const getScrollbarWidth = () => {
  if (typeof window === "undefined") return 0;
  return window.innerWidth - document.documentElement.clientWidth;
};

const lockBody = (locked: boolean) => {
  const body = document.body;
  const html = document.documentElement;

  if (locked) {
    const scrollBarWidth = getScrollbarWidth();
    gsap.set(body, {
      overflow: "hidden",
      paddingRight: scrollBarWidth,
      height: "100vh",
    });
    gsap.set(html, {
      overflow: "hidden",
      height: "100vh",
    });
  } else {
    gsap.set([body, html], { clearProps: "all" });
  }
};

export const animatePageIn = (container: HTMLElement) => {
  if (container) {
    lockBody(true);

    if (typeof window !== "undefined" && window.history.scrollRestoration) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);

    // 1. Set Initial GSAP State (Inline styles)
    gsap.set(container, {
      autoAlpha: 0,
      scale: 0.95,
      filter: "blur(20px) grayscale(100%) brightness(0)",
      x: 0,
    });

    // ⚡ CRITICAL: Remove the CSS lock class so GSAP can take over
    container.classList.remove("invisible-hold");

    const tl = gsap.timeline({
      defaults: { ease: "power3.out" },
      delay: 0.1,
      onComplete: () => {
        lockBody(false);
        gsap.set(container, { clearProps: "transform,filter,scale,x" });

        if (typeof window !== "undefined" && window.history.scrollRestoration) {
          window.history.scrollRestoration = "auto";
        }
      },
    });

    // 2. Animate In
    tl.to(container, {
      duration: 0.6,
      autoAlpha: 1,
      filter: "blur(0px) grayscale(0%) brightness(1)",
      scale: 1,
    });
  }
};

export const animatePageOut = (href: string, router: AppRouterInstance) => {
  const container = document.getElementById("page-transition-container");

  if (container) {
    lockBody(true);

    const tl = gsap.timeline({
      onComplete: () => {
        router.push(href, { scroll: false });
      },
    });

    tl.to(container, {
      duration: 0.4,
      autoAlpha: 0,
      filter: "blur(15px) grayscale(100%)",
      scale: 0.95,
      ease: "power3.in",
    });
  } else {
    router.push(href, { scroll: false });
  }
};