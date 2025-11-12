document.addEventListener("DOMContentLoaded", () => {
  const subjectsList = document.getElementById("subjectsList");
  const subjectTitle = document.getElementById("subjectTitle");
  const gradesBody = document.getElementById("gradesBody");
  const finalAverageCell = document.getElementById("finalAverage");

  // Datos simulados de ejemplo (puedes reemplazar con datos del backend)
  const subjectsData = {
    "Fundamentos de software": [
      { item: "Actividad 1", grade: 4.8, perc: 20 },
      { item: "Actividad 2", grade: 4.5, perc: 30 },
      { item: "Examen final", grade: 4.2, perc: 50 }
    ],
    "Modelos de datos": [
      { item: "Taller 1", grade: 4.0, perc: 25 },
      { item: "Proyecto final", grade: 4.7, perc: 75 }
    ],
    "Física II": [
      { item: "Laboratorio", grade: 4.6, perc: 40 },
      { item: "Examen final", grade: 4.1, perc: 60 }
    ],
    "Cálculo de Varias Variables": [
      { item: "Parcial 1", grade: 3.9, perc: 40 },
      { item: "Parcial 2", grade: 4.3, perc: 60 }
    ],
    "Legislación": [
      { item: "Ensayo", grade: 4.8, perc: 50 },
      { item: "Exposición", grade: 5.0, perc: 50 }
    ]
  };

  let currentSubject = "Fundamentos de software";

  function renderGrades() {
    gradesBody.innerHTML = "";
    const data = subjectsData[currentSubject] || [];
    let finalAverage = 0;

    data.forEach(row => {
      const total = (row.grade * row.perc) / 100;
      finalAverage += total;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${row.item}</td>
        <td>${row.grade.toFixed(1)}</td>
        <td>${row.perc}%</td>
        <td>${total.toFixed(2)}</td>
      `;
      gradesBody.appendChild(tr);
    });

    finalAverageCell.textContent = finalAverage.toFixed(2);
  }

  // Cambiar materia seleccionada
  subjectsList.addEventListener("click", (e) => {
    const li = e.target.closest("li");
    if (!li) return;

    subjectsList.querySelectorAll("li").forEach(li => li.classList.remove("active"));
    li.classList.add("active");
    currentSubject = li.dataset.name;
    subjectTitle.textContent = currentSubject;
    renderGrades();
  });

  // Inicialización
  renderGrades();
});
