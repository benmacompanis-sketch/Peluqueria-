/* ============================================================
   G-M PELUQUEROS PALERMO — Sistema de reservas (cliente)
   ============================================================ */

'use strict';

// ── Estado del wizard ─────────────────────────────────────────────
const booking = {
  service: null,
  professional: null,
  date: null,
  time: null,
  duration: null,
};

let calendarYear  = new Date().getFullYear();
let calendarMonth = new Date().getMonth();

const DAYS_ES = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];
const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

// ── Navegación entre pasos ────────────────────────────────────────
window.goToStep = function(step) {
  // Ocultar todos los paneles
  [1,2,3,4,5,'confirm'].forEach(s => {
    const p = document.getElementById(`panel-${s}`);
    if (p) p.classList.add('hidden');
  });

  const panel = document.getElementById(`panel-${step}`);
  if (panel) {
    panel.classList.remove('hidden');
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  updateStepBar(step);

  // Render específico por paso
  if (step === 3) renderCalendar();
  if (step === 4) updateSlotInfo();
  if (step === 5) updateSummary();
};

function updateStepBar(currentStep) {
  [1,2,3,4,5].forEach(i => {
    const ind  = document.getElementById(`step-ind-${i}`);
    const conn = document.getElementById(`conn-${i}`);
    if (!ind) return;

    ind.className = 'booking-step';
    if (i < currentStep)  { ind.classList.add('booking-step--done'); ind.querySelector('.booking-step__num').innerHTML = '✓'; }
    if (i === currentStep) ind.classList.add('booking-step--active');
    if (i > currentStep)  ind.querySelector('.booking-step__num').textContent = i;

    if (conn) conn.className = 'booking-step-connector' + (i < currentStep ? ' done' : '');
  });
}

// ── PASO 1: Selección de servicio ─────────────────────────────────
window.selectService = function(el) {
  document.querySelectorAll('.service-option').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');

  booking.service   = el.dataset.id;
  booking.duration  = parseInt(el.dataset.duration, 10);
  const name        = el.dataset.name;

  document.getElementById('btn-step1').disabled = false;
  document.getElementById('selected-service-name').textContent = name;
  document.getElementById('sum-service').textContent = name;
  document.getElementById('sum-duration').textContent = booking.duration + ' minutos';
};

window.filterServices = function(query) {
  const q = query.toLowerCase();
  document.querySelectorAll('.service-option').forEach(opt => {
    const name = (opt.dataset.name || '').toLowerCase();
    opt.style.display = name.includes(q) ? '' : 'none';
  });
};

// ── PASO 2: Selección de profesional ─────────────────────────────
window.selectProfessional = function(el) {
  document.querySelectorAll('.professional-option').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');

  booking.professional = el.dataset.id;
  const name           = el.dataset.name;

  document.getElementById('btn-step2').disabled = false;
  document.getElementById('sum-prof').textContent = name;
};

// Preselección desde URL param
if (window._preselectedProf) {
  const profEl = document.querySelector(`.professional-option[data-id="${window._preselectedProf}"]`);
  if (profEl) { selectProfessional(profEl); goToStep(1); }
}

// ── PASO 3: Calendario ────────────────────────────────────────────
function renderCalendar() {
  const wrapper = document.getElementById('calendarWrapper');
  if (!wrapper) return;

  const today    = new Date();
  const maxDate  = new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000);
  const firstDay = new Date(calendarYear, calendarMonth, 1);
  const lastDay  = new Date(calendarYear, calendarMonth + 1, 0);

  // Days with "full" slots simulation (random for demo)
  const fullDays = [3, 7, 14, 21];

  let html = `
    <div class="calendar-header">
      <button class="cal-nav-btn" onclick="changeMonth(-1)" ${calendarMonth <= today.getMonth() && calendarYear <= today.getFullYear() ? 'disabled style="opacity:.3;cursor:default"' : ''}>
        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <h3>${MONTHS_ES[calendarMonth]} ${calendarYear}</h3>
      <button class="cal-nav-btn" onclick="changeMonth(1)">
        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
    </div>
    <div class="calendar-grid">`;

  DAYS_ES.forEach(d => { html += `<div class="calendar-day-name">${d}</div>`; });

  // Padding inicial
  const startDow = firstDay.getDay();
  for (let i = 0; i < startDow; i++) html += `<div class="calendar-day disabled"></div>`;

  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date    = new Date(calendarYear, calendarMonth, d);
    const dow     = date.getDay(); // 0=Do
    const isPast  = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const isToday = date.toDateString() === today.toDateString();
    const isClosed = dow === 0; // Domingo cerrado
    const isFuture = date > maxDate;
    const isFull   = fullDays.includes(d) && !isClosed;
    const isSelected = booking.date && booking.date.toDateString() === date.toDateString();

    let cls = 'calendar-day';
    if (isToday)    cls += ' today';
    if (isPast || isFuture) cls += ' disabled';
    else if (isClosed) cls += ' closed';
    else if (isFull)   cls += ' full';
    else if (isSelected) cls += ' selected';

    const clickable = !isPast && !isClosed && !isFull && !isFuture;
    const onclick   = clickable ? `selectDate(${calendarYear},${calendarMonth},${d})` : '';

    html += `<div class="${cls}" ${onclick ? `onclick="${onclick}" tabindex="0" role="button"` : ''}>${d}</div>`;
  }

  html += '</div>';
  wrapper.innerHTML = html;
}

