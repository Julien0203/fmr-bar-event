/* =========================================
   FMR BAR EVENT — script.js
   Outils interactifs & animations
   ========================================= */

/* ---- Nav : scroll → solid ---- */
(function () {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  function onScroll() {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ---- Burger menu mobile ---- */
(function () {
  const burger  = document.querySelector('.nav__burger');
  const overlay = document.querySelector('.nav__mobile');
  if (!burger || !overlay) return;
  const body = document.body;

  burger.addEventListener('click', () => {
    const open = burger.classList.toggle('open');
    overlay.classList.toggle('open', open);
    body.style.overflow = open ? 'hidden' : '';
  });

  // Close on link click
  overlay.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      burger.classList.remove('open');
      overlay.classList.remove('open');
      body.style.overflow = '';
    });
  });

  // Close on ESC
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      burger.classList.remove('open');
      overlay.classList.remove('open');
      body.style.overflow = '';
    }
  });
})();

/* ---- GSAP Setup ---- */
(function () {
  if (typeof gsap === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: 'power2.out' });
})();

/* ---- GSAP: Hero entrance (index — .hero) ---- */
(function () {
  if (typeof gsap === 'undefined') return;
  if (!document.querySelector('.hero__content')) return;

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.15 });
  tl.from('.hero__eyebrow', { y: 22, autoAlpha: 0, duration: 0.75 })
    .from('.hero__h1',      { y: 36, autoAlpha: 0, duration: 1.0  }, '-=0.45')
    .from('.hero__sub',     { y: 20, autoAlpha: 0, duration: 0.75 }, '-=0.5')
    .from('.hero__actions', { y: 18, autoAlpha: 0, duration: 0.65 }, '-=0.45')
    .from('.hero__scroll',  { autoAlpha: 0, duration: 0.6 }, '-=0.25')
    .from('.hero__kpis-bar',{ y: 12, autoAlpha: 0, duration: 0.5  }, '-=0.3');
})();

/* ---- GSAP: Parallax hero photo ---- */
(function () {
  if (typeof gsap === 'undefined') return;
  const heroPhoto = document.querySelector('.hero__photo');
  if (!heroPhoto) return;

  gsap.to(heroPhoto, {
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.5 },
    y: '18%', ease: 'none',
  });
})();

/* ---- GSAP: Scroll reveal (.reveal) ---- */
(function () {
  if (typeof gsap === 'undefined') return;

  const mm = gsap.matchMedia();

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    gsap.utils.toArray('.reveal').forEach(el => {
      const delay =
        el.classList.contains('reveal--delay-5') ? 0.5 :
        el.classList.contains('reveal--delay-4') ? 0.4 :
        el.classList.contains('reveal--delay-3') ? 0.3 :
        el.classList.contains('reveal--delay-2') ? 0.2 :
        el.classList.contains('reveal--delay-1') ? 0.1 : 0;

      gsap.from(el, {
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        y: 40, autoAlpha: 0, duration: 0.8, delay,
      });
    });
  });

  mm.add('(prefers-reduced-motion: reduce)', () => {
    document.querySelectorAll('.reveal').forEach(el => gsap.set(el, { autoAlpha: 1, y: 0 }));
  });
})();

/* ---- GSAP: Compteurs animés ---- */
(function () {
  if (typeof gsap === 'undefined') return;
  const cells = document.querySelectorAll('[data-count]');
  if (!cells.length) return;

  cells.forEach(el => {
    const target  = parseFloat(el.dataset.count);
    const isFloat = target % 1 !== 0;
    const suffix  = el.dataset.suffix || '';
    const prefix  = el.dataset.prefix || '';
    const proxy   = { val: 0 };

    ScrollTrigger.create({
      trigger: el, start: 'top 82%', once: true,
      onEnter: () => {
        gsap.to(proxy, {
          val: target, duration: 2, ease: 'power3.out',
          onUpdate() {
            el.textContent = prefix + (isFloat ? proxy.val.toFixed(1) : Math.round(proxy.val)) + suffix;
          },
        });
      },
    });
  });
})();

/* ---- FAQ Accordion ---- */
(function () {
  const items = document.querySelectorAll('.faq-item');
  if (!items.length) return;

  items.forEach(item => {
    const q = item.querySelector('.faq-q');
    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      // Close all
      items.forEach(i => i.classList.remove('open'));
      // Toggle this one
      if (!isOpen) item.classList.add('open');
    });
  });
})();

