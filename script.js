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

  function closeMenu() {
    burger.classList.remove('open');
    overlay.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    body.style.overflow = '';
  }

  burger.addEventListener('click', () => {
    const open = burger.classList.toggle('open');
    overlay.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    body.style.overflow = open ? 'hidden' : '';
  });

  // Close on link click
  overlay.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', closeMenu);
  });

  // Close on ESC
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu();
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

  const $ = s => document.querySelector(s);
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.15 });
  if ($('.hero__eyebrow')) tl.fromTo('.hero__eyebrow', { y: 22, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.75 });
  if ($('.hero__h1'))      tl.fromTo('.hero__h1',      { y: 36, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.0  }, '-=0.45');
  if ($('.hero__sub'))     tl.fromTo('.hero__sub',     { y: 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.75 }, '-=0.5');
  if ($('.hero__actions')) tl.fromTo('.hero__actions', { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.65 }, '-=0.45');
  if ($('.hero__scroll'))  tl.fromTo('.hero__scroll',  { autoAlpha: 0 },        { autoAlpha: 1, duration: 0.6 }, '-=0.25');
  if ($('.hero__kpis-bar'))tl.fromTo('.hero__kpis-bar',{ y: 12, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5  }, '-=0.3');
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

      gsap.fromTo(el,
        { y: 40, autoAlpha: 0 },
        { scrollTrigger: { trigger: el, start: 'top 88%', once: true }, y: 0, autoAlpha: 1, duration: 0.8, delay }
      );
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

