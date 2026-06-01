/* G-M PELUQUEROS PALERMO — main.js */
'use strict';

(function initHeader() {
  const header = document.getElementById('header');
  if (!header) return;
  const handleScroll = () => {
    if (window.scrollY > 60) {
      header.classList.add('scrolled');
      header.classList.remove('header--transparent');
    } else {
      header.classList.remove('scrolled');
      header.classList.add('header--transparent');
    }
  };
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
})();

(function initDrawer() {
  const burger = document.getElementById('burgerBtn');
  const drawer = document.getElementById('mobileDrawer');
  const overlay = document.getElementById('drawerOverlay');
  const close = document.getElementById('closeDrawer');
  if (!burger || !drawer) return;
  const open = () => { drawer.classList.add('open'); if(overlay) overlay.classList.add('open'); document.body.style.overflow = 'hidden'; };
  const closeD = () => { drawer.classList.remove('open'); if(overlay) overlay.classList.remove('open'); document.body.style.overflow = ''; };
  burger.addEventListener('click', open);
  if(overlay) overlay.addEventListener('click', closeD);
  if(close) close.addEventListener('click', closeD);
  drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', closeD));
})();

(function initReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  elements.forEach(el => observer.observe(el));
})();

(function initGalleryFilters() {
  const filters = document.querySelectorAll('.gallery-filter');
  const items = document.querySelectorAll('.gallery-grid__item');
  if (!filters.length) return;
  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      filters.forEach(f => f.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      items.forEach(item => { item.style.display = (filter === 'all' || item.dataset.cat === filter) ? '' : 'none'; });
    });
  });
})();

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

document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
  });
});

window.showToast = function(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) { container = document.createElement('div'); container.className = 'toast-container'; document.body.appendChild(container); }
  const toast = document.createElement('div');
  toast.className = 'toast ' + type;
  toast.innerHTML = '<span>' + message + '</span>';
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(40px)'; toast.style.transition = 'all .3s'; setTimeout(() => toast.remove(), 300); }, 3500);
};