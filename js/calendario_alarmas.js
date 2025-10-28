/**
 * calendario_alarmas.js
 * Versión mejorada completa — con mejoras en UX, accesibilidad y funcionalidad.
 */

const LS_KEY = "udem_calendar_reminders_v2";
const THEME_KEY = "udem_theme";

let currentYear = new Date().getFullYear();
let reminders = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
let selectedDate = null;
let isDarkMode = localStorage.getItem(THEME_KEY) === "dark";
let searchFilter = "";

// Helpers
function pad(n) { return String(n).padStart(2, "0"); }
function dateKey(y, m, d) { return `${y}-${pad(m)}-${pad(d)}`; }
function escapeHtml(str) {
  if (!str && str !== "") return "";
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

// Throttling para eventos
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Notificaciones push
function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

function showNotification(title, body) {
  if (Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/imagenes/zorro.png' });
  }
}

// Modo oscuro
function toggleTheme() {
  isDarkMode = !isDarkMode;
  document.body.classList.toggle('dark-mode', isDarkMode);
  localStorage.setItem(THEME_KEY, isDarkMode ? 'dark' : 'light');
}

// Render (año / mes / días) con lazy loading
function renderYear(year) {
  const yearGrid = document.getElementById("yearCalendar");
  const yearLabel = document.getElementById("yearLabel");
  if (!yearGrid || !yearLabel) return;

  yearGrid.innerHTML = "";
  yearLabel.textContent = year;

  for (let m = 0; m < 12; m++) {
    const monthEl = renderMonth(year, m);
    yearGrid.appendChild(monthEl);
  }

  highlightReminders();
  applySearchFilter();
}

function renderMonth(year, month) {
  const monthNames = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  const monthEl = document.createElement("article");
  monthEl.className = "month";
  monthEl.id = `m${month + 1}`;
  monthEl.setAttribute('aria-label', `Mes de ${monthNames[month]}`);

  const header = document.createElement("div");
  header.className = "month-header";
  header.textContent = monthNames[month];
  header.addEventListener('click', () => expandMonthView(year, month));
  monthEl.appendChild(header);

  const weekHeader = document.createElement("div");
  weekHeader.className = "week-header";
  ["L","M","X","J","V","S","D"].forEach(ch => {
    const cell = document.createElement("div");
    cell.textContent = ch;
    weekHeader.appendChild(cell);
  });
  monthEl.appendChild(weekHeader);

  const daysGrid = document.createElement("div");
  daysGrid.className = "days";

  const firstDay = new Date(year, month, 1).getDay();
  const offset = (firstDay === 0) ? 6 : firstDay - 1;
  const totalDays = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < offset; i++) {
    const empty = document.createElement("div");
    empty.className = "day empty";
    daysGrid.appendChild(empty);
  }

  for (let d = 1; d <= totalDays; d++) {
    const dayEl = document.createElement("div");
    dayEl.className = "day";
    dayEl.setAttribute('tabindex', '0');
    dayEl.setAttribute('aria-label', `Día ${d} de ${monthNames[month]}`);
    const dateStr = dateKey(year, month + 1, d);
    dayEl.dataset.date = dateStr;

    // Marcar día de hoy
    const today = new Date();
    if (year === today.getFullYear() && month === today.getMonth() && d === today.getDate()) {
      dayEl.classList.add("today");
    }

    const num = document.createElement("span");
    num.className = "num";
    num.textContent = d;
    dayEl.appendChild(num);

    const chips = document.createElement("div");
    chips.className = "chips";
    dayEl.appendChild(chips);

    dayEl.addEventListener("click", (ev) => openModal(dateStr));
    dayEl.addEventListener("keydown", (e) => { if (e.key === 'Enter') openModal(dateStr); });
    daysGrid.appendChild(dayEl);
  }

  const totalCells = offset + totalDays;
  const remainder = totalCells % 7;
  if (remainder !== 0) {
    for (let i = remainder; i < 7; i++) {
      const empty = document.createElement("div");
      empty.className = "day empty";
      daysGrid.appendChild(empty);
    }
  }

  monthEl.appendChild(daysGrid);
  return monthEl;
}

// Vista mensual detallada
function expandMonthView(year, month) {
  const monthEl = document.getElementById(`m${month + 1}`);
  if (monthEl) monthEl.scrollIntoView({ behavior: 'smooth' });
}

