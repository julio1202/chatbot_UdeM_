// asesor_humano.js
// Sidebar colapsable + modo oscuro + guardado de estado

(function () {
  'use strict';

  const LS_THEME = 'udem_theme';
  const LS_SIDEBAR = 'udem_sidebar_state';
  const body = document.body;
  const sidebar = document.getElementById('sidebar');
  const themeToggle = document.getElementById('theme-toggle');
  const collapseBtn = document.getElementById('collapse-btn');

  // === Restaurar tema guardado ===
  const savedTheme = localStorage.getItem(LS_THEME);
  if (savedTheme === 'dark') body.classList.add('dark-mode');

  // === Restaurar estado del sidebar ===
  const isCollapsed = localStorage.getItem(LS_SIDEBAR) === 'true';
  if (isCollapsed) sidebar.classList.add('collapsed');

  // === Cambiar tema ===
  themeToggle.addEventListener('click', (e) => {
    e.preventDefault();
    body.classList.toggle('dark-mode');
    localStorage.setItem(LS_THEME, body.classList.contains('dark-mode') ? 'dark' : 'light');
  });

  // === Colapsar sidebar ===
  collapseBtn.addEventListener('click', (e) => {
    e.preventDefault();
    sidebar.classList.toggle('collapsed');
    localStorage.setItem(LS_SIDEBAR, sidebar.classList.contains('collapsed'));
  });

  // === Enviar mensaje del formulario (ficticio) ===
  const form = document.querySelector('form');
  const input = document.getElementById('mensaje');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const msg = input.value.trim();
      if (!msg) return;

      const chatSection = form.closest('section').querySelector('div');
      const newMsg = document.createElement('p');
      newMsg.innerHTML = `<strong>Tú:</strong> ${msg}`;
      chatSection.appendChild(newMsg);

      input.value = '';
      chatSection.scrollTop = chatSection.scrollHeight;
    });
  }

  console.log('asesor_humano.js cargado correctamente');
})();