/* ---- Cocktail Orbit ---- */
(function () {
  var COCKTAILS = [
    {
      name: 'Mojito', tag: 'Classique',
      desc: 'Rhum ambré, citron vert pressé, menthe fraîche — le classique intemporel, revisité avec Angostura.',
      ings: ['Rhum ambré', 'Citron vert pressé', 'Cassonade', 'Menthe fraîche', 'Perrier', 'Angostura'],
      profiles: ['Frais', 'Herbacé', 'Léger']
    },
    {
      name: 'FMR Spritz', tag: 'Signature',
      desc: 'Rhum infusé 48h cannelle-miel, hibiscus maison, cidre fermier — chaleureux et profond.',
      ings: ['Rhum infusé cannelle & miel', 'Sirop d\'hibiscus', 'Cidre / Jus de pomme', 'Citron vert'],
      profiles: ['Épicé', 'Miel', 'Chaleureux']
    },
    {
      name: 'Gin Tonic', tag: 'Classique',
      desc: 'Simple, élégant, indémodable. Le choix des connaisseurs, servi avec soin.',
      ings: ['Gin', 'Tonic', 'Citron vert', 'Glaçons'],
      profiles: ['Aromatique', 'Frais', 'Amer']
    },
    {
      name: 'Old Fashioned', tag: 'Classique',
      desc: 'Bourbon, orange et Angostura — le grand classique américain, boisé et profond.',
      ings: ['Whisky Bourbon', 'Écorce d\'orange', 'Angostura', 'Sucre de canne', 'Glaçons'],
      profiles: ['Boisé', 'Complexe', 'Raffiné']
    },
    {
      name: 'Basilic Smash', tag: 'Signature',
      desc: 'Limoncello, basilic frais et Perrier — un smash méditerranéen aux accents estivaux.',
      ings: ['Limoncello', 'Sirop de basilic', 'Basilic frais', 'Perrier', 'Glaçons'],
      profiles: ['Herbacé', 'Citronné', 'Estival']
    },
    {
      name: 'Piña Colada', tag: 'Classique',
      desc: 'Ananas Victoria pressé, servi dans l\'ananas. La vraie version tropicale, sans compromis.',
      ings: ['Ananas Victoria pressé', 'Rhum ambré', 'Crème de coco', 'Sirop de vanille', 'Purée de mangue'],
      profiles: ['Tropical', 'Crémeux', 'Exotique']
    }
  ];

  var orbit   = document.getElementById('cktlOrbit');
  if (!orbit) return;
  var orbs    = Array.from(orbit.querySelectorAll('.cktl-orb'));
  var N       = orbs.length;
  var active  = 0;
  var idxEl   = document.getElementById('cktlIdx');
  var tagEl   = document.getElementById('cktlTag');
  var titleEl = document.getElementById('cktlTitle');
  var descEl  = document.getElementById('cktlDesc');
  var listEl  = document.getElementById('cktlList');
  var profEl  = document.getElementById('cktlProfiles');
  var prevBtn = document.getElementById('cktlPrev');
  var nextBtn = document.getElementById('cktlNext');
  var GAP     = Math.min(200, window.innerWidth * 0.26);

  function go(idx) {
    active = ((idx % N) + N) % N;
    orbs.forEach(function (orb, i) {
      var d = ((i - active + N) % N);
      var dm = d > N / 2 ? d - N : d;
      var absD = Math.abs(dm);
      orb.classList.toggle('is-active', i === active);
      orb.style.transform = 'translate(-50%,-50%) translateX(' + (dm * GAP) + 'px) scale(' + Math.max(0.3, 1 - absD * 0.22) + ')';
      orb.style.opacity   = absD >= 3 ? '0' : '1';
      orb.style.zIndex    = 100 - absD * 10;
      orb.style.filter    = 'brightness(' + Math.max(0.5, 1 - absD * 0.16) + ')';
    });
    idxEl.textContent = String(active + 1).padStart(2, '0');
    var c = COCKTAILS[active];
    tagEl.textContent   = c.tag;
    titleEl.textContent = c.name;
    descEl.textContent  = c.desc;
    listEl.innerHTML    = c.ings.map(function (s) { return '<li>' + s + '</li>'; }).join('');
    profEl.innerHTML    = c.profiles.map(function (s) { return '<span>' + s + '</span>'; }).join('');
    [tagEl.parentElement, descEl, listEl, profEl].forEach(function (el, i) {
      if (!el) return;
      el.style.cssText += ';transition:none;opacity:0;transform:translateY(10px)';
      (function (e, delay) {
        requestAnimationFrame(function () {
          e.style.transition = 'opacity 0.5s ' + delay + 's, transform 0.5s ' + delay + 's cubic-bezier(0.32,0.72,0,1)';
          e.style.opacity = '1'; e.style.transform = 'none';
        });
      })(el, i * 0.07);
    });
  }

  prevBtn.addEventListener('click', function () { go(active - 1); });
  nextBtn.addEventListener('click', function () { go(active + 1); });
  orbit.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft')  go(active - 1);
    if (e.key === 'ArrowRight') go(active + 1);
  });

  var startX = 0, dragging = false;
  orbit.addEventListener('mousedown',  function (e) { startX = e.clientX; dragging = true; });
  window.addEventListener('mouseup',   function (e) {
    if (!dragging) return; dragging = false;
    if (Math.abs(e.clientX - startX) > 50) go(active + (e.clientX < startX ? 1 : -1));
  });
  orbit.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
  orbit.addEventListener('touchend',   function (e) {
    var dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) go(active + (dx < 0 ? 1 : -1));
  });
  orbs.forEach(function (orb, i) {
    orb.addEventListener('click', function () { if (i !== active) go(i); });
  });

  go(0);
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

/* ---- Safari iOS autoplay fallback ---- */
(function () {
  function tryPlayAll() {
    document.querySelectorAll('video[autoplay]').forEach(function (v) {
      if (v.paused) {
        v.play().catch(function () {});
      }
    });
  }
  /* Retry on first user interaction (Safari requires gesture for autoplay in some modes) */
  ['touchstart', 'touchend', 'click'].forEach(function (evt) {
    document.addEventListener(evt, tryPlayAll, { once: true, passive: true });
  });
  /* Retry when page becomes visible (e.g. tab switch, app resume) */
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) tryPlayAll();
  });
  /* Initial attempt after load */
  window.addEventListener('load', tryPlayAll);
})();
