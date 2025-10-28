// Registro.js
// Maneja login, registro y redirección

document.addEventListener('DOMContentLoaded', () => {
  const registerLink = document.getElementById('registerLink');
  const modal = document.getElementById('registerModal');
  const closeModal = document.getElementById('closeModal');
  const registerForm = document.getElementById('registerForm');

  // Abrir modal de registro
  if (registerLink) {
    registerLink.addEventListener('click', (e) => {
      e.preventDefault();
      modal.style.display = 'block';
    });
  }

  // Cerrar modal
  if (closeModal) {
    closeModal.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  }

  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });

  // Manejar registro
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nombre = document.getElementById('nombre').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('passwordReg').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      const rol = document.getElementById('rol').value;

      if (password !== confirmPassword) {
        alert('Las contraseñas no coinciden.');
        return;
      }

      if (!rol) {
        alert('Selecciona un rol.');
        return;
      }

      // Simular registro
      const userData = { nombre, email, rol };
      localStorage.setItem('udem_user_data', JSON.stringify(userData));
      localStorage.setItem('udem_user_role', rol);

      alert('Registro exitoso. Ahora puedes iniciar sesión.');
      modal.style.display = 'none';
      registerForm.reset();
    });
  }

  // Redirección al menú principal con botones de login (tu JS simple integrado)
  const botones = document.querySelectorAll('.login-btn');
  botones.forEach(boton => {
    boton.addEventListener('click', (e) => {
      e.preventDefault();
      // Simular verificación de login antes de redirigir
      const usuario = document.getElementById('usuario')?.value;
      const password = document.getElementById('password')?.value;
      const storedData = JSON.parse(localStorage.getItem('udem_user_data') || '{}');

      if (storedData.email === usuario && password) { // Verificación simple
        window.location.href = 'menu_principal.html';
      } else {
        alert('Usuario o contraseña incorrectos.');
      }
    });
  });
});