(function () {
  'use strict';

  const LS_THEME = 'udem_theme';
  const LS_SIDEBAR = 'udem_sidebar_state';
  const body = document.body;
  const sidebar = document.getElementById('sidebar');
  const themeToggle = document.getElementById('theme-toggle');
  const collapseBtn = document.getElementById('collapse-btn');
  const pendingCasesList = document.getElementById('pendingCasesList');

  // Verificación de login
  const storedRole = localStorage.getItem('udem_user_role');
  if (storedRole !== 'advisor') {
    alert('Acceso denegado.');
    window.location.href = 'index.html';
    return;
  }

  // Tema y sidebar
  const savedTheme = localStorage.getItem(LS_THEME);
  if (savedTheme === 'dark') body.classList.add('dark-mode');
  const isCollapsed = localStorage.getItem(LS_SIDEBAR) === 'true';
  if (isCollapsed) sidebar.classList.add('collapsed');

  themeToggle.addEventListener('click', (e) => {
    e.preventDefault();
    body.classList.toggle('dark-mode');
    localStorage.setItem(LS_THEME, body.classList.contains('dark-mode') ? 'dark' : 'light');
  });

  collapseBtn.addEventListener('click', (e) => {
    e.preventDefault();
    sidebar.classList.toggle('collapsed');
    localStorage.setItem(LS_SIDEBAR, sidebar.classList.contains('collapsed'));
  });

  // Cargar casos pendientes
  async function loadPendingCases() {
    try {
      const res = await fetch('/api/conversations');
      const conversations = await res.json();
      pendingCasesList.innerHTML = '';
      conversations.forEach(conv => {
        if (conv.status === 'active' || conv.status === 'transferred') {
          const div = document.createElement('div');
          div.className = 'case';
          div.innerHTML = `
            <h3>ID: ${conv.id}</h3>
            <p><strong>Usuario:</strong> ${conv.user_id}</p>
            <p><strong>Estado:</strong> ${conv.status}</p>
            <p><strong>Fecha:</strong> ${conv.started_at}</p>
            <button onclick="closeCase(${conv.id})">Cerrar Caso</button>
          `;
          pendingCasesList.appendChild(div);
        }
      });
    } catch (err) {
      console.error('Error cargando casos pendientes:', err);
    }
  }

  window.closeCase = async (id) => {
    try {
      await fetch(`/api/conversations/close/${id}`, { method: 'PUT' });
      alert('Caso cerrado.');
      loadPendingCases();
    } catch (err) {
      console.error('Error cerrando caso:', err);
    }
  };

  loadPendingCases();
})();