// Modal / Recordatorios
function openModal(dateStr) {
  selectedDate = dateStr;
  const [y, m, d] = dateStr.split("-").map(Number);
  const display = `${pad(d)}/${pad(m)}/${y}`;
  const modal = document.getElementById("reminderModal");
  const selectedDateText = document.getElementById("selectedDateText");
  if (!modal || !selectedDateText) return;

  selectedDateText.textContent = `Fecha: ${display}`;
  modal.classList.add("open");
  modal.setAttribute('aria-hidden', 'false');
  loadRemindersList();
  const titleInput = document.getElementById("remTitle");
  if (titleInput) titleInput.focus();
}

function closeModal() {
  const modal = document.getElementById("reminderModal");
  if (!modal) return;
  modal.classList.remove("open");
  modal.setAttribute('aria-hidden', 'true');
  selectedDate = null;
}

function loadRemindersList() {
  const listEl = document.getElementById("remindersList");
  if (!listEl || !selectedDate) return;
  listEl.innerHTML = "";

  const list = reminders[selectedDate] || [];
  if (list.length === 0) {
    const empty = document.createElement("li");
    empty.textContent = "Sin recordatorios para este día.";
    empty.style.justifyContent = "center";
    listEl.appendChild(empty);
    return;
  }

  list.forEach((r, idx) => {
    const li = document.createElement("li");
    li.setAttribute('role', 'listitem');
    li.innerHTML = `
      <div class="info">
        <i class="${r.icon || "fa-solid fa-bell"}"></i>
        <div>
          <div><strong>${escapeHtml(r.title)}</strong> ${r.time ? `<span class="meta">• ${escapeHtml(r.time)}</span>` : ""}</div>
          ${r.notes ? `<div class="meta">${escapeHtml(r.notes)}</div>` : ""}
          ${r.recurrent ? `<div class="meta">Repite semanalmente</div>` : ""}
        </div>
      </div>
      <div>
        <button data-idx="${idx}" type="button" class="del-btn" aria-label="Eliminar recordatorio">Eliminar</button>
      </div>
    `;
    listEl.appendChild(li);
  });
}

function saveReminder(event) {
  event.preventDefault();
  if (!selectedDate) return;

  const title = document.getElementById("remTitle").value.trim();
  const time = document.getElementById("remTime").value || "";
  const icon = document.getElementById("remIcon").value || "fa-solid fa-bell";
  const recurrent = document.getElementById("remRecurrent").checked;
  const notes = document.getElementById("remNotes").value.trim() || "";

  if (!title) {
    document.getElementById("titleError").style.display = "block";
    return;
  } else {
    document.getElementById("titleError").style.display = "none";
  }

  const item = { title, time, icon, notes, recurrent, createdAt: Date.now() };
  if (!reminders[selectedDate]) reminders[selectedDate] = [];
  reminders[selectedDate].push(item);
  localStorage.setItem(LS_KEY, JSON.stringify(reminders));

  loadRemindersList();
  renderYear(currentYear);
  document.getElementById("reminderForm").reset();

  // Notificación si es hora actual
  if (time) {
    const now = new Date();
    const [h, m] = time.split(':');
    if (now.getHours() === parseInt(h) && now.getMinutes() === parseInt(m)) {
      showNotification("Recordatorio", `Es hora de: ${title}`);
    }
  }
}

function deleteReminderByIndex(date, idx) {
  if (!reminders[date]) return;
  reminders[date].splice(idx, 1);
  if (reminders[date].length === 0) delete reminders[date];
  localStorage.setItem(LS_KEY, JSON.stringify(reminders));
  loadRemindersList();
  renderYear(currentYear);
}

// Actualizar chips / indicadores
function highlightReminders() {
  document.querySelectorAll(".day").forEach(el => {
    el.classList.remove("has-reminders");
    const chips = el.querySelector(".chips");
    if (chips) chips.innerHTML = "";
  });

  for (const date in reminders) {
    const el = document.querySelector(`.day[data-date="${date}"]`);
    if (!el) continue;
    const list = reminders[date] || [];
    if (list.length === 0) continue;

    el.classList.add("has-reminders");
    const chips = el.querySelector(".chips");
    chips.innerHTML = "";
    list.slice(0, 2).forEach(r => {
      const chip = document.createElement("div");
      chip.className = "chip";
      chip.title = escapeHtml(r.title) + (r.time ? ` - ${r.time}` : "");
      chip.innerHTML = `<i class="${r.icon || "fa-solid fa-bell"}"></i> ${escapeHtml(r.title)}`;
      chips.appendChild(chip);
    });
    if (list.length > 2) {
      const more = document.createElement("div");
      more.className = "chip";
      more.textContent = `+${list.length - 2} más`;
      chips.appendChild(more);
    }
  }
}

