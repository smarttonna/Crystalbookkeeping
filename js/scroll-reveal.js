/**
 * Crystal Bookkeeping — Scroll Reveal System
 * ─────────────────────────────────────────────────────────────
 * Uses IntersectionObserver to reveal elements as they enter
 * the viewport. No external library. Handles preloader timing.
 * ─────────────────────────────────────────────────────────────
 */
(function () {
  'use strict';

  const STAGGER_MS  = 120;   // delay between staggered siblings (ms)
  const IO_THRESHOLD = 0.10; // % of element visible to trigger
  const IO_MARGIN   = '0px 0px -55px 0px'; // shrink bottom trigger zone

  // Animation type CSS classes (defined in style.css)
  const T = {
    UP:    'sr-fade-up',
    LEFT:  'sr-fade-left',
    RIGHT: 'sr-fade-right',
    SCALE: 'sr-scale-in',
    TILT:  'sr-zoom-tilt',
    FLIP:  'sr-flip-up',
  };

  /** Is this element already visible at page load (above the fold)? */
  function aboveFold(el) {
    return el.getBoundingClientRect().top < window.innerHeight * 0.9;
  }

  /** Mark element for reveal animation */
  function mark(el, type, delayMs, speed) {
    if (!el || el.classList.contains('sr-hidden') || aboveFold(el)) return null;
    if (el.closest('.tab-pane') || el.closest('.accordion') || el.closest('.modal')) return null;
    el.classList.add('sr-hidden', type);
    if (speed)   el.classList.add('sr-' + speed);   // 'fast' | 'slow'
    if (delayMs) el.style.transitionDelay = delayMs + 'ms';
    return el;
  }

  function initReveal() {
    const pool = new Set(); // elements to observe

    function add(el, type, delay, speed) {
      const result = mark(el, type, delay, speed);
      if (result) pool.add(result);
    }

    /* ──────────────────────────────────────────────────────────
       1.  BADGE / LABEL PILLS  — fast fade-up
    ────────────────────────────────────────────────────────── */
    document.querySelectorAll(
      '.badge-pill-lime, .section-label, .top-bar-badge'
    ).forEach(el => add(el, T.UP, 0, 'fast'));

    /* ──────────────────────────────────────────────────────────
       2.  HEADINGS (section context, not navbar/footer brand)
    ────────────────────────────────────────────────────────── */
    document.querySelectorAll(
      'main h2:not(.accordion-header), main .h2, section h2:not(.accordion-header), section .h2, ' +
      'section h3, section .h3, section h4, section .h4'
    ).forEach(el => add(el, T.FLIP, 60));

    /* ──────────────────────────────────────────────────────────
       3.  LEAD PARAGRAPHS
    ────────────────────────────────────────────────────────── */
    document.querySelectorAll(
      'section p.lead, section .section-intro, section > .container > p'
    ).forEach(el => add(el, T.UP, 100));

    /* ──────────────────────────────────────────────────────────
       4.  IMAGES / VISUAL BLOCKS — slow scale-in
    ────────────────────────────────────────────────────────── */
    document.querySelectorAll(
      '.hero-image-wrapper, .founder-image-frame, .about-image-wrap, ' +
      'section img.img-fluid, .img-reveal'
    ).forEach(el => add(el, T.SCALE, 0, 'slow'));

    /* ──────────────────────────────────────────────────────────
       5.  SPECIFIC CARD / FEATURE ELEMENTS
          (stagger up to 4 per visible row)
    ────────────────────────────────────────────────────────── */
    document.querySelectorAll(
      '.approach-card, .service-card, .package-card, ' +
      '.stat-card, .process-step, .review-card, .feature-card, ' +
      '.credential-badge, .floating-stat-card'
    ).forEach((el, i) => add(el, T.UP, (i % 4) * STAGGER_MS));

    /* ──────────────────────────────────────────────────────────
       6.  GRID ROWS — stagger each column child
    ────────────────────────────────────────────────────────── */
    document.querySelectorAll('section .row, .site-footer .row').forEach(row => {
      const cols = [...row.children].filter(c => /\bcol/.test(c.className));
      if (cols.length < 2) return; // skip single-col rows
      cols.forEach((col, i) => {
        add(col, T.UP, i * STAGGER_MS);
      });
    });

    /* ──────────────────────────────────────────────────────────
       7.  CTA SECTIONS — zoom-tilt for drama
    ────────────────────────────────────────────────────────── */
    document.querySelectorAll(
      '.cta-section, .cta-inner, .booking-cta, section.bg-dark-forest > .container'
    ).forEach(el => add(el, T.TILT, 0));

    /* ──────────────────────────────────────────────────────────
       8.  BUTTONS (in sections, not navbar)
    ────────────────────────────────────────────────────────── */
    document.querySelectorAll(
      'section .btn-lime, section .btn-outline-lime'
    ).forEach((el, i) => add(el, T.UP, 150 + i * 60, 'fast'));

    /* ──────────────────────────────────────────────────────────
       9.  FOOTER COLUMNS
    ────────────────────────────────────────────────────────── */
    document.querySelectorAll(
      '.site-footer .row > [class*="col-"]'
    ).forEach((el, i) => add(el, T.UP, i * 110));

    /* ──────────────────────────────────────────────────────────
       10. LIST ITEMS IN FEATURE LISTS
    ────────────────────────────────────────────────────────── */
    document.querySelectorAll(
      'section .feature-list li, section .check-list li'
    ).forEach((el, i) => add(el, T.UP, i * 60, 'fast'));

    /* ──────────────────────────────────────────────────────────
       INTERSECTION OBSERVER — fire once per element
    ────────────────────────────────────────────────────────── */
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (!isIntersecting) return;
        target.classList.add('sr-revealed');
        // Clear delay after reveal so it doesn't interfere with hover etc.
        target.style.transitionDelay = '';
        observer.unobserve(target);
      });
    }, { threshold: IO_THRESHOLD, rootMargin: IO_MARGIN });

    pool.forEach(el => observer.observe(el));
    console.log(`[ScrollReveal] Observing ${pool.size} elements.`);
  }

  /* ──────────────────────────────────────────────────────────────
     BOOT: wait for preloader to finish, then init
  ────────────────────────────────────────────────────────────── */
  function boot() {
    const preloader = document.getElementById('crystalPreloader');

    if (preloader) {
      // Watch for the preloader display:none (set in preloader.js)
      const mo = new MutationObserver(() => {
        if (preloader.style.display === 'none') {
          mo.disconnect();
          setTimeout(initReveal, 150); // slight buffer after reveal
        }
      });
      mo.observe(preloader, { attributes: true, attributeFilter: ['style'] });

      // Hard fallback in case observer misses it
      setTimeout(initReveal, 7500);
    } else {
      initReveal();
    }
  }

  // Kick off
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
