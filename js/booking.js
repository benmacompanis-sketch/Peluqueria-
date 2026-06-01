/* G-M PELUQUEROS PALERMO — booking.js */
'use strict';

const booking = { service: null, professional: null, date: null, time: null, duration: null };
let calendarYear = new Date().getFullYear();
let calendarMonth = new Date().getMonth();
const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

window.goToStep = function(step) {
  [1,2,3,4,5,'confirm'].forEach(s => { const p = document.getElementById('panel-' + s); if (p) p.classList.add('hidden'); });
  const panel = document.getElementById('panel-' + step);
  if (panel) { panel.classList.remove('hidden'); panel.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  updateStepBar(step);
  if (step === 3) renderCalendar();
  if (step === 4) updateSlotInfo();
};

function updateStepBar(currentStep) {
  [1,2,3,4,5].forEach(i => {
    const ind = document.getElementById('step-ind-' + i);
    const conn = document.getElementById('conn-' + i);
    if (!ind) return;
    ind.className = 'booking-step';
    const num = ind.querySelector('.booking-step__num');
    if (i < currentStep) { ind.classList.add('booking-step--done'); if(num) num.innerHTML = '✓'; }
    if (i === currentStep) ind.classList.add('booking-step--active');
    if (i > currentStep && num) num.textContent = i;
    if (conn) conn.className = 'booking-step-connector' + (i < currentStep ? ' done' : '');
  });
}

window.selectService = function(el) {
  document.querySelectorAll('.service-option').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
  booking.service = el.dataset.id;
  booking.duration = parseInt(el.dataset.duration, 10);
  const name = el.dataset.name;
  const btn = document.getElementById('btn-step1');
  if(btn) btn.disabled = false;
  const sn = document.getElementById('selected-service-name');
  if(sn) sn.textContent = name;
  const ss = document.getElementById('sum-service');
  if(ss) ss.textContent = name;
  const sd = document.getElementById('sum-duration');
  if(sd) sd.textContent = booking.duration + ' minutos';
};

window.filterServices = function(query) {
  const q = query.toLowerCase();
  document.querySelectorAll('.service-option').forEach(opt => { opt.style.display = (opt.dataset.name || '').toLowerCase().includes(q) ? '' : 'none'; });
};

window.selectProfessional = function(el) {
  document.querySelectorAll('.professional-option').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
  booking.professional = el.dataset.id;
  const btn = document.getElementById('btn-step2');
  if(btn) btn.disabled = false;
  const sp = document.getElementById('sum-prof');
  if(sp) sp.textContent = el.dataset.name;
};

function renderCalendar() {
  const wrapper = document.getElementById('calendarWrapper');
  if (!wrapper) return;
  const today = new Date();
  const maxDate = new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000);
  const firstDay = new Date(calendarYear, calendarMonth, 1);
  const lastDay = new Date(calendarYear, calendarMonth + 1, 0);
  const fullDays = [3, 7, 14, 21];
  const DAYS = ['Do','Lu','Ma','Mi','Ju','Vi','Sa'];
  let html = '<div class="calendar-header">';
  html += '<button class="cal-nav-btn" onclick="changeMonth(-1)" ' + (calendarMonth <= today.getMonth() && calendarYear <= today.getFullYear() ? 'disabled style="opacity:.3;cursor:default"' : '') + '><svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg></button>';
  html += '<h3>' + MONTHS_ES[calendarMonth] + ' ' + calendarYear + '</h3>';
  html += '<button class="cal-nav-btn" onclick="changeMonth(1)"><svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></button></div>';
  html += '<div class="calendar-grid">';
  DAYS.forEach(d => { html += '<div class="calendar-day-name">' + d + '</div>'; });
  for (let i = 0; i < firstDay.getDay(); i++) html += '<div class="calendar-day disabled"></div>';
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(calendarYear, calendarMonth, d);
    const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const isToday = date.toDateString() === today.toDateString();
    const isClosed = date.getDay() === 0;
    const isFuture = date > maxDate;
    const isFull = fullDays.includes(d) && !isClosed;
    const isSelected = booking.date && booking.date.toDateString() === date.toDateString();
    let cls = 'calendar-day';
    if (isToday) cls += ' today';
    if (isPast || isFuture) cls += ' disabled';
    else if (isClosed) cls += ' closed';
    else if (isFull) cls += ' full';
    else if (isSelected) cls += ' selected';
    const clickable = !isPast && !isClosed && !isFull && !isFuture;
    html += '<div class="' + cls + '" ' + (clickable ? 'onclick="selectDate(' + calendarYear + ',' + calendarMonth + ',' + d + ')" tabindex="0"' : '') + '>' + d + '</div>';
  }
  html += '</div>';
  wrapper.innerHTML = html;
}

