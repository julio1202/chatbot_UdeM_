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

  // Manejar login con redirección basada en rol
  const loginForm = document.getElementById('loginForm');
  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const usuario = document.getElementById('usuario').value.trim();
    const password = document.getElementById('password').value;

    console.log('Enviando login:', { email: usuario, password });

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: usuario, password })
      });

      console.log('Status de respuesta:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error de respuesta:', errorText);
        alert('Login fallido: ' + errorText);
        return;
      }

      const data = await response.json();
      console.log('Respuesta completa:', data);

      if (!data.role) {
        console.error('No se recibió rol. Respuesta:', data);
        alert('Error: No se pudo determinar el rol. Verifica con el administrador.');
        return;
      }

      localStorage.setItem('udem_token', data.token || 'logged_in');
      localStorage.setItem('udem_user_role', data.role);

      let redirectUrl;
      switch (data.role) {
        case 'student':
          redirectUrl = 'menu_principal.html';
          break;
        case 'professor':
          redirectUrl = 'notas_rendimiento.html';
          break;
        case 'advisor':
          redirectUrl = 'asesor_seguimiento.html';
          break;
        default:
          redirectUrl = 'menu_principal.html';
      }

      console.log('Redirigiendo a:', redirectUrl);
      alert('Login exitoso. Redirigiendo a ' + redirectUrl);  // Temporal para confirmar
      window.location.href = redirectUrl;
    } catch (err) {
      console.error('Error en fetch:', err);
      alert('Error de conexión. Revisa la consola.');
    }
  });
});