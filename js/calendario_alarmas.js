/**
 * calendario_alarmas.js
 * Versión corregida — sidebar colapsa al hacer clic fuera; calendario anual completo.
 */

const LS_KEY = "udem_calendar_reminders_v2";

let currentYear = new Date().getFullYear();
let reminders = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
let selectedDate = null; // formato 'YYYY-MM-DD'

// Helpers
function pad(n) { return String(n).padStart(2, "0"); }
function dateKey(y, m, d) { return `${y}-${pad(m)}-${pad(d)}`; }

/* -------------------------
   RENDER (año / mes / días)
   ------------------------- */
function renderYear(year) {
  const yearGrid = document.getElementById("yearCalendar");
  const yearLabel = document.getElementById("yearLabel");
  if (!yearGrid || !yearLabel) return;

  yearGrid.innerHTML = "";
  yearLabel.textContent = year;

  for (let m = 0; m < 12; m++) {
    yearGrid.appendChild(renderMonth(year, m));
  }

  // Después de pintar el DOM, colocamos chips/indicadores
  highlightReminders();
}

function renderMonth(year, month) {
  const monthNames = [
    "Enero","Febrero","Marzo","Abril","Mayo","Junio",
    "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
  ];

  const monthEl = document.createElement("article");
  monthEl.className = "month";
  monthEl.id = `m${month + 1}`;

  // Header
  const header = document.createElement("div");
  header.className = "month-header";
  header.textContent = monthNames[month];
  monthEl.appendChild(header);

  // Week header (L M X J V S D)
  const weekHeader = document.createElement("div");
  weekHeader.className = "week-header";
  ["L","M","X","J","V","S","D"].forEach(ch => {
    const cell = document.createElement("div");
    cell.textContent = ch;
    weekHeader.appendChild(cell);
  });
  monthEl.appendChild(weekHeader);

  // Days grid
  const daysGrid = document.createElement("div");
  daysGrid.className = "days";

  // Calcular offset (hacer que Lunes sea índice 0)
  const firstDay = new Date(year, month, 1).getDay(); // 0 = domingo
  const offset = (firstDay === 0) ? 6 : firstDay - 1; // 0..6, lunes=0
  const totalDays = new Date(year, month + 1, 0).getDate();

  // Huecos iniciales
  for (let i = 0; i < offset; i++) {
    const empty = document.createElement("div");
    empty.className = "day empty";
    daysGrid.appendChild(empty);
  }

  // Días del mes
  for (let d = 1; d <= totalDays; d++) {
    const dayEl = document.createElement("div");
    dayEl.className = "day";

    const dateStr = dateKey(year, month + 1, d);
    dayEl.dataset.date = dateStr; // referencia directa

    // número + contenedor de chips
    const num = document.createElement("span");
    num.className = "num";
    num.textContent = d;
    dayEl.appendChild(num);

    const chips = document.createElement("div");
    chips.className = "chips";
    dayEl.appendChild(chips);

    // click para abrir modal
    dayEl.addEventListener("click", (ev) => {
      // evitar que el click en elementos internos haga bubbling raro
      openModal(dateStr);
    });

    daysGrid.appendChild(dayEl);
  }

  // Huecos finales hasta completar la última fila de 7
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

/* -------------------------
   MODAL / RECORDATORIOS
   ------------------------- */
function openModal(dateStr) {
  selectedDate = dateStr;
  const [y, m, d] = dateStr.split("-").map(Number);
  const display = `${pad(d)}/${pad(m)}/${y}`;
  const modal = document.getElementById("reminderModal");
  const selectedDateText = document.getElementById("selectedDateText");
  if (!modal || !selectedDateText) return;

  selectedDateText.textContent = `Fecha: ${display}`;
  modal.classList.add("open");
  loadRemindersList();
  // focus en el título para mejor UX
  const titleInput = document.getElementById("remTitle");
  if (titleInput) titleInput.focus();
}

function closeModal() {
  const modal = document.getElementById("reminderModal");
  if (!modal) return;
  modal.classList.remove("open");
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
    li.innerHTML = `
      <div class="info">
        <i class="${r.icon || "fa-solid fa-bell"}"></i>
        <div>
          <div><strong>${escapeHtml(r.title)}</strong> ${r.time ? `<span class="meta">• ${escapeHtml(r.time)}</span>` : ""}</div>
          ${r.notes ? `<div class="meta">${escapeHtml(r.notes)}</div>` : ""}
        </div>
      </div>
      <div>
        <button data-idx="${idx}" type="button" class="del-btn">Eliminar</button>
      </div>
    `;
    listEl.appendChild(li);
  });
}

function saveReminder(event) {
  event.preventDefault();
  if (!selectedDate) return;

  const title = document.getElementById("remTitle").value.trim();
  if (!title) return; // título obligatorio
  const time = document.getElementById("remTime").value || "";
  const icon = document.getElementById("remIcon").value || "fa-solid fa-bell";
  const notes = document.getElementById("remNotes").value.trim() || "";

  const item = { title, time, icon, notes, createdAt: Date.now() };
  if (!reminders[selectedDate]) reminders[selectedDate] = [];
  reminders[selectedDate].push(item);
  localStorage.setItem(LS_KEY, JSON.stringify(reminders));

  // refrescar lista y calendario
  loadRemindersList();
  renderYear(currentYear);
  // limpiar form (no cerramos modal para que puedas añadir más)
  document.getElementById("reminderForm").reset();
}

