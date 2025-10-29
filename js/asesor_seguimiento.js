// asesor_seguimiento.js
// Sidebar colapsable + modo oscuro + dashboard de asesor con verificación de login

(function () {
  'use strict';

  const LS_THEME = 'udem_theme';
  const LS_SIDEBAR = 'udem_sidebar_state';
  const body = document.body;
  const sidebar = document.getElementById('sidebar');
  const themeToggle = document.getElementById('theme-toggle');
  const collapseBtn = document.getElementById('collapse-btn');

  // Elementos del dashboard
  const dashboardSection = document.getElementById('dashboardSection');
  const responseForm = document.getElementById('responseForm');
  const conversationsList = document.getElementById('conversationsList');
  const toggleAvailabilityBtn = document.getElementById('toggleAvailability');
  const availabilityStatus = document.getElementById('availabilityStatus');
  const closeConversationBtn = document.getElementById('closeConversationBtn');
  const logoutBtn = document.getElementById('logoutBtn');

  let currentAdvisor = null;

  // === Verificación de login al cargar ===
  const storedUser = JSON.parse(localStorage.getItem('udem_user_data') || '{}');
  const storedRole = localStorage.getItem('udem_user_role');
  if (!storedUser.email || storedRole !== 'advisor') {
    alert('Debes iniciar sesión como asesor primero.');
    window.location.href = 'index.html';  // Redirige al login principal
    return;
  }
  currentAdvisor = storedUser;  // Asume que el usuario ya está logueado

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

  // === Cargar dashboard al inicio ===
  loadConversations();
  loadAvailability();

  // === Cargar conversaciones activas ===
  async function loadConversations() {
    try {
      const res = await fetch('/api/conversations');
      const conversations = await res.json();
      conversationsList.innerHTML = '';
      conversations.forEach(conv => {
        if (conv.status === 'active' || conv.status === 'transferred') {
          const div = document.createElement('div');
          div.className = 'conversation';
          div.innerHTML = `<strong>ID: ${conv.id}</strong> - Usuario: ${conv.user_id} - Estado: ${conv.status}`;
          div.addEventListener('click', () => selectConversation(conv.id));
          conversationsList.appendChild(div);
        }
      });
    } catch (err) {
      console.error('Error cargando conversaciones:', err);
    }
  }

  // === Seleccionar conversación ===
  function selectConversation(id) {
    document.getElementById('conversationId').value = id;
  }

  // === Enviar respuesta ===
  responseForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const conversationId = document.getElementById('conversationId').value;
    const message = document.getElementById('responseMessage').value;

    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, sender: 'advisor', messageText: message })
      });
      alert('Respuesta enviada.');
      responseForm.reset();
      loadConversations();
    } catch (err) {
      console.error('Error enviando respuesta:', err);
      alert('Error al enviar respuesta.');
    }
  });

  // === Gestionar disponibilidad ===
  async function loadAvailability() {
    try {
      const res = await fetch('/api/advisors');
      const advisors = await res.json();
      const advisor = advisors.find(a => a.advisor_id === currentAdvisor.id);
      availabilityStatus.textContent = advisor ? `Disponibilidad: ${advisor.is_available ? 'Disponible' : 'No disponible'}` : 'No configurado';
    } catch (err) {
      console.error('Error cargando disponibilidad:', err);
    }
  }

  toggleAvailabilityBtn.addEventListener('click', async () => {
    try {
      const res = await fetch(`/api/advisors/${currentAdvisor.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: !currentAdvisor.is_available })
      });
      const updated = await res.json();
      availabilityStatus.textContent = `Disponibilidad: ${updated.is_available ? 'Disponible' : 'No disponible'}`;
    } catch (err) {
      console.error('Error cambiando disponibilidad:', err);
    }
  });

  // === Cerrar conversación ===
  closeConversationBtn.addEventListener('click', async () => {
    const conversationId = document.getElementById('conversationId').value;
    if (!conversationId) {
      alert('Selecciona una conversación primero.');
      return;
    }

    try {
      await fetch(`/api/conversations/close/${conversationId}`, { method: 'PUT' });
      alert('Conversación cerrada.');
      loadConversations();
    } catch (err) {
      console.error('Error cerrando conversación:', err);
      alert('Error al cerrar conversación.');
    }
  });

  // === Cerrar sesión ===
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('udem_user_data');
    localStorage.removeItem('udem_user_role');
    window.location.href = 'index.html';  // Redirige al login principal
  });

  console.log('asesor_seguimiento.js');
})();