window.changeMonth = function(dir) {
  calendarMonth += dir;
  if (calendarMonth < 0) { calendarMonth = 11; calendarYear--; }
  if (calendarMonth > 11) { calendarMonth = 0; calendarYear++; }
  renderCalendar();
};

window.selectDate = function(y, m, d) {
  booking.date = new Date(y, m, d);
  const btn = document.getElementById('btn-step3');
  if(btn) btn.disabled = false;
  renderCalendar();
  const dateStr = booking.date.toLocaleDateString('es-AR', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
  const sd = document.getElementById('sum-date');
  if(sd) sd.textContent = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
};

function updateSlotInfo() {
  if (!booking.date) return;
  const dateStr = booking.date.toLocaleDateString('es-AR', { weekday:'long', day:'numeric', month:'long' });
  const el = document.getElementById('step4-sub');
  if(el) el.textContent = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
}

window.selectSlot = function(btn, time) {
  document.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  booking.time = time;
  const dur = booking.duration || 30;
  const [h, m] = time.split(':').map(Number);
  const endMin = h * 60 + m + dur;
  const endH = Math.floor(endMin / 60);
  const endM = (endMin % 60).toString().padStart(2, '0');
  const endTime = endH + ':' + endM;
  const durEl = document.getElementById('slotDuration');
  const durTxt = document.getElementById('slotDurationText');
  if(durEl) durEl.classList.remove('hidden');
  if(durTxt) durTxt.textContent = 'Duración: ' + dur + ' minutos · Finaliza a las ' + endTime;
  const btn4 = document.getElementById('btn-step4');
  if(btn4) btn4.disabled = false;
  const st = document.getElementById('sum-time');
  if(st) st.textContent = time + ' – ' + endTime;
};

window.submitBooking = function(e) {
  e.preventDefault();
  const firstName = document.getElementById('firstName').value.trim();
  const lastName = document.getElementById('lastName').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const email = document.getElementById('email').value.trim();
  if (!firstName || !lastName || !phone || !email) {
    if(window.showToast) window.showToast('Por favor completá todos los campos obligatorios', 'error');
    return;
  }
  const btn = e.target.querySelector('button[type=submit]');
  if(btn) { btn.disabled = true; btn.textContent = 'Confirmando…'; }
  setTimeout(() => {
    const serviceEl = document.querySelector('.service-option.selected');
    const profEl = document.querySelector('.professional-option.selected');
    const cs = document.getElementById('conf-service'); if(cs) cs.textContent = serviceEl ? serviceEl.dataset.name : '—';
    const cp = document.getElementById('conf-prof'); if(cp) cp.textContent = profEl ? profEl.dataset.name : '—';
    const dateStr = booking.date ? booking.date.toLocaleDateString('es-AR', { weekday:'long', day:'numeric', month:'long' }) : '—';
    const cd = document.getElementById('conf-datetime'); if(cd) cd.textContent = (dateStr.charAt(0).toUpperCase() + dateStr.slice(1)) + ' a las ' + (booking.time || '—');
    if (booking.date && booking.time) {
      const [h, m2] = (booking.time).split(':').map(Number);
      const start = new Date(booking.date); start.setHours(h, m2, 0, 0);
      const end = new Date(start.getTime() + (booking.duration || 30) * 60000);
      const fmt = d2 => d2.toISOString().replace(/[-:]/g,'').split('.')[0] + 'Z';
      const calUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent('Turno G-M Peluqueros') + '&dates=' + fmt(start) + '/' + fmt(end) + '&location=' + encodeURIComponent('Jorge Luis Borges 2241, Palermo, Buenos Aires');
      const calBtn = document.getElementById('addToCalendarBtn'); if(calBtn) { calBtn.href = calUrl; calBtn.target = '_blank'; }
    }
    goToStep('confirm');
    if(window.showToast) window.showToast('¡Turno confirmado! Revisá tu WhatsApp.', 'success');
  }, 1200);
};