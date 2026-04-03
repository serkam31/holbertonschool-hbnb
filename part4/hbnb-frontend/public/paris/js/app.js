/* ═══════════════════════════════════════════════════════════
   HBNB — Scroll-Driven Landing Page
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const FRAME_COUNT         = 121;
  const FRAME_SPEED         = 2.0;
  const IMAGE_SCALE         = 0.88;
  const FRAME_PATH          = (i) => `../frames/frame${String(i).padStart(4,'0')}.webp`;
  const CANVAS_LEFT_FINAL   = 33.333;
  const CANVAS_WIDTH_FINAL  = 66.667;
  const HERO_TRANSITION_END = 0.08;

  /* ─── DOM ───────────────────────────────────────────── */
  const loader          = document.getElementById('loader');
  const loaderBar       = document.getElementById('loader-bar');
  const loaderPercent   = document.getElementById('loader-percent');
  const header          = document.getElementById('site-header');
  const heroSection     = document.getElementById('hero-section');
  const canvasWrap      = document.getElementById('canvas-wrap');
  const canvas          = document.getElementById('canvas');
  const ctx             = canvas.getContext('2d');
  const darkOverlay     = document.getElementById('dark-overlay');
  const marqueeWrap     = document.getElementById('marquee-wrap');
  const scrollContainer = document.getElementById('scroll-container');
  const navToggle       = document.querySelector('.nav-toggle');
  const navLinks        = document.querySelector('.nav-links');

  const frames      = new Array(FRAME_COUNT).fill(null);
  let loadedCount   = 0;
  let currentFrame  = 0;
  let bgColor       = '#0a0a0a';
  let lenis;

  /* ══════════════════════════════════════════════════════
     CANVAS
  ════════════════════════════════════════════════════════ */
  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width  = canvas.offsetWidth  * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    ctx.scale(dpr, dpr);
    drawFrame(currentFrame);
  }
  window.addEventListener('resize', resizeCanvas);

  function sampleBgColor(img) {
    const t = document.createElement('canvas');
    t.width = t.height = 4;
    const tc = t.getContext('2d');
    tc.drawImage(img, 0, 0, 4, 4);
    const d = tc.getImageData(0, 0, 4, 4).data;
    return `rgb(${d[0]},${d[1]},${d[2]})`;
  }

  function drawFrame(index) {
    const img = frames[index];
    if (!img) return;
    const cw = canvas.offsetWidth, ch = canvas.offsetHeight;
    const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight) * IMAGE_SCALE;
    const dw = img.naturalWidth * scale, dh = img.naturalHeight * scale;
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, cw, ch);
    ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
  }

  /* ══════════════════════════════════════════════════════
     PRELOADER
  ════════════════════════════════════════════════════════ */
  function loadFrame(i) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        frames[i] = img;
        loadedCount++;
        if (i % 20 === 0) bgColor = sampleBgColor(img);
        const pct = Math.round((loadedCount / FRAME_COUNT) * 100);
        loaderBar.style.width = pct + '%';
        loaderPercent.textContent = pct + '%';
        resolve();
      };
      img.onerror = () => { loadedCount++; resolve(); };
      img.src = FRAME_PATH(i + 1);
    });
  }

  async function preloadFrames() {
    const p1 = [];
    for (let i = 0; i < 10; i++) p1.push(loadFrame(i));
    await Promise.all(p1);
    if (frames[0]) { bgColor = sampleBgColor(frames[0]); resizeCanvas(); }
    const p2 = [];
    for (let i = 10; i < FRAME_COUNT; i++) p2.push(loadFrame(i));
    await Promise.all(p2);
    loader.classList.add('hidden');
    setTimeout(() => { loader.style.display = 'none'; initApp(); }, 800);
  }

  /* ══════════════════════════════════════════════════════
     LENIS
  ════════════════════════════════════════════════════════ */
  function initLenis() {
    lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  /* ══════════════════════════════════════════════════════
     HEADER + NAV
  ════════════════════════════════════════════════════════ */
  function initHeader() {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });

    document.querySelectorAll('a[href^="#section-"]').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.getElementById(link.getAttribute('href').slice(1));
        if (!target) return;
        // Each section is a scroll sentinel — its offsetTop is its trigger point
        const y = target.offsetTop;
        lenis ? lenis.scrollTo(y, { duration: 2 }) : window.scrollTo({ top: y, behavior: 'smooth' });
        navLinks.classList.remove('open');
      });
    });

    if (navToggle) navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
  }

  /* ══════════════════════════════════════════════════════
     HERO → CANVAS TRANSITION
     Canvas starts full-viewport (left:0, width:100vw)
     Scrolling 0–8%: shrinks to right 2/3
  ════════════════════════════════════════════════════════ */
  function initHeroToCanvas() {
    // The hero section is fixed — it lives above the scroll container.
    // We track document scroll directly.
    const heroHeight = window.innerHeight; // 100vh

    function onScroll() {
      const scrollY = window.scrollY;
      const t = Math.min(1, scrollY / (heroHeight * HERO_TRANSITION_END * 10));
      // ease-in-out quad
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      canvasWrap.style.left  = (eased * CANVAS_LEFT_FINAL)  + 'vw';
      canvasWrap.style.width = (100 - eased * (100 - CANVAS_WIDTH_FINAL)) + 'vw';
      heroSection.style.opacity = Math.max(0, 1 - scrollY / (heroHeight * 0.4)).toString();
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // init
  }

  /* ══════════════════════════════════════════════════════
     FRAME → SCROLL
  ════════════════════════════════════════════════════════ */
  function initFrameScroll() {
    ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        const idx = Math.min(Math.floor(Math.min(self.progress * FRAME_SPEED, 1) * FRAME_COUNT), FRAME_COUNT - 1);
        if (idx !== currentFrame) { currentFrame = idx; requestAnimationFrame(() => drawFrame(idx)); }
      },
    });
  }

  /* ══════════════════════════════════════════════════════
     DARK OVERLAY (stats section)
  ════════════════════════════════════════════════════════ */
  function initDarkOverlay() {
    const statsSection = document.querySelector('.section-stats');
    if (!statsSection) return;

    gsap.fromTo(darkOverlay,
      { opacity: 0 },
      {
        opacity: 0.92,
        scrollTrigger: {
          trigger: statsSection,
          start: 'top 80%',
          end: 'bottom 20%',
          scrub: true,
        },
      }
    );
  }

  /* ══════════════════════════════════════════════════════
     MARQUEE
  ════════════════════════════════════════════════════════ */
  function initMarquee() {
    gsap.to(marqueeWrap.querySelector('.marquee-text'), {
      xPercent: -30,
      ease: 'none',
      scrollTrigger: { trigger: scrollContainer, start: 'top top', end: 'bottom bottom', scrub: true },
    });
    gsap.fromTo(marqueeWrap,
      { opacity: 0 },
      {
        opacity: 1,
        scrollTrigger: {
          trigger: scrollContainer,
          start: '20% top',
          end: '85% top',
          scrub: true,
          onLeave: () => gsap.to(marqueeWrap, { opacity: 0, duration: 0.3 }),
          onEnterBack: () => gsap.to(marqueeWrap, { opacity: 1, duration: 0.3 }),
        },
      }
    );
  }

  /* ══════════════════════════════════════════════════════
     SECTIONS — each section is a "sentinel" div that
     ScrollTrigger pins to trigger the animation.
     The actual content panel is fixed to the left side.
  ════════════════════════════════════════════════════════ */
  function initSections() {
    document.querySelectorAll('.scroll-section').forEach((section) => {
      const type    = section.dataset.animation || 'fade-up';
      const persist = section.dataset.persist === 'true';

      const children = section.querySelectorAll(
        '.section-label, .section-heading, .section-body, .section-body-secondary, ' +
        '.section-note, .cta-button, .stat, .quote-text, .quote-cite'
      );

      // Build entrance timeline
      const tl = gsap.timeline({ paused: true });
      switch (type) {
        case 'slide-left':  tl.from(children, { x: -60, opacity: 0, stagger: 0.12, duration: 0.85, ease: 'power3.out' }); break;
        case 'fade-up':     tl.from(children, { y: 40,  opacity: 0, stagger: 0.11, duration: 0.85, ease: 'power3.out' }); break;
        case 'scale-up':    tl.from(children, { scale: 0.88, opacity: 0, stagger: 0.11, duration: 0.95, ease: 'power2.out' }); break;
        case 'rotate-in':   tl.from(children, { y: 35, rotation: 2, opacity: 0, stagger: 0.1,  duration: 0.85, ease: 'power3.out' }); break;
        case 'stagger-up':  tl.from(children, { y: 50,  opacity: 0, stagger: 0.13, duration: 0.8,  ease: 'power3.out' }); break;
        case 'clip-reveal': tl.from(children, { clipPath: 'inset(100% 0 0 0)', opacity: 0, stagger: 0.14, duration: 1.1, ease: 'power4.inOut' }); break;
        default:            tl.from(children, { opacity: 0, stagger: 0.1, duration: 0.8, ease: 'power3.out' });
      }

      // Keep text hidden until triggered
      gsap.set(children, { opacity: 0 });

      ScrollTrigger.create({
        trigger: section,
        start: 'top 65%',   // section top hits 65% of viewport → animate in
        end: persist ? 'bottom -200%' : 'bottom 10%',
        onEnter:     () => { section.style.visibility = 'visible'; tl.play(); },
        onLeave:     () => { if (!persist) { tl.reverse(); } },
        onEnterBack: () => { section.style.visibility = 'visible'; tl.play(); },
        onLeaveBack: () => { tl.reverse(); setTimeout(() => { if (tl.progress() === 0) section.style.visibility = 'hidden'; }, 900); },
      });
    });
  }

  /* ══════════════════════════════════════════════════════
     COUNTERS
  ════════════════════════════════════════════════════════ */
  function initCounters() {
    document.querySelectorAll('.stat-number').forEach((el) => {
      const target   = parseFloat(el.dataset.value);
      const decimals = parseInt(el.dataset.decimals || '0', 10);
      gsap.fromTo(el, { textContent: 0 }, {
        textContent: target,
        duration: 2,
        ease: 'power1.out',
        snap: { textContent: decimals === 0 ? 1 : 0.1 },
        onUpdate() {
          const v = parseFloat(this.targets()[0].textContent);
          this.targets()[0].textContent = decimals > 0 ? v.toFixed(decimals) : Math.round(v).toString();
        },
        scrollTrigger: { trigger: el.closest('.scroll-section'), start: 'top 70%', toggleActions: 'play none none reverse' },
      });
    });
  }

  /* ══════════════════════════════════════════════════════
     INIT
  ════════════════════════════════════════════════════════ */
  function initApp() {
    gsap.registerPlugin(ScrollTrigger);
    initLenis();
    initHeader();
    resizeCanvas();
    initHeroToCanvas();
    initFrameScroll();
    initDarkOverlay();
    initMarquee();
    initSections();
    initCounters();
    ScrollTrigger.refresh();
  }

  /* ══════════════════════════════════════════════════════
     RESIDENCES MODAL
  ════════════════════════════════════════════════════════ */
  function initModal(modalId, triggerId) {
    const modal    = document.getElementById(modalId);
    const backdrop = modal.querySelector('.modal-backdrop');
    const closeBtn = modal.querySelector('.modal-close');
    const trigger  = document.getElementById(triggerId);

    function openModal() {
      // Close any other open modal first
      document.querySelectorAll('.modal-panel').forEach((p) => p.closest('[id$="-modal"]').classList.remove('open'));
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
      if (lenis) lenis.stop();
    }

    function closeModal() {
      modal.classList.remove('open');
      document.body.style.overflow = '';
      if (lenis) lenis.start();
    }

    trigger.addEventListener('click', (e) => { e.preventDefault(); openModal(); });
    backdrop.addEventListener('click', closeModal);
    closeBtn.addEventListener('click', closeModal);
    modal.querySelectorAll('.modal-cta-link').forEach((link) => {
      link.addEventListener('click', () => closeModal());
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
    });
  }

  function initResidencesModal() {
    initModal('residences-modal', 'nav-residences');
    initModal('locations-modal',  'nav-locations');
  }

  // Modal is ready as soon as DOM is parsed (script is at bottom of body)
  initResidencesModal();
  preloadFrames();
})();