/* ---- Simulateur de Devis ---- */
(function () {
  const sim = document.querySelector('.js-simulator');
  if (!sim) return;

  // Tarifs : 2,5 cocktails × 9 € = 22,5 € / invité
  const GUEST_RATE = 22.5;
  const DURATIONS  = { '2h': 0.75, '3h': 1.0, '4h+': 1.4, 'journée': 2.0 };
  const TYPES      = {
    'mariage':      1.0,
    'anniversaire': 1.0,
    'soirée privée':1.0,
    'brunch':       1.0,
    'garden party': 1.0,
    'entreprise':   1.0,
  };
  const OPTIONS    = { 'bar-a-vins': 180, 'signatures': 120, 'perso': 90 };

  let state = {
    type:     null,
    guests:   80,
    duration: '3h',
    options:  new Set(),
  };

  // Options selectors
  sim.querySelectorAll('[data-sim-type]').forEach(btn => {
    btn.addEventListener('click', () => {
      sim.querySelectorAll('[data-sim-type]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.type = btn.dataset.simType;
      compute();
    });
  });

  sim.querySelectorAll('[data-sim-dur]').forEach(btn => {
    btn.addEventListener('click', () => {
      sim.querySelectorAll('[data-sim-dur]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.duration = btn.dataset.simDur;
      compute();
    });
  });

  // Range slider guests
  const slider  = sim.querySelector('.js-sim-guests');
  const valDisp = sim.querySelector('.js-sim-guests-val');
  if (slider) {
    slider.addEventListener('input', () => {
      state.guests = parseInt(slider.value);
      if (valDisp) valDisp.textContent = state.guests;
      const pct = (slider.value - slider.min) / (slider.max - slider.min) * 100;
      slider.style.background = `linear-gradient(to right, var(--c-or) ${pct}%, var(--c-noir-4) ${pct}%)`;
      compute();
    });
    const initPct = (slider.value - slider.min) / (slider.max - slider.min) * 100;
    slider.style.background = `linear-gradient(to right, var(--c-or) ${initPct}%, var(--c-noir-4) ${initPct}%)`;
  }

  // Options checkboxes
  sim.querySelectorAll('[data-sim-opt]').forEach(btn => {
    btn.addEventListener('click', () => {
      const opt = btn.dataset.simOpt;
      if (state.options.has(opt)) {
        state.options.delete(opt);
        btn.classList.remove('active');
      } else {
        state.options.add(opt);
        btn.classList.add('active');
      }
      compute();
    });
  });

  // Set defaults
  const defDur = sim.querySelector('[data-sim-dur="3h"]');
  if (defDur) defDur.classList.add('active');

  function compute() {
    const guests = state.guests;
    const typeM  = state.type     ? TYPES[state.type] || 1      : 1;
    const durM   = state.duration ? DURATIONS[state.duration] || 1 : 1;
    let   price  = guests * GUEST_RATE * typeM * durM;
    state.options.forEach(opt => { price += OPTIONS[opt] || 0; });
    price = Math.ceil(price / 50) * 50;

    const priceEl = sim.querySelector('.js-sim-price');
    if (priceEl) {
      if (typeof gsap !== 'undefined') {
        gsap.to(priceEl, {
          scale: 0.92, autoAlpha: 0.45, duration: 0.12, ease: 'power2.in',
          onComplete() {
            priceEl.textContent = price.toLocaleString('fr-FR') + ' €';
            gsap.to(priceEl, { scale: 1, autoAlpha: 1, duration: 0.35, ease: 'back.out(2)' });
          },
        });
      } else {
        priceEl.textContent = price.toLocaleString('fr-FR') + ' €';
      }
    }
  }

  // Init price on load
  compute();
})();

/* ---- Filtre cocktails ---- */
(function () {
  const tabs = document.querySelectorAll('.filter-tab');
  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const cat = tab.dataset.filter;

      document.querySelectorAll('.cocktail-item').forEach(item => {
        const match = cat === 'all' || item.dataset.cat === cat;
        item.classList.toggle('hidden', !match);
      });
    });
  });
})();

/* ---- Recherche cocktails ---- */
(function () {
  const input = document.querySelector('.js-cocktail-search');
  if (!input) return;

  input.addEventListener('input', () => {
    const q = input.value.toLowerCase().trim();
    document.querySelectorAll('.cocktail-item').forEach(item => {
      const text = item.textContent.toLowerCase();
      item.classList.toggle('hidden', q !== '' && !text.includes(q));
    });
  });
})();

/* ---- Accordion menu cocktails ---- */
(function () {
  document.querySelectorAll('.menu-item__hd').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.menu-item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.menu-item.open').forEach(el => el.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });
})();

/* ---- Smooth anchor links ---- */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 76;
    const top  = target.getBoundingClientRect().top + window.scrollY - navH - 24;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ---- Ticker duplication ---- */
(function () {
  const track = document.querySelector('.ticker__track');
  if (!track) return;
  // Clone children to fill
  const inner = track.querySelector('.ticker__inner');
  if (!inner) return;
  track.appendChild(inner.cloneNode(true));
})();

/* ---- Formulaire réservation ---- */
(function () {
  const form = document.querySelector('.js-resa-form');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const btn = form.querySelector('[type="submit"]');
    const orig = btn.textContent;

    btn.disabled = true;
    btn.textContent = 'Envoi en cours…';

    // Simulate — replace with actual fetch()
    setTimeout(() => {
      const success = form.querySelector('.form-success');
      if (success) {
        form.style.opacity = '0';
        setTimeout(() => {
          form.style.display = 'none';
          success.style.display = 'flex';
        }, 300);
      }
    }, 1200);
  });
})();