// Búsqueda y filtros
function applySearchFilter() {
  const query = searchFilter.toLowerCase();
  document.querySelectorAll(".day.has-reminders").forEach(day => {
    const chips = day.querySelectorAll(".chip");
    let visible = false;
    chips.forEach(chip => {
      if (chip.textContent.toLowerCase().includes(query)) visible = true;
    });
    day.style.display = visible || query === "" ? "block" : "none";
  });
}

// Exportar/Importar
function exportReminders() {
  const dataStr = JSON.stringify(reminders, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'reminders.json';
  link.click();
  URL.revokeObjectURL(url);
}

function importReminders(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target.result);
      reminders = { ...reminders, ...imported };
      localStorage.setItem(LS_KEY, JSON.stringify(reminders));
      renderYear(currentYear);
      alert("Recordatorios importados exitosamente.");
    } catch (err) {
      alert("Error al importar: archivo inválido.");
    }
  };
  reader.readAsText(file);
}

// Eventos y inicialización
document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById("sidebar");
  const toggleBtn = document.getElementById("toggleSidebar");
  const themeToggle = document.getElementById("themeToggle");
  const prev = document.getElementById("prevYear");
  const next = document.getElementById("nextYear");
  const goToday = document.getElementById("goToday");
  const searchInput = document.getElementById("searchInput");
  const modal = document.getElementById("reminderModal");
  const closeBtn = document.getElementById("closeModal");
  const form = document.getElementById("reminderForm");
  const exportBtn = document.getElementById("exportBtn");
  const importBtn = document.getElementById("importBtn");
  const remindersListEl = document.getElementById("remindersList");

  // Aplicar tema inicial
  document.body.classList.toggle('dark-mode', isDarkMode);

  // Render inicial
  renderYear(currentYear);
  requestNotificationPermission();

  // Controles año
  if (prev) prev.addEventListener("click", () => { currentYear--; renderYear(currentYear); });
  if (next) next.addEventListener("click", () => { currentYear++; renderYear(currentYear); });
  if (goToday) goToday.addEventListener("click", () => {
    currentYear = new Date().getFullYear();
    renderYear(currentYear);
    const today = new Date();
    const m = today.getMonth() + 1;
    const d = today.getDate();
    const todayEl = document.querySelector(`.day[data-date="${dateKey(currentYear, m, d)}"]`);
    if (todayEl) {
      todayEl.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      const anchor = document.getElementById(`m${m}`);
      if (anchor) anchor.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  // Búsqueda
  if (searchInput) {
    searchInput.addEventListener("input", throttle((e) => {
      searchFilter = e.target.value;
      applySearchFilter();
    }, 300));
  }

  // Modal open/close
  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (modal) modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (modal && modal.classList.contains("open")) closeModal();
    }
  });

  // Form submit
  if (form) form.addEventListener("submit", saveReminder);

  // Exportar/Importar
  if (exportBtn) exportBtn.addEventListener("click", exportReminders);
  if (importBtn) importBtn.addEventListener("change", importReminders);

  // Delegación para eliminar
  if (remindersListEl) {
    remindersListEl.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-idx]");
      if (btn) {
        const idx = parseInt(btn.dataset.idx, 10);
        if (!Number.isNaN(idx) && selectedDate) deleteReminderByIndex(selectedDate, idx);
      }
    });
  }

  // Sidebar y tema
  if (toggleBtn) {
    toggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      sidebar.classList.toggle("collapsed");
    });
  }
  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
  }

  document.addEventListener("click", (e) => {
    const target = e.target;
    if (!sidebar) return;
    if (sidebar.contains(target)) {
      sidebar.classList.remove("collapsed");
    } else {
      sidebar.classList.add("collapsed");
    }
  });

  // Validación en tiempo real
  const titleInput = document.getElementById("remTitle");
  if (titleInput) {
    titleInput.addEventListener("input", () => {
      if (titleInput.value.trim()) {
        document.getElementById("titleError").style.display = "none";
        titleInput.classList.remove("error");
      }
    });
  }
});