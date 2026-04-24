"use strict";

// =============================================================================
// Portfolio — behaviour (vanilla JS)
//
// BEGINNER EDIT MAP
// - Hero background image: style.css → search "HERO — BACKGROUND IMAGE" (url(...))
// - Project repo links: index.html → each .project-card (add <a> when ready; remove .project-pending)
// - Nav sections: add <section id="..."> + matching <a href="#..."> in the header
//
// This file provides (refined, not noisy):
// - Hero particles (off if prefers-reduced-motion)
// - Light scroll parallax on hero background + particles
// - Cursor parallax on .highlight-card (desktop)
// - Scroll reveal (.reveal → .visible)
// - Sticky header state + active nav link by section
// =============================================================================

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ------------------------------
// 1) Set current year in footer
// ------------------------------
const yearElement = document.getElementById("year");
if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

// ------------------------------
// 2) Mobile menu toggle
// ------------------------------
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isExpanded));
    navLinks.classList.toggle("open");
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menuToggle.setAttribute("aria-expanded", "false");
      navLinks.classList.remove("open");
    });
  });
}

// ------------------------------
// 3) Reveal on scroll
// ------------------------------
const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window && revealElements.length > 0) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -6% 0px",
    }
  );

  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("visible"));
}

// ------------------------------
// 4) Hero particles / soft stars
// ------------------------------
const particleContainer = document.getElementById("heroParticles");
const heroSection = document.getElementById("hero");

/** Keep low for a calm, editorial feel (30–36 is a good range). */
const PARTICLE_COUNT = 30;

function createParticles(count = PARTICLE_COUNT) {
  if (!particleContainer || prefersReducedMotion) return;

  for (let i = 0; i < count; i += 1) {
    const particle = document.createElement("span");
    particle.className = "particle";

    const size = (Math.random() * 3.2 + 2).toFixed(2);
    const x = (Math.random() * 100).toFixed(2);
    const y = (Math.random() * 100).toFixed(2);
    const twinkleDuration = (Math.random() * 5 + 4).toFixed(2);
    const driftDuration = (Math.random() * 10 + 12).toFixed(2);
    const delay = (Math.random() * 6).toFixed(2);

    particle.style.left = `${x}%`;
    particle.style.top = `${y}%`;
    particle.style.setProperty("--size", `${size}px`);
    particle.style.setProperty("--twinkle-duration", `${twinkleDuration}s`);
    particle.style.setProperty("--drift-duration", `${driftDuration}s`);
    particle.style.animationDelay = `${delay}s`;

    particleContainer.appendChild(particle);
  }
}

createParticles();

// ------------------------------
// 5) Gentle hero parallax (optional)
//     Background + stars drift slightly on scroll; disabled if reduced motion.
// ------------------------------
let scrollTicking = false;

function updateHeroParallax() {
  if (!heroSection || prefersReducedMotion) return;

  const rect = heroSection.getBoundingClientRect();
  const vh = window.innerHeight;
  if (rect.bottom < 0 || rect.top > vh) {
    return;
  }

  // Tie movement to scroll position via getBoundingClientRect().top — soft cap for calm motion.
  const raw = rect.top * 0.035;
  const bgShift = Math.max(-14, Math.min(14, raw));
  const starShift = bgShift * 0.5;

  heroSection.style.setProperty("--hero-parallax-y", `${bgShift}px`);
  heroSection.style.setProperty("--hero-particles-y", `${starShift}px`);
}

// ------------------------------
// 6) Cursor-based parallax on highlight cards (gentle, desktop)
// ------------------------------
if (heroSection && !prefersReducedMotion) {
  const highlightCards = heroSection.querySelectorAll(".highlight-card");
  let moveTicking = false;

  window.addEventListener(
    "mousemove",
    (event) => {
      if (window.innerWidth < 900) return;
      if (moveTicking) return;
      moveTicking = true;

      requestAnimationFrame(() => {
        const { innerWidth, innerHeight } = window;
        const xOffset = (event.clientX / innerWidth - 0.5) * 10;
        const yOffset = (event.clientY / innerHeight - 0.5) * 8;

        highlightCards.forEach((card, index) => {
          const depth = (index + 1) * 0.12;
          card.style.setProperty("--px", `${xOffset * depth}px`);
          card.style.setProperty("--py", `${yOffset * depth}px`);
        });

        moveTicking = false;
      });
    },
    { passive: true }
  );
}

// ------------------------------
// 7) Scroll: header + hero parallax (one listener, rAF)
// ------------------------------
const siteHeader = document.querySelector(".site-header");

function onScrollFrame() {
  if (siteHeader) {
    siteHeader.classList.toggle("scrolled", window.scrollY > 18);
  }
  updateHeroParallax();
  scrollTicking = false;
}

window.addEventListener(
  "scroll",
  () => {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(onScrollFrame);
  },
  { passive: true }
);

if (siteHeader) {
  siteHeader.classList.toggle("scrolled", window.scrollY > 18);
}
updateHeroParallax();

// ------------------------------
// 8) Active nav link by section
// ------------------------------
const navAnchors = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
const sections = navAnchors
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

if ("IntersectionObserver" in window && navAnchors.length > 0 && sections.length > 0) {
  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const activeId = `#${entry.target.id}`;
        navAnchors.forEach((link) => {
          link.classList.toggle("active", link.getAttribute("href") === activeId);
        });
      });
    },
    {
      threshold: 0.42,
      rootMargin: "-10% 0px -45% 0px",
    }
  );

  sections.forEach((section) => navObserver.observe(section));
}
