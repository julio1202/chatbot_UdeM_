const sidebar = document.getElementById("sidebar");
const mainContent = document.getElementById("mainContent");

// Clic fuera de la sidebar → colapsa
mainContent.addEventListener("click", () => {
  sidebar.classList.add("collapsed");
});

// Clic en la sidebar → expande
sidebar.addEventListener("click", () => {
  sidebar.classList.remove("collapsed");
});