// material_estudio.js
// Versión básica — con sidebar colapsable, modo oscuro, persistencia y scroll suave para subsidebar.

(function () {
  'use strict';

  const LS_SIDEBAR_KEY = 'udem_sidebar_collapsed';
  const LS_THEME_KEY = 'udem_theme';

  let isDarkMode = localStorage.getItem(LS_THEME_KEY) === 'dark';

  // Helpers
  const isEnterOrSpace = (e) => e.key === 'Enter' || e.key === ' ';
  const throttle = (func, limit) => {
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
  };

  // Modo oscuro
  const toggleTheme = () => {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode', isDarkMode);
    localStorage.setItem(LS_THEME_KEY, isDarkMode ? 'dark' : 'light');
  };

  // Aplicar tema inicial
  document.body.classList.toggle('dark-mode', isDarkMode);

  // --- Sidebar principal ---
  const sidebar = document.getElementById('sidebar');
  const collapseBtn = document.getElementById('collapse-btn');

  if (collapseBtn && sidebar) {
    // Restaurar estado de sidebar
    const isCollapsed = localStorage.getItem(LS_SIDEBAR_KEY) === 'true';
    if (isCollapsed) sidebar.classList.add('collapsed');

    const toggleSidebar = throttle(() => {
      sidebar.classList.toggle('collapsed');
      localStorage.setItem(LS_SIDEBAR_KEY, sidebar.classList.contains('collapsed'));
    }, 300);

    collapseBtn.addEventListener('click', toggleSidebar);
    collapseBtn.addEventListener('keydown', (e) => {
      if (isEnterOrSpace(e)) {
        toggleSidebar();
        e.preventDefault();
      }
    });

    // Auto-colapso en móviles
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const handleResize = (e) => {
      if (e.matches) {
        sidebar.classList.add('collapsed');
        localStorage.setItem(LS_SIDEBAR_KEY, 'true');
      }
    };
    mediaQuery.addEventListener('change', handleResize);
    handleResize(mediaQuery); // Inicial
  }

  // --- Subsidebar (scroll suave a secciones) ---
  const subsidebarLinks = document.querySelectorAll('.subsidebar a');
  subsidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href').substring(1);
      const targetSection = document.getElementById(targetId);
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // --- Settings (modo oscuro) ---
  const settingsLinks = document.querySelectorAll('.settings a');
  if (settingsLinks.length > 0) {
    settingsLinks[0].addEventListener('click', (e) => {
      e.preventDefault();
      toggleTheme();
    });
  }

  // Inicialización completa
  console.log('material_estudio.js loaded successfully');
})();