/* ============================================================
   G-M PELUQUEROS PALERMO — JavaScript principal
   ============================================================ */

'use strict';

// ── Header scroll behavior ────────────────────────────────────────
(function initHeader() {
  const header = document.getElementById('header');
  if (!header) return;

  let lastScroll = 0;
  const handleScroll = () => {
    const current = window.scrollY;
    if (current > 60) {
      header.classList.add('scrolled');
      header.classList.remove('header--transparent');
    } else {
      header.classList.remove('scrolled');
      header.classList.add('header--transparent');
    }
    lastScroll = current;
  };
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
})();

// ── Mobile nav drawer ─────────────────────────────────────────────
(function initDrawer() {
  const burger  = document.getElementById('burgerBtn');
  const drawer  = document.getElementById('mobileDrawer');
  const overlay = document.getElementById('drawerOverlay');
  const close   = document.getElementById('closeDrawer');
  if (!burger || !drawer) return;

  const open  = () => { drawer.classList.add('open'); overlay.classList.add('open'); document.body.style.overflow = 'hidden'; };
  const closeD = () => { drawer.classList.remove('open'); overlay.classList.remove('open'); document.body.style.overflow = ''; };

  burger.addEventListener('click', open);
  overlay.addEventListener('click', closeD);
  if (close) close.addEventListener('click', closeD);

  drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', closeD));
})();

// ── Scroll reveal ─────────────────────────────────────────────────
(function initReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => observer.observe(el));
})();

// ── Gallery filters ───────────────────────────────────────────────
(function initGalleryFilters() {
  const filters = document.querySelectorAll('.gallery-filter');
  const items   = document.querySelectorAll('.gallery-grid__item');
  if (!filters.length) return;

  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      filters.forEach(f => f.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      items.forEach(item => {
        if (filter === 'all' || item.dataset.cat === filter) {
          item.style.display = '';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
})();

// ── FAQ accordion ─────────────────────────────────────────────────
(function initFAQ() {
  const items = document.querySelectorAll('.faq-item');
  if (!items.length) return;

  items.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    if (!trigger) return;
    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      items.forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });
})();

// ── Smooth scroll para anchors ────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const header = document.getElementById('header');
    const offset = header ? header.offsetHeight : 72;
    window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
  });
});

// ── Toast helper ──────────────────────────────────────────────────
window.showToast = function(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(40px)'; toast.style.transition = 'all .3s'; setTimeout(() => toast.remove(), 300); }, 3500);
};

// ── Lightbox ──────────────────────────────────────────────────────
(function initLightbox() {
  const items = document.querySelectorAll('.gallery-grid__item');
  if (!items.length) return;

  const lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.innerHTML = `<span class="lightbox__close">✕</span><img class="lightbox__img" src="" alt="Trabajo de peluquería">`;
  document.body.appendChild(lb);

  const img = lb.querySelector('.lightbox__img');
  const closeBtn = lb.querySelector('.lightbox__close');

  items.forEach(item => {
    item.addEventListener('click', () => {
      const src = item.querySelector('img')?.src;
      if (!src) return;
      img.src = src;
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  const closeLB = () => { lb.classList.remove('open'); document.body.style.overflow = ''; };
  closeBtn.addEventListener('click', closeLB);
  lb.addEventListener('click', e => { if (e.target === lb) closeLB(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLB(); });
})();

// ── Parallax en hero background ──────────────────────────────────
(function initParallax() {
  const heroBg = document.querySelector('.hero__bg');
  if (!heroBg || window.matchMedia('(max-width: 768px)').matches) return;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    heroBg.style.transform = `translateY(${y * 0.35}px)`;
  }, { passive: true });
})();

// ── Animated counters ─────────────────────────────────────────────
(function initCounters() {
  const items = document.querySelectorAll('[data-count]');
  if (!items.length) return;

  const ease = t => t < .5 ? 2*t*t : -1+(4-2*t)*t;

  const animateCounter = (el) => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals) : 0;
    const duration = 1800;
    const start = performance.now();

    const tick = (now) => {
      const elapsed = Math.min((now - start) / duration, 1);
      const value = target * ease(elapsed);
      el.textContent = decimals ? value.toFixed(decimals) + suffix : Math.round(value) + suffix;
      if (elapsed < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  items.forEach(el => observer.observe(el));
})();

// ── Reveal con dirección (left / right / scale) ───────────────────
(function initDirectionalReveal() {
  const els = document.querySelectorAll('.reveal-left, .reveal-right, .reveal-scale');
  if (!els.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
  els.forEach(el => observer.observe(el));
})();

// ── Preload URL params para turnos ────────────────────────────────
(function handleTurnosParams() {
  if (!window.location.pathname.includes('turnos')) return;
  const params = new URLSearchParams(window.location.search);
  const prof = params.get('prof');
  if (prof) {
    window._preselectedProf = prof;
  }
})();

// ── Stats showcase counters ────────────────────────────────────────
(function initShowcaseCounters() {
  const items = document.querySelectorAll('.stat-showcase-item__number[data-count]');
  if (!items.length) return;

  const ease = t => t < .5 ? 2*t*t : -1+(4-2*t)*t;

  const animateCounter = (el) => {
    const target   = parseFloat(el.dataset.count);
    const suffix   = el.dataset.suffix || '';
    const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals) : 0;
    const duration = 2000;
    const start    = performance.now();
    const tick = (now) => {
      const elapsed = Math.min((now - start) / duration, 1);
      const value   = target * ease(elapsed);
      el.textContent = decimals ? value.toFixed(decimals) + suffix : Math.round(value) + suffix;
      if (elapsed < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { animateCounter(entry.target); observer.unobserve(entry.target); }
    });
  }, { threshold: 0.5 });

  items.forEach(el => observer.observe(el));
})();

// ── 3D card tilt micro-interaction ────────────────────────────────
(function initCardTilt() {
  if (window.matchMedia('(max-width: 768px)').matches) return;
  const cards = document.querySelectorAll('.pilar-card, .ba-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = `perspective(700px) rotateY(${x * 5}deg) rotateX(${-y * 3}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
})();
