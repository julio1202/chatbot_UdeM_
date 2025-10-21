// Comportamiento JS para preguntas_frecuentes.html
(function () {
  const isEnterOrSpace = (e) => e.key === 'Enter' || e.key === ' ';

  // ----- Menu toggle -----
  const menuToggle = document.getElementById('menu-toggle');
  const mainMenu = document.getElementById('main-menu');

  if (menuToggle && mainMenu) {
    const openMenu = () => {
      menuToggle.setAttribute('aria-expanded', 'true');
      mainMenu.setAttribute('aria-hidden', 'false');
      mainMenu.classList.add('open');
      const firstLink = mainMenu.querySelector('a');
      if (firstLink) firstLink.focus();
    };

    const closeMenu = () => {
      menuToggle.setAttribute('aria-expanded', 'false');
      mainMenu.setAttribute('aria-hidden', 'true');
      mainMenu.classList.remove('open');
    };

    menuToggle.addEventListener('click', (e) => {
      const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
      expanded ? closeMenu() : openMenu();
      e.stopPropagation();
    });

    document.addEventListener('click', (e) => {
      if (menuToggle.getAttribute('aria-expanded') === 'true') {
        const path = e.composedPath();
        if (!path.includes(mainMenu) && !path.includes(menuToggle)) {
          closeMenu();
        }
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
        closeMenu();
        menuToggle.focus();
      }
    });
  }

  // ----- FAQ accordion -----
  const faqContainer = document.querySelector('.faq');
  if (faqContainer) {
    const questions = faqContainer.querySelectorAll('.faq-question');

    const closeAll = (except = null) => {
      questions.forEach((q) => {
        if (q === except) return;
        q.setAttribute('aria-expanded', 'false');
        const ans = document.getElementById(q.getAttribute('aria-controls'));
        if (ans) {
          ans.hidden = true;
          ans.classList.remove('open');
        }
      });
    };

    questions.forEach((q, idx) => {
      const ans = document.getElementById(q.getAttribute('aria-controls'));

      const toggle = () => {
        const expanded = q.getAttribute('aria-expanded') === 'true';
        if (!expanded) {
          closeAll(q);
          q.setAttribute('aria-expanded', 'true');
          if (ans) {
            ans.hidden = false;
            ans.classList.add('open');
          }
        } else {
          q.setAttribute('aria-expanded', 'false');
          if (ans) {
            ans.hidden = true;
            ans.classList.remove('open');
            }
        }
      };

      q.addEventListener('click', toggle);
      q.addEventListener('keydown', (e) => {
        if (isEnterOrSpace(e)) {
          toggle();
          e.preventDefault();
        }
      });
    });
  }
})();