window.changeMonth = function(dir) {
  calendarMonth += dir;
  if (calendarMonth < 0)  { calendarMonth = 11; calendarYear--; }
  if (calendarMonth > 11) { calendarMonth = 0;  calendarYear++; }
  renderCalendar();
};

window.selectDate = function(y, m, d) {
  booking.date = new Date(y, m, d);
  document.getElementById('btn-step3').disabled = false;
  renderCalendar();

  const dateStr = booking.date.toLocaleDateString('es-AR', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
  document.getElementById('sum-date').textContent = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
};

// ── PASO 4: Slots horarios ────────────────────────────────────────
function updateSlotInfo() {
  if (!booking.date) return;
  const dateStr = booking.date.toLocaleDateString('es-AR', { weekday:'long', day:'numeric', month:'long' });
  document.getElementById('step4-sub').textContent =
    dateStr.charAt(0).toUpperCase() + dateStr.slice(1) +
    (booking.professional && booking.professional !== '0' ? ` · ${document.querySelector(`.professional-option[data-id="${booking.professional}"]`)?.dataset.name || ''}` : '');
}

window.selectSlot = function(btn, time) {
  document.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  booking.time = time;

  const dur    = booking.duration || 30;
  const [h, m] = time.split(':').map(Number);
  const endMin  = h * 60 + m + dur;
  const endH    = Math.floor(endMin / 60);
  const endM    = (endMin % 60).toString().padStart(2, '0');
  const endTime = `${endH}:${endM}`;

  document.getElementById('slotDuration').classList.remove('hidden');
  document.getElementById('slotDurationText').textContent =
    `Duración: ${dur} minutos · Finaliza a las ${endTime}`;

  document.getElementById('btn-step4').disabled = false;
  document.getElementById('sum-time').textContent = `${time} – ${endTime}`;
};

// ── PASO 5: Resumen y submit ──────────────────────────────────────
function updateSummary() {
  // Ya actualizado incrementalmente
}

window.submitBooking = function(e) {
  e.preventDefault();

  const firstName = document.getElementById('firstName').value.trim();
  const lastName  = document.getElementById('lastName').value.trim();
  const phone     = document.getElementById('phone').value.trim();
  const email     = document.getElementById('email').value.trim();

  if (!firstName || !lastName || !phone || !email) {
    showToast('Por favor completá todos los campos obligatorios', 'error');
    return;
  }

  const btn = e.target.querySelector('button[type=submit]');
  btn.disabled = true;
  btn.textContent = 'Confirmando…';

  // Simulación de llamada a la API
  setTimeout(() => {
    const serviceEl = document.querySelector(`.service-option.selected`);
    const profEl    = document.querySelector(`.professional-option.selected`);

    document.getElementById('conf-service').textContent  = serviceEl?.dataset.name || '—';
    document.getElementById('conf-prof').textContent     = profEl?.dataset.name || '—';

    const dateStr = booking.date
      ? booking.date.toLocaleDateString('es-AR', { weekday:'long', day:'numeric', month:'long' })
      : '—';
    document.getElementById('conf-datetime').textContent =
      `${dateStr.charAt(0).toUpperCase() + dateStr.slice(1)} a las ${booking.time || '—'}`;

    // Google Calendar link
    if (booking.date && booking.time) {
      const [h, m] = (booking.time || '10:00').split(':').map(Number);
      const dur = booking.duration || 30;
      const start = new Date(booking.date);
      start.setHours(h, m, 0, 0);
      const end = new Date(start.getTime() + dur * 60000);
      const fmt = d => d.toISOString().replace(/[-:]/g,'').split('.')[0] + 'Z';
      const calUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('Turno G-M Peluqueros')}&dates=${fmt(start)}/${fmt(end)}&details=${encodeURIComponent('Peluquería G-M, Jorge Luis Borges 2241, Palermo')}&location=${encodeURIComponent('Jorge Luis Borges 2241, Palermo, Buenos Aires')}`;
      const calBtn = document.getElementById('addToCalendarBtn');
      if (calBtn) { calBtn.href = calUrl; calBtn.target = '_blank'; }
    }

    // Mostrar confirmación
    goToStep('confirm');
    showToast('¡Turno confirmado! Revisá tu WhatsApp.', 'success');
  }, 1200);
};
