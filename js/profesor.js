/**
 * menu_profesor.js
 * Control del sidebar y comportamiento general del Panel del Profesor
 */

// 🔹 Clave de almacenamiento local
const LS_KEY = "udem_sidebar_profesor_state";

// 🔹 Referencias a elementos
const sidebar = document.getElementById("sidebar");
const mainContent = document.getElementById("mainContent");

// 🔹 Crear y agregar botón de colapsar si no existe
let toggleBtn = document.createElement("button");
toggleBtn.id = "sidebarToggle";
toggleBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
toggleBtn.classList.add("toggle-btn");
document.body.appendChild(toggleBtn);

// 🔹 Función: alternar visibilidad del sidebar
function toggleSidebar() {
  sidebar.classList.toggle("collapsed");
  mainContent.classList.toggle("expanded");

  const isCollapsed = sidebar.classList.contains("collapsed");
  localStorage.setItem(LS_KEY, isCollapsed ? "collapsed" : "expanded");
}

// 🔹 Recuperar estado previo al cargar
window.addEventListener("DOMContentLoaded", () => {
  const state = localStorage.getItem(LS_KEY);
  if (state === "collapsed") {
    sidebar.classList.add("collapsed");
    mainContent.classList.add("expanded");
  }
});

// 🔹 Evento del botón toggle
toggleBtn.addEventListener("click", toggleSidebar);

// 🔹 Cerrar sidebar al hacer clic fuera (solo en pantallas pequeñas)
document.addEventListener("click", (event) => {
  if (window.innerWidth <= 768) {
    if (!sidebar.contains(event.target) && !toggleBtn.contains(event.target)) {
      sidebar.classList.add("collapsed");
      mainContent.classList.add("expanded");
    }
  }
});

// 🔹 Animación suave al pasar sobre los íconos del menú
document.querySelectorAll(".menu a").forEach((link) => {
  link.addEventListener("mouseenter", () => {
    link.classList.add("hovered");
  });
  link.addEventListener("mouseleave", () => {
    link.classList.remove("hovered");
  });
});

// 🔹 Resalta el enlace activo (por URL actual)
document.querySelectorAll(".menu a").forEach((link) => {
  if (window.location.href.includes(link.getAttribute("href"))) {
    link.classList.add("active");
  } else {
    link.classList.remove("active");
  }
});