function deleteReminderByIndex(date, idx) {
  if (!reminders[date]) return;
  reminders[date].splice(idx, 1);
  if (reminders[date].length === 0) delete reminders[date];
  localStorage.setItem(LS_KEY, JSON.stringify(reminders));
  loadRemindersList();
  renderYear(currentYear);
}

/* -------------------------
   ACTUALIZAR CHIPS / INDICADORES
   ------------------------- */
function highlightReminders() {
  // limpiar chips existentes
  document.querySelectorAll(".day").forEach(el => {
    el.classList.remove("has-reminders");
    const chips = el.querySelector(".chips");
    if (chips) chips.innerHTML = "";
  });

  // por cada fecha guardada, buscar el elemento .day[data-date="..."]
  for (const date in reminders) {
    const el = document.querySelector(`.day[data-date="${date}"]`);
    if (!el) continue; // pertenece a otro año/render distinto
    const list = reminders[date] || [];
    if (list.length === 0) continue;

    el.classList.add("has-reminders");
    const chips = el.querySelector(".chips");
    chips.innerHTML = ""; // limpiar
    list.slice(0, 2).forEach(r => {
      const chip = document.createElement("div");
      chip.className = "chip";
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

/* -------------------------
   EVENTOS Y UI (inicialización)
   ------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  // elementos
  const sidebar = document.getElementById("sidebar");
  const toggleBtn = document.getElementById("toggleSidebar");
  const prev = document.getElementById("prevYear");
  const next = document.getElementById("nextYear");
  const goToday = document.getElementById("goToday");
  const modal = document.getElementById("reminderModal");
  const closeBtn = document.getElementById("closeModal");
  const form = document.getElementById("reminderForm");
  const remindersListEl = document.getElementById("remindersList");

  // Render inicial
  renderYear(currentYear);

  // Controles año
  if (prev) prev.addEventListener("click", () => { currentYear--; renderYear(currentYear); });
  if (next) next.addEventListener("click", () => { currentYear++; renderYear(currentYear); });
  if (goToday) goToday.addEventListener("click", () => {
    currentYear = new Date().getFullYear();
    renderYear(currentYear);
    // scroll al mes actual si existe
    const m = new Date().getMonth() + 1;
    const anchor = document.getElementById(`m${m}`);
    if (anchor) anchor.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  // Modal open/close
  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (modal) modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
  // ESC cierra modal
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (modal && modal.classList.contains("open")) closeModal();
    }
  });

  // Form submit -> guardar
  if (form) form.addEventListener("submit", saveReminder);

  // Delegación para eliminar (botones creados dinámicamente)
  if (remindersListEl) {
    remindersListEl.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-idx]");
      if (btn) {
        const idx = parseInt(btn.dataset.idx, 10);
        if (!Number.isNaN(idx) && selectedDate) deleteReminderByIndex(selectedDate, idx);
      }
      // botón con clase .del-btn
      const delBtn = e.target.closest(".del-btn");
      if (delBtn && delBtn.dataset.idx !== undefined && selectedDate) {
        const idx2 = parseInt(delBtn.dataset.idx, 10);
        if (!Number.isNaN(idx2)) deleteReminderByIndex(selectedDate, idx2);
      }
    });
  }

  // Sidebar: comportamiento solicitado
  // - Clic dentro de sidebar => expandir (quitar 'collapsed')
  // - Clic fuera => colapsar (añadir 'collapsed')
  // - El botón #toggleSidebar sigue funcionando como toggle y evita propagación
  if (toggleBtn) {
    toggleBtn.addEventListener("click", (e) => {
      e.stopPropagation(); // evitar que el document click lo vea como "fuera"
      sidebar.classList.toggle("collapsed");
    });
  }

  // Clic en documento: si no es dentro de la sidebar, colapsar; si dentro, expandir.
  document.addEventListener("click", (e) => {
    const target = e.target;
    if (!sidebar) return;
    if (sidebar.contains(target)) {
      // Si hago click dentro de la sidebar, me aseguro que esté expandida
      sidebar.classList.remove("collapsed");
    } else {
      // Cualquier click fuera -> colapsar
      sidebar.classList.add("collapsed");
    }
  });

  // Evitar que clicks en botones del calendario (p. ej. year controls) "expandan" la sidebar
  // (no estrictamente necesario, pero previene parpadeos si usas botones en la misma área)
  const uiButtons = document.querySelectorAll(".ghost-btn, .pill-btn, #prevYear, #nextYear, #goToday");
  uiButtons.forEach(b => b.addEventListener("click", (e) => {
    // no stopPropagation: permitimos que el document listener colapse si el click fue fuera
    // pero evitar efectos raros: si quieres que esos botones no colapsen, puedes stopPropagation aquí.
  }));
});

/* -------------------------
   UTIL: escapeHtml (para evitar inyección de HTML por entrada del usuario)
   ------------------------- */
function escapeHtml(str) {
  if (!str && str !== "") return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}