/* ---- GSAP: Cursor-following image on prestations list ---- */
(function () {
  const rows = document.querySelectorAll('.prest-row[data-img]');
  const cursorImg = document.getElementById('prestCursorImg');
  if (!rows.length || !cursorImg) return;
  if (window.matchMedia('(hover: none)').matches) return;

  const img = cursorImg.querySelector('img');

  if (typeof gsap !== 'undefined') {
    // GSAP quickTo for buttery-smooth tracking
    const xTo = gsap.quickTo(cursorImg, 'left', { duration: 0.5, ease: 'power3' });
    const yTo = gsap.quickTo(cursorImg, 'top',  { duration: 0.5, ease: 'power3' });

    document.addEventListener('mousemove', e => { xTo(e.clientX); yTo(e.clientY); });

    rows.forEach(row => {
      row.addEventListener('mouseenter', () => {
        const src = row.dataset.img;
        if (img && src) img.src = src;
        cursorImg.classList.add('is-visible');
      });
      row.addEventListener('mouseleave', () => cursorImg.classList.remove('is-visible'));
    });
  } else {
    // Fallback: lerp RAF
    let mouseX = 0, mouseY = 0, curX = 0, curY = 0, rafId = null, isVisible = false;
    document.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });
    function animate() {
      curX += (mouseX - curX) * 0.1; curY += (mouseY - curY) * 0.1;
      cursorImg.style.left = curX + 'px'; cursorImg.style.top = curY + 'px';
      if (isVisible) rafId = requestAnimationFrame(animate);
    }
    rows.forEach(row => {
      row.addEventListener('mouseenter', () => {
        const src = row.dataset.img;
        if (img && src) img.src = src;
        isVisible = true; cursorImg.classList.add('is-visible');
        if (!rafId) rafId = requestAnimationFrame(animate);
      });
      row.addEventListener('mouseleave', () => {
        isVisible = false; cursorImg.classList.remove('is-visible');
        cancelAnimationFrame(rafId); rafId = null;
      });
    });
  }
})();

/* ---- Drag-scroll horizontal strip ---- */
(function () {
  document.querySelectorAll('.js-h-scroll').forEach(el => {
    let isDown = false;
    let startX, scrollLeft;

    el.addEventListener('mousedown', e => {
      isDown = true;
      el.classList.add('dragging');
      startX    = e.pageX - el.offsetLeft;
      scrollLeft = el.scrollLeft;
    });

    el.addEventListener('mouseleave', () => {
      isDown = false;
      el.classList.remove('dragging');
    });

    el.addEventListener('mouseup', () => {
      isDown = false;
      el.classList.remove('dragging');
    });

    el.addEventListener('mousemove', e => {
      if (!isDown) return;
      e.preventDefault();
      const x    = e.pageX - el.offsetLeft;
      const walk = (x - startX) * 1.4;
      el.scrollLeft = scrollLeft - walk;
    });
  });
})();

/* ---- Cookie Banner ---- */
(function () {
  const KEY    = 'fmr-cookie-consent';
  const banner = document.getElementById('cookie-banner');
  if (!banner) return;

  if (!localStorage.getItem(KEY)) {
    setTimeout(function () { banner.classList.add('visible'); }, 900);
  }

  document.getElementById('cookie-accept').addEventListener('click', function () {
    localStorage.setItem(KEY, 'accepted');
    banner.classList.remove('visible');
  });

  document.getElementById('cookie-refuse').addEventListener('click', function () {
    localStorage.setItem(KEY, 'refused');
    banner.classList.remove('visible');
  });
})();

/* ---- Cocktail scroll arrows ---- */
(function () {
  var scroll = document.querySelector('.cocktails-feat__scroll');
  var prev  = document.querySelector('.cktl-nav--prev');
  var next  = document.querySelector('.cktl-nav--next');
  if (!scroll || !prev || !next) return;
  var STEP = 275;
  function upd() {
    prev.disabled = scroll.scrollLeft <= 1;
    next.disabled = scroll.scrollLeft >= scroll.scrollWidth - scroll.clientWidth - 1;
  }
  prev.addEventListener('click', function () { scroll.scrollBy({ left: -STEP, behavior: 'smooth' }); });
  next.addEventListener('click', function () { scroll.scrollBy({ left:  STEP, behavior: 'smooth' }); });
  scroll.addEventListener('scroll', upd, { passive: true });
  upd();
})();

/* ---- Testi Carousel arrows ---- */
(function () {
  document.querySelectorAll('.testi-carousel').forEach(function (car) {
    var track = car.querySelector('.testi-carousel__track');
    var prev  = car.querySelector('.testi-nav--prev');
    var next  = car.querySelector('.testi-nav--next');
    if (!track || !prev || !next) return;
    function upd() {
      prev.disabled = track.scrollLeft <= 1;
      next.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 1;
    }
    var STEP = 360;
    prev.addEventListener('click', function () { track.scrollBy({ left: -STEP, behavior: 'smooth' }); });
    next.addEventListener('click', function () { track.scrollBy({ left:  STEP, behavior: 'smooth' }); });
    track.addEventListener('scroll', upd, { passive: true });
    upd();
  });
})();
