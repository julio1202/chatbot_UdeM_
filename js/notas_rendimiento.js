document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById("sidebar");
  const subjects = document.getElementById("subjects");
  const subjectsList = document.getElementById("subjectsList");
  const subjectTitle = document.getElementById("subjectTitle");
  const gradesBody = document.getElementById("gradesBody");
  const finalAverageCell = document.getElementById("finalAverage");

  const addGradeBtn = document.getElementById("addGradeBtn");
  const addSubjectBtn = document.getElementById("addSubjectBtn");

  // Datos iniciales en memoria
  let subjectsData = {
    "Fundamentos de software": [
      { item: "Actividad 1", grade: 5.0, perc: 20 },
      { item: "Actividad 2", grade: 5.0, perc: 20 },
      { item: "Examen", grade: 5.0, perc: 60 }
    ],
    "Modelos de datos": [],
    "Física II": [],
    "Cálculo de Varias Variables": [],
    "Legislación": []
  };

  let currentSubject = "Fundamentos de software";

  // Renderizar tabla de notas
  function renderGrades() {
    gradesBody.innerHTML = "";
    (subjectsData[currentSubject] || []).forEach((row) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td contenteditable="true" class="item-name">${row.item}</td>
        <td><input class="grade-input" type="number" min="0" max="5" step="0.1" value="${row.grade}"></td>
        <td><input class="perc-input" type="number" min="0" max="100" step="1" value="${row.perc}"></td>
        <td class="total">—</td>
        <td><button class="delete-item-btn">✘</button></td>
      `;
      gradesBody.appendChild(tr);
    });
    attachInputsListeners();
    calculateTotals();
  }

  // Cálculo de promedios
  function calculateTotals() {
    const rows = gradesBody.querySelectorAll("tr");
    let finalAverage = 0, totalPercentage = 0;
    const newData = [];

    rows.forEach(row => {
      const item = row.querySelector(".item-name").textContent.trim();
      const gradeInput = row.querySelector(".grade-input");
      const percInput = row.querySelector(".perc-input");
      const totalCell = row.querySelector(".total");

      let grade = parseFloat(gradeInput.value.replace(",", ".")) || 0;
      if (grade > 5) grade = 5;
      if (grade < 0) grade = 0;
      gradeInput.value = grade.toFixed(1);

      let perc = parseFloat(percInput.value) || 0;
      if (perc > 100) perc = 100;
      if (perc < 0) perc = 0;
      percInput.value = perc;

      const weighted = (grade * perc) / 100;
      totalCell.textContent = weighted.toFixed(2);

      finalAverage += weighted;
      totalPercentage += perc;

      newData.push({ item, grade, perc });
    });

    subjectsData[currentSubject] = newData;

    if (totalPercentage === 100) {
      finalAverageCell.textContent = finalAverage.toFixed(2);
    } else {
      const diff = 100 - totalPercentage;
      finalAverageCell.textContent =
        `${finalAverage.toFixed(2)} (⚠ ${diff > 0 ? "faltan " + diff : "exceso " + Math.abs(diff)}%)`;
    }
  }

  function attachInputsListeners() {
    gradesBody.querySelectorAll(".grade-input, .perc-input, .item-name").forEach(inp => {
      inp.addEventListener("input", calculateTotals);
    });
  }

  // Cambio de materia
  subjectsList.addEventListener("click", e => {
    if (e.target.tagName === "LI" || e.target.closest("li")) {
      const li = e.target.closest("li");
      if (!li.classList.contains("delete-btn")) {
        subjectsList.querySelectorAll("li").forEach(li => li.classList.remove("active"));
        li.classList.add("active");
        currentSubject = li.dataset.name;
        subjectTitle.textContent = currentSubject;
        renderGrades();
      }
    }
  });

  // Doble click para editar nombre de materia
  subjectsList.addEventListener("dblclick", e => {
    if (e.target.tagName === "LI") {
      const oldName = e.target.dataset.name;
      const newName = prompt("Editar nombre de la materia:", oldName);
      if (newName && newName.trim() !== "") {
        subjectsData[newName] = subjectsData[oldName];
        delete subjectsData[oldName];
        e.target.innerHTML = `${newName} <button class="delete-btn">✘</button>`;
        e.target.dataset.name = newName;
        if (currentSubject === oldName) {
          currentSubject = newName;
          subjectTitle.textContent = newName;
          renderGrades();
        }
      }
    }
  });

  // Eliminar materia
  subjectsList.addEventListener("click", e => {
    if (e.target.classList.contains("delete-btn")) {
      const li = e.target.closest("li");
      const name = li.dataset.name;

      if (confirm(`¿Seguro que quieres eliminar la materia "${name}"?`)) {
        delete subjectsData[name];
        li.remove();

        // Si eliminamos la materia activa → pasar a la primera
        if (currentSubject === name) {
          const firstLi = subjectsList.querySelector("li");
          if (firstLi) {
            currentSubject = firstLi.dataset.name;
            firstLi.classList.add("active");
            subjectTitle.textContent = currentSubject;
            renderGrades();
          } else {
            currentSubject = null;
            subjectTitle.textContent = "Sin materia";
            gradesBody.innerHTML = "";
            finalAverageCell.textContent = "—";
          }
        }
      }
    }
  });

  // Eliminar ítem de nota
  gradesBody.addEventListener("click", e => {
    if (e.target.classList.contains("delete-item-btn")) {
      const row = e.target.closest("tr");
      const index = Array.from(gradesBody.children).indexOf(row);

      if (confirm("¿Seguro que quieres eliminar esta nota?")) {
        subjectsData[currentSubject].splice(index, 1);
        row.remove();
        calculateTotals();
      }
    }
  });

  // Agregar nueva nota
  addGradeBtn.addEventListener("click", () => {
    subjectsData[currentSubject].push({ item: "Nuevo ítem", grade: 0, perc: 0 });
    renderGrades();
  });

  // Agregar nueva materia
  addSubjectBtn.addEventListener("click", () => {
    const name = prompt("Nombre de la nueva materia:");
    if (name && !subjectsData[name]) {
      subjectsData[name] = [];
      const li = document.createElement("li");
      li.innerHTML = `${name} <button class="delete-btn">❌</button>`;
      li.dataset.name = name;
      subjectsList.appendChild(li);
    }
  });

  // Cerrar sidebar al hacer click fuera
  document.addEventListener("click", (e) => {
    if (!sidebar.contains(e.target) && !subjects.contains(e.target)) {
      sidebar.classList.add("collapsed");
    } else {
      sidebar.classList.remove("collapsed");
    }
  });

  // Inicialización
  renderGrades();
});