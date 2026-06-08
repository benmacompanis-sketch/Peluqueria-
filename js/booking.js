/* ============================================================
   G-M PELUQUEROS PALERMO — Sistema de reservas (cliente)
   ============================================================ */

'use strict';

const SUPABASE_URL = 'https://nelwxqhambuvqnbtyqid.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lbHd4cWhhbWJ1dnFuYnR5cWlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzMDQ1NTIsImV4cCI6MjA5NTg4MDU1Mn0.RhnAspgbvTkzIhNkl-jDQz6FfqhOmHpnoVR_zYna9Jw';
const db = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

// ── Estado del wizard ─────────────────────────────────────────────
const booking = {
  services: [],   // array de {id, name, duration}
  professional: null,
  date: null,
  time: null,
  duration: 0,    // suma de duraciones seleccionadas
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

// ── PASO 1: Selección de servicios (multi-select) ─────────────────
window.selectService = function(el) {
  const id       = el.dataset.id;
  const name     = el.dataset.name;
  const duration = parseInt(el.dataset.duration, 10);

  if (el.classList.contains('selected')) {
    el.classList.remove('selected');
    booking.services = booking.services.filter(s => s.id !== id);
  } else {
    el.classList.add('selected');
    booking.services.push({ id, name, duration });
  }

  booking.duration = booking.services.reduce((sum, s) => sum + s.duration, 0);

  const hasSelection = booking.services.length > 0;
  document.getElementById('btn-step1').disabled = !hasSelection;

  const names = booking.services.map(s => s.name).join(' + ');
  const counter = document.getElementById('services-counter');
  if (counter) {
    if (hasSelection) {
      counter.textContent = `${booking.services.length} servicio${booking.services.length > 1 ? 's' : ''} seleccionado${booking.services.length > 1 ? 's' : ''} · ${booking.duration} min total`;
      counter.style.display = 'block';
    } else {
      counter.style.display = 'none';
    }
  }

  const nameEl = document.getElementById('selected-service-name');
  if (nameEl) nameEl.textContent = names || '—';
  const sumService = document.getElementById('sum-service');
  if (sumService) sumService.textContent = names || '—';
  const sumDur = document.getElementById('sum-duration');
  if (sumDur) sumDur.textContent = booking.duration > 0 ? booking.duration + ' minutos' : '—';
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
async function updateSlotInfo() {
  if (!booking.date) return;

  const dateStr = booking.date.toLocaleDateString('es-AR', { weekday:'long', day:'numeric', month:'long' });
  document.getElementById('step4-sub').textContent =
    dateStr.charAt(0).toUpperCase() + dateStr.slice(1) +
    (booking.professional && booking.professional !== '0'
      ? ` · ${document.querySelector(`.professional-option[data-id="${booking.professional}"]`)?.dataset.name || ''}`
      : '');

  // Resetear todos los slots al estado original
  document.querySelectorAll('.slot-btn').forEach(btn => {
    btn.classList.remove('taken', 'selected');
    // Restaurar disabled solo si era fijo (no tiene onclick)
    if (!btn.getAttribute('onclick')) btn.disabled = true;
    else btn.disabled = false;
  });
  document.getElementById('btn-step4').disabled = true;
  booking.time = null;
  document.getElementById('slotDuration').classList.add('hidden');

  if (!db) return;

  // Mostrar indicador de carga
  document.getElementById('step4-sub').textContent += ' · Verificando disponibilidad…';

  try {
    const fecha = booking.date.toISOString().split('T')[0];
    let query = db.from('reservas')
      .select('hora, duracion, profesional')
      .eq('fecha', fecha)
      .in('estado', ['pendiente', 'confirmado']);

    // Si eligió un profesional específico, filtrar por él
    if (booking.professional && booking.professional !== '0') {
      const profName = document.querySelector(`.professional-option[data-id="${booking.professional}"]`)?.dataset.name;
      if (profName) query = query.eq('profesional', profName);
    }

    const { data: ocupados } = await query;

    if (ocupados && ocupados.length) {
      ocupados.forEach(r => {
        if (!r.hora) return;
        const [bh, bm] = r.hora.split(':').map(Number);
        const inicioMin = bh * 60 + bm;
        const finMin    = inicioMin + (r.duracion || 30);

        // Tachar todos los slots que caigan dentro de esa reserva
        document.querySelectorAll('.slot-btn').forEach(btn => {
          const txt = btn.textContent.trim();
          if (!txt.includes(':')) return;
          const [sh, sm] = txt.split(':').map(Number);
          const slotMin = sh * 60 + sm;
          if (slotMin >= inicioMin && slotMin < finMin) {
            btn.classList.add('taken');
            btn.disabled = true;
            btn.removeAttribute('onclick');
          }
        });
      });
    }

    // Actualizar subtítulo sin el mensaje de carga
    document.getElementById('step4-sub').textContent = document.getElementById('step4-sub').textContent.replace(' · Verificando disponibilidad…', '');

  } catch(e) {
    document.getElementById('step4-sub').textContent = document.getElementById('step4-sub').textContent.replace(' · Verificando disponibilidad…', '');
  }
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

  const profEl = document.querySelector('.professional-option.selected');

  const reserva = {
    nombre:      firstName,
    apellido:    lastName,
    telefono:    phone,
    email:       email,
    servicio:    booking.services.map(s => s.name).join(' + ') || '',
    profesional: profEl?.dataset.name   || '',
    fecha:       booking.date ? booking.date.toISOString().split('T')[0] : '',
    hora:        booking.time || '',
    duracion:    booking.duration || 30,
    estado:      'pendiente'
  };

  const insertPromise = db
    ? db.from('reservas').insert([reserva])
    : fetch(`${SUPABASE_URL}/rest/v1/reservas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Prefer': 'return=minimal' },
        body: JSON.stringify(reserva)
      }).then(r => ({ error: r.ok ? null : { message: 'Error HTTP' } }));

  insertPromise.then(({ error }) => {
    if (error) throw new Error(error.message);

    document.getElementById('conf-service').textContent = reserva.servicio || '—';
    document.getElementById('conf-prof').textContent    = reserva.profesional || '—';

    const dateStr = booking.date
      ? booking.date.toLocaleDateString('es-AR', { weekday:'long', day:'numeric', month:'long' })
      : '—';
    document.getElementById('conf-datetime').textContent =
      `${dateStr.charAt(0).toUpperCase() + dateStr.slice(1)} a las ${booking.time || '—'}`;

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

    goToStep('confirm');
    showToast('¡Turno confirmado!', 'success');
  })
  .catch(() => {
    btn.disabled = false;
    btn.textContent = 'Confirmar turno';
    showToast('No se pudo guardar la reserva. Intentá de nuevo.', 'error');
  });
};
