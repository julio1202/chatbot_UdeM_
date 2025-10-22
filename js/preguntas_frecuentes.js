// preguntas_frecuentes.js
// Versión mejorada — con accesibilidad, UX, rendimiento y funcionalidades adicionales.

(function () {
  'use strict';

  const LS_FAQ_KEY = 'udem_faq_state';
  const LS_SIDEBAR_KEY = 'udem_sidebar_collapsed';
  const LS_THEME_KEY = 'udem_theme';

  let isDarkMode = localStorage.getItem(LS_THEME_KEY) === 'dark';
  let faqState = JSON.parse(localStorage.getItem(LS_FAQ_KEY) || '{}');

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

  // --- Sidebar ---
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

  // --- FAQ ---
  const faqContainer = document.querySelector('.faq');
  if (faqContainer) {
    const questions = faqContainer.querySelectorAll('.faq-question');

    const saveFaqState = () => {
      localStorage.setItem(LS_FAQ_KEY, JSON.stringify(faqState));
    };

    const closeAll = (except = null) => {
      questions.forEach((q) => {
        if (q === except) return;
        const id = q.getAttribute('aria-controls');
        q.setAttribute('aria-expanded', 'false');
        faqState[id] = false;
        const ans = document.getElementById(id);
        if (ans) {
          ans.hidden = true;
          ans.classList.remove('open');
        }
      });
      saveFaqState();
    };

    const toggleFaq = (q) => {
      try {
        const id = q.getAttribute('aria-controls');
        const expanded = q.getAttribute('aria-expanded') === 'true';
        if (!expanded) {
          closeAll(q);
          q.setAttribute('aria-expanded', 'true');
          faqState[id] = true;
          const ans = document.getElementById(id);
          if (ans) {
            ans.hidden = false;
            ans.classList.add('open');
          }
        } else {
          q.setAttribute('aria-expanded', 'false');
          faqState[id] = false;
          const ans = document.getElementById(id);
          if (ans) {
            ans.hidden = true;
            ans.classList.remove('open');
          }
        }
        saveFaqState();
      } catch (error) {
        console.warn('Error toggling FAQ:', error);
      }
    };

    // Restaurar estado de FAQ
    questions.forEach((q) => {
      const id = q.getAttribute('aria-controls');
      if (faqState[id]) {
        toggleFaq(q);
      }

      const throttledToggle = throttle(() => toggleFaq(q), 300);
      q.addEventListener('click', throttledToggle);
      q.addEventListener('keydown', (e) => {
        if (isEnterOrSpace(e)) {
          throttledToggle();
          e.preventDefault();
        }
      });
    });

    // Navegación por flechas (opcional, para mejor UX)
    faqContainer.addEventListener('keydown', (e) => {
      const activeElement = document.activeElement;
      if (!activeElement.classList.contains('faq-question')) return;

      const questionsArray = Array.from(questions);
      const currentIndex = questionsArray.indexOf(activeElement);

      if (e.key === 'ArrowDown' && currentIndex < questionsArray.length - 1) {
        questionsArray[currentIndex + 1].focus();
        e.preventDefault();
      } else if (e.key === 'ArrowUp' && currentIndex > 0) {
        questionsArray[currentIndex - 1].focus();
        e.preventDefault();
      }
    });
  }

  // --- Settings (modo oscuro) ---
  const settingsLinks = document.querySelectorAll('.settings a');
  if (settingsLinks.length > 0) {
    // Asumiendo que el primer link es para tema (puedes ajustar)
    settingsLinks[0].addEventListener('click', (e) => {
      e.preventDefault();
      toggleTheme();
    });
  }

  // Inicialización completa
  console.log('preguntas_frecuentes.js loaded successfully');
})();
