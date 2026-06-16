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

/* ---- Reveal on scroll ---- */
(function () {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  els.forEach(el => io.observe(el));
})();

/* ---- Compteurs animés ---- */
(function () {
  const cells = document.querySelectorAll('[data-count]');
  if (!cells.length) return;

  function animateCount(el, target, duration = 2000) {
    const isFloat = target % 1 !== 0;
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const start  = performance.now();

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const value    = eased * target;
      el.textContent = prefix + (isFloat ? value.toFixed(1) : Math.round(value)) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el     = entry.target;
        const target = parseFloat(el.dataset.count);
        animateCount(el, target);
        io.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  cells.forEach(el => io.observe(el));
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

  // Tarifs base
  const BASE       = 350;
  const GUEST_RATE = 3.5;  // € par invité au-delà de 30
  const MIN_GUESTS = 30;

  const DURATIONS  = { '2h': 1, '3h': 1.3, '4h+': 1.6, 'journée': 2.1 };
  const TYPES      = {
    'mariage':     1.30,
    'anniversaire':1.10,
    'soirée privée':1.05,
    'brunch':      1.05,
    'garden party':1.00,
    'entreprise':  1.20,
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
    let   price  = BASE;

    if (guests > MIN_GUESTS) price += (guests - MIN_GUESTS) * GUEST_RATE;
    price *= typeM * durM;
    state.options.forEach(opt => { price += OPTIONS[opt] || 0; });
    price = Math.ceil(price / 50) * 50;

    const priceEl = sim.querySelector('.js-sim-price');
    if (priceEl) {
      priceEl.style.transform = 'scale(1.08)';
      priceEl.style.opacity   = '.6';
      setTimeout(() => {
        priceEl.textContent    = price.toLocaleString('fr-FR') + ' €';
        priceEl.style.transform = '';
        priceEl.style.opacity   = '';
      }, 90);
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

/* ---- Cursor-following image on prestations list ---- */
(function () {
  const rows = document.querySelectorAll('.prest-row[data-img]');
  const cursorImg = document.getElementById('prestCursorImg');
  if (!rows.length || !cursorImg) return;

  // Disable on touch devices
  if (window.matchMedia('(hover: none)').matches) return;

  const img = cursorImg.querySelector('img');
  let mouseX = 0, mouseY = 0;
  let curX = 0, curY = 0;
  let rafId = null;
  let isVisible = false;

  function lerp(a, b, t) { return a + (b - a) * t; }

  function animate() {
    curX = lerp(curX, mouseX, 0.1);
    curY = lerp(curY, mouseY, 0.1);
    cursorImg.style.left = curX + 'px';
    cursorImg.style.top  = curY + 'px';
    if (isVisible) rafId = requestAnimationFrame(animate);
  }

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  rows.forEach(row => {
    row.addEventListener('mouseenter', () => {
      const src = row.dataset.img;
      if (img && src) img.src = src;
      isVisible = true;
      cursorImg.classList.add('is-visible');
      if (!rafId) rafId = requestAnimationFrame(animate);
    });

    row.addEventListener('mouseleave', () => {
      isVisible = false;
      cursorImg.classList.remove('is-visible');
      cancelAnimationFrame(rafId);
      rafId = null;
    });
  });
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
