// Registro.js
document.addEventListener('DOMContentLoaded', () => {
  const registerLink = document.getElementById('registerLink');
  const modal = document.getElementById('registerModal');
  const closeModal = document.getElementById('closeModal');
  const registerForm = document.getElementById('registerForm');

  // Abrir modal de registro
  registerLink?.addEventListener('click', (e) => {
    e.preventDefault();
    modal.style.display = 'block';
  });

  // Cerrar modal
  closeModal?.addEventListener('click', () => modal.style.display = 'none');
  window.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
  });

  // Manejar registro
  registerForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const idUsuario = document.getElementById('idUsuario').value.trim();
    const nombre = document.getElementById('nombre').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('passwordReg').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const rol = document.getElementById('rol').value;

    if (!idUsuario) {
      alert('Por favor ingresa tu ID de usuario.');
      return;
    }

    if (password !== confirmPassword) {
      alert('Las contraseñas no coinciden.');
      return;
    }

    if (!rol) {
      alert('Selecciona un rol.');
      return;
    }

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: idUsuario,
          name: nombre,
          email: email,
          password: password,
          role: rol
        })
      });

      if (!response.ok) throw new Error('Error en el registro: ' + response.statusText);

      const data = await response.json();
      console.log('Usuario creado:', data);

      localStorage.setItem('udem_user_data', JSON.stringify({ idUsuario, nombre, email, rol }));
      alert('Registro exitoso. Ahora puedes iniciar sesión.');

      modal.style.display = 'none';
      registerForm.reset();
    } catch (err) {
      console.error('Error:', err);
      alert('Error al registrar usuario. Revisa la consola para más detalles.');
    }
  });

  // Manejar login
  const loginForm = document.getElementById('loginForm');
  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const usuario = document.getElementById('usuario').value.trim();
    const password = document.getElementById('password').value;

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: usuario, password })
      });

      if (!response.ok) throw new Error('Login fallido.');

      const data = await response.json();
      localStorage.setItem('udem_token', data.token || 'logged_in');
      localStorage.setItem('udem_user_role', data.role || 'unknown');
      window.location.href = 'menu_principal.html';
    } catch (err) {
      console.error('Error en login:', err);
      const storedData = JSON.parse(localStorage.getItem('udem_user_data') || '{}');
      if (storedData.email === usuario && password) {
        window.location.href = 'menu_principal.html';
      } else {
        alert('Usuario o contraseña incorrectos.');
      }
    }
  });
});
