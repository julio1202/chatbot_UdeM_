// Registro.js
document.addEventListener('DOMContentLoaded', () => {
    const botones = document.querySelectorAll('.login-btn'); // <--- aquí
    botones.forEach(boton => {
        boton.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'menu_principal.html';
        });
    